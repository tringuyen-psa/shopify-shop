# Stripe Connect Setup Guide

## Problem: "Setup Incomplete - We couldn't complete your Stripe Connect setup"

This error occurs because your Stripe account hasn't been properly configured for Connect. Here's how to fix it:

## Step 1: Configure Your Stripe Account for Connect

### 1.1. Log into your Stripe Dashboard

- Go to [Stripe Dashboard](https://dashboard.stripe.com/)
- Log in with your Stripe account

### 1.2. Enable Connect on Your Account

1. Go to **Settings** → **Connect**
2. Click **"Get started"** or **"Enable Connect"**
3. Fill in the required business information:
   - Business type (Individual, Company, etc.)
   - Business address
   - Bank account for platform payouts
   - Tax information

### 1.3. Get Your Connect Credentials

1. Go to **Settings** → **Connect** → **Platform settings**
2. Find your **Platform ID** (looks like `acct_...`)
3. Go to **Developers** → **API keys**
4. Copy your **Connect Client ID** (looks like `ca_...`)

## Step 2: Update Environment Variables

Replace the placeholder values in your `.env` file:

```bash
# Stripe Connect Configuration
STRIPE_CONNECT_CLIENT_ID=ca_YOUR_ACTUAL_CONNECT_CLIENT_ID
STRIPE_CONNECT_ENABLED=true
STRIPE_PLATFORM_MODE=test  # Change to 'live' for production

# Your existing Stripe config
STRIPE_SECRET_KEY=sk_test_...  # Your existing key
STRIPE_ACCOUNT_ID=acct_...     # Your platform account ID
```

## Step 3: Configure Webhooks

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Add a new webhook endpoint: `https://yourdomain.comwebhooks/stripe-connect`
3. Select these events:
   - `account.updated`
   - `checkout.session.completed`
   - `invoice.paid`
   - `customer.subscription.deleted`
4. Copy the webhook signing secret and update:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_...  # Your actual webhook secret
   ```

## Step 4: Test Integration

### 4.1. Start with Development Mode

Set `STRIPE_CONNECT_ENABLED=false` initially to test with mock accounts.

### 4.2. Create a Test Shop

1. Register a new shop owner account
2. Go through the onboarding process
3. The system will create a mock Connected Account for testing

### 4.3. Enable Real Connect

Once ready:

1. Set `STRIPE_CONNECT_ENABLED=true`
2. Use your real Connect Client ID
3. Test the full KYC flow

## Common Issues & Solutions

### Issue: "You can only create new accounts if you've signed up for Connect"

**Solution:** Complete Step 1 to properly enable Connect on your Stripe account.

### Issue: "Invalid client_id"

**Solution:** Make sure you're using the Connect Client ID (starts with `ca_`), not the regular API key.

### Issue: Webhook verification failed

**Solution:** Double-check your webhook secret and endpoint URL.

## Development Mode vs Production

### Development Mode (Current Setup)

- `STRIPE_CONNECT_ENABLED=false`
- Creates mock Connected Accounts
- No real money transactions
- Good for testing the UI flow

### Production Mode

- `STRIPE_CONNECT_ENABLED=true`
- Real Stripe Connected Accounts
- Real KYC verification
- Actual money movement

## Testing Checklist

- [ ] Stripe Connect enabled on your account
- [ ] Connect Client ID configured
- [ ] Webhook endpoint set up
- [ ] Can create Connected Accounts
- [ ] KYC flow works properly
- [ ] Test payments flow through Connect

## Next Steps

1. Complete the Stripe Connect setup in your dashboard
2. Update the environment variables with real credentials
3. Test with a small amount first
4. Enable for all shops once verified

## Support Resources

- [Stripe Connect Documentation](https://stripe.com/docs/connect)
- [Stripe Connect Testing Guide](https://stripe.com/docs/connect/testing)
- [Platform Settings Guide](https://stripe.com/docs/connect/platform-settings)
