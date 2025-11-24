import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class PaymentService {
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    this.stripe = new Stripe(stripeSecretKey);
  }

  async createCheckoutSession(
    userId: string,
    items: Array<{
      productId: string;
      name: string;
      price: number;
      quantity: number;
      image?: string;
    }>,
    successUrl: string,
    cancelUrl: string,
  ) {
    try {
      // Get user details
      const user = await this.authService.getProfile(userId);

      // Create line items for Stripe
      const lineItems = items.map((item) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            images: item.image ? [item.image] : [],
          },
          unit_amount: Math.round(item.price * 100), // Convert to cents
        },
        quantity: item.quantity,
      }));

      // Create checkout session
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        customer_email: user.email,
        success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl,
        metadata: {
          userId: userId,
        },
      });

      return {
        sessionId: session.id,
        url: session.url,
      };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw new BadRequestException('Failed to create checkout session');
    }
  }

  async handleWebhook(rawBody: Buffer, signature: string) {
    const endpointSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');

    if (!endpointSecret) {
      throw new BadRequestException('Webhook secret not configured');
    }

    try {
      const event = this.stripe.webhooks.constructEvent(rawBody, signature, endpointSecret);

      switch (event.type) {
        case 'checkout.session.completed':
          const session = event.data.object as Stripe.Checkout.Session;
          await this.handleSuccessfulPayment(session);
          break;
        case 'payment_intent.payment_failed':
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          await this.handleFailedPayment(paymentIntent);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return { received: true };
    } catch (error) {
      console.error('Webhook error:', error);
      throw new BadRequestException('Webhook signature verification failed');
    }
  }

  private async handleSuccessfulPayment(session: Stripe.Checkout.Session) {
    try {
      const userId = session.metadata?.userId;
      if (!userId) {
        console.error('No userId in session metadata');
        return;
      }

      // Get cart items for the user
      const cartItems = await this.authService.getCart(userId);

      if (!cartItems || cartItems.length === 0) {
        console.error('No cart items found for user:', userId);
        return;
      }

      // Create order from cart items
      const orderItems = cartItems.map((item) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      }));

      const total = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      // Create order
      const order = await this.authService.createOrder(userId, {
        items: orderItems,
        total: total,
        paymentIntentId: session.payment_intent as string,
      });

      // Clear user's cart after successful order
      await this.authService.clearCart(userId);

      console.log('Order created successfully:', order.id);
    } catch (error) {
      console.error('Error handling successful payment:', error);
    }
  }

  private async handleFailedPayment(paymentIntent: Stripe.PaymentIntent) {
    console.log('Payment failed:', paymentIntent.id);
    // Handle failed payment logic here
  }

  async getSessionDetails(sessionId: string) {
    try {
      const session = await this.stripe.checkout.sessions.retrieve(sessionId);
      return {
        id: session.id,
        payment_status: session.payment_status,
        customer_email: session.customer_details?.email,
        amount_total: session.amount_total,
        currency: session.currency,
      };
    } catch (error) {
      console.error('Error retrieving session:', error);
      throw new BadRequestException('Failed to retrieve session details');
    }
  }
}
