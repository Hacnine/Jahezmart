import { Controller, Post, Body, Get, Query, UseGuards, Request, RawBodyRequest, Headers } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create-checkout-session')
  async createCheckoutSession(
    @Request() req,
    @Body() body: {
      items: Array<{
        productId: string;
        name: string;
        price: number;
        quantity: number;
        image?: string;
      }>;
      successUrl: string;
      cancelUrl: string;
    },
  ) {
    return this.paymentService.createCheckoutSession(
      req.user.id,
      body.items,
      body.successUrl,
      body.cancelUrl,
    );
  }

  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Body() rawBody: Buffer,
  ) {
    return this.paymentService.handleWebhook(rawBody, signature);
  }

  @Get('session-details')
  async getSessionDetails(@Query('session_id') sessionId: string) {
    return this.paymentService.getSessionDetails(sessionId);
  }
}
