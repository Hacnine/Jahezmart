# Stripe Payment Integration Setup Guide

This guide will help you set up Stripe payment processing for Jahezmart's checkout system.

## Overview

The application now supports complete Stripe payment integration with:
- ✅ Add to cart functionality (backend persistence)
- ✅ Checkout process with billing details
- ✅ Stripe Checkout session creation
- ✅ Payment processing and order creation
- ✅ Success/failure handling

## Prerequisites

- Stripe account (sign up at https://stripe.com)
- Backend and frontend servers running

---

## 1. Stripe Account Setup

### Step 1: Create Stripe Account
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Sign up for a free account
3. Complete account verification

### Step 2: Get API Keys
1. In your Stripe dashboard, go to **Developers > API keys**
2. Copy your **Publishable key** (starts with `pk_test_` for test mode)
3. Copy your **Secret key** (starts with `sk_test_` for test mode)
4. **Important**: Never share your secret key publicly

### Step 3: Configure Webhooks (Optional but Recommended)
1. Go to **Developers > Webhooks**
2. Click **Add endpoint**
3. Enter endpoint URL: `http://localhost:8000/api/payment/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `payment_intent.payment_failed`
5. Copy the **Webhook signing secret** (starts with `whsec_`)

---

## 2. Backend Configuration

### Update Environment Variables
Open `backend/.env` and replace the placeholder values:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_actual_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_signing_secret_here
```

**Security Note**: In production, use live keys (start with `pk_live_` and `sk_live_`)

---

## 3. Frontend Configuration

### Update Environment Variables
Open `frontend/.env.local` and add:

```env
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key_here
```

---

## 4. Testing the Integration

### Step 1: Start Servers
```bash
# Backend
cd backend
npm run start:dev

# Frontend (new terminal)
cd frontend
npm run dev
```

### Step 2: Test Add to Cart
1. Navigate to `http://localhost:3000/shop`
2. Add items to cart
3. Verify items persist in `/account/cart`

### Step 3: Test Checkout Process
1. Go to `http://localhost:3000/account/cart`
2. Click **Checkout**
3. Fill in billing details
4. Click **Place Order**
5. You should be redirected to Stripe Checkout

### Step 4: Test Payment (Test Mode)
1. On Stripe Checkout page, use test card details:
   - Card number: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/25`)
   - CVC: Any 3 digits (e.g., `123`)
   - Name: Any name
2. Click **Pay**
3. You should be redirected to `/thank-you` with success message

### Step 5: Verify Order Creation
1. Check your Stripe dashboard for the completed payment
2. Verify order appears in `/account/order/orderhistory`
3. Confirm cart is cleared after successful payment

---

## 5. Production Deployment

### Step 1: Switch to Live Mode
1. In Stripe dashboard, toggle **Test mode** off
2. Get live API keys from **Developers > API keys**
3. Update environment variables with live keys

### Step 2: Update Webhook URL
1. Update webhook endpoint to your production URL
2. Update environment variables with production webhook secret

### Step 3: Environment Variables for Production
```env
# Backend .env
STRIPE_SECRET_KEY=sk_live_your_live_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_live_webhook_secret
FRONTEND_URL=https://yourdomain.com

# Frontend .env.local
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
```

---

## 6. Features Overview

### Cart Management
- ✅ Add/remove items from cart
- ✅ Update item quantities
- ✅ Persistent cart storage (backend)
- ✅ Cart synchronization across sessions

### Checkout Process
- ✅ Billing address collection
- ✅ Order summary with calculations
- ✅ Terms and conditions agreement
- ✅ Stripe Checkout integration

### Payment Processing
- ✅ Secure Stripe Checkout sessions
- ✅ Multiple payment methods (cards, wallets)
- ✅ Webhook handling for payment confirmation
- ✅ Automatic order creation on successful payment
- ✅ Cart clearing after successful purchase

### Order Management
- ✅ Order history tracking
- ✅ Order status updates
- ✅ Unique order numbers
- ✅ Order details with item breakdown

---

## 7. Troubleshooting

### Common Issues

#### "STRIPE_SECRET_KEY is not configured"
- Check that `STRIPE_SECRET_KEY` is set in `backend/.env`
- Restart the backend server after adding environment variables

#### "Invalid API Key provided"
- Verify you're using the correct secret key from Stripe dashboard
- Ensure you're not mixing test and live keys

#### Checkout session creation fails
- Check backend logs for detailed error messages
- Verify cart is not empty before checkout
- Ensure user is authenticated

#### Webhook signature verification fails
- Check that `STRIPE_WEBHOOK_SECRET` matches the webhook endpoint secret
- Ensure webhook URL is correct in Stripe dashboard

#### Payment succeeds but order not created
- Check backend logs for webhook processing errors
- Verify database connection
- Check that user ID is correctly extracted from webhook

---

## 8. Security Considerations

### Environment Variables
- Never commit API keys to version control
- Use different keys for development and production
- Rotate keys regularly

### Webhook Security
- Always verify webhook signatures
- Use HTTPS for webhook endpoints in production
- Handle webhook events idempotently

### Payment Data
- Never store sensitive payment information
- Use Stripe's tokenization for secure processing
- Implement proper error handling without exposing sensitive data

---

## 9. Cost Structure

### Stripe Fees (as of 2024)
- **Domestic cards**: 2.9% + $0.30 per transaction
- **International cards**: 3.4% + $0.30 per transaction
- **Additional fees** may apply for currency conversion, disputes, etc.

### Test Mode
- No fees for test transactions
- Use test card numbers provided by Stripe

---

## 10. Support

For issues with Stripe integration:
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com/)
- Check backend/frontend logs for error details
- Test with Stripe's test cards in development

---

## Quick Setup Checklist

- [ ] Create Stripe account
- [ ] Get API keys (publishable + secret)
- [ ] Configure webhook endpoint (optional)
- [ ] Update backend `.env` with Stripe keys
- [ ] Update frontend `.env.local` with publishable key
- [ ] Test add to cart functionality
- [ ] Test checkout process
- [ ] Test payment with test card
- [ ] Verify order creation
- [ ] Deploy to production with live keys