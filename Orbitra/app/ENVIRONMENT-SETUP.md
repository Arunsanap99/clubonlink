# ClubHub Environment Setup Guide

## 🚀 Quick Start

1. **Copy the environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Fill in your configuration values** (see detailed guide below)

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Start the development server:**
   ```bash
   npm start
   ```

## 📋 Detailed Configuration Guide

### 1. Firebase Setup

**Step 1: Create Firebase Project**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Follow the setup wizard

**Step 2: Get Firebase Config**
1. Go to Project Settings > General
2. Scroll down to "Your apps"
3. Click "Web app" icon to create a web app
4. Copy the config values to your `.env`:

```bash
REACT_APP_FIREBASE_API_KEY=AIzaSyC...
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abc123
REACT_APP_FIREBASE_MEASUREMENT_ID=G-ABC123XYZ
```

**Step 3: Enable Firebase Services**
1. **Authentication**: Go to Authentication > Sign-in method
   - Enable Email/Password
   - Enable Google (optional)
2. **Firestore**: Go to Firestore Database > Create database
   - Start in test mode (we'll add security rules later)
3. **Storage**: Go to Storage > Get started
4. **Cloud Messaging**: Go to Project Settings > Cloud Messaging
   - Generate VAPID key pair
   - Copy VAPID key to `REACT_APP_FCM_VAPID_KEY`

### 2. Cloudinary Setup (for Gallery)

**Step 1: Create Cloudinary Account**
1. Go to [Cloudinary](https://cloudinary.com/)
2. Sign up for free account

**Step 2: Get Configuration**
1. Go to Dashboard
2. Copy values to your `.env`:

```bash
REACT_APP_CLOUDINARY_CLOUD_NAME=your-cloud-name
REACT_APP_CLOUDINARY_API_KEY=123456789012345
```

**Step 3: Create Upload Preset**
1. Go to Settings > Upload
2. Click "Add upload preset"
3. Set to "Unsigned" for client uploads
4. Configure folder structure: `clubhub/clubs/{club_id}/gallery`
5. Copy preset name to `REACT_APP_CLOUDINARY_UPLOAD_PRESET`

### 3. Stripe Setup (for Payments)

**Step 1: Create Stripe Account**
1. Go to [Stripe](https://stripe.com/)
2. Create account and complete verification

**Step 2: Get API Keys**
1. Go to Developers > API keys
2. Copy Publishable key to your `.env`:

```bash
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_51...
```

**Step 3: Set up Webhooks (for Cloud Functions)**
1. Go to Developers > Webhooks
2. Add endpoint: `https://your-region-your-project.cloudfunctions.net/handleStripeWebhook`
3. Select events: `checkout.session.completed`, `invoice.payment_succeeded`
4. Copy webhook secret for Cloud Functions

### 4. Razorpay Setup (Optional - for India)

**Step 1: Create Razorpay Account**
1. Go to [Razorpay](https://razorpay.com/)
2. Complete KYC verification

**Step 2: Get API Keys**
1. Go to Settings > API Keys
2. Generate keys and copy to `.env`:

```bash
REACT_APP_RAZORPAY_KEY_ID=rzp_test_...
```

### 5. Additional Services (Optional)

**Google Maps (for location features):**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Maps JavaScript API
3. Create API key with restrictions
4. Add to `.env`: `REACT_APP_GOOGLE_MAPS_API_KEY`

**Sentry (for error tracking):**
1. Go to [Sentry](https://sentry.io/)
2. Create project
3. Copy DSN to `.env`: `REACT_APP_SENTRY_DSN`

## 🔒 Security Best Practices

### Environment Variables Security

**✅ Safe for Client (REACT_APP_ prefix):**
- Firebase config (public by design)
- Cloudinary cloud name and API key
- Stripe publishable key
- Razorpay key ID
- Google Maps API key (with restrictions)

**❌ Never Expose in Client:**
- Firebase admin SDK keys
- Cloudinary API secret
- Stripe secret key
- Razorpay key secret
- Database passwords
- JWT secrets

### API Key Restrictions

**Firebase:**
- Restrict to your domain in Firebase Console
- Enable App Check for production

**Cloudinary:**
- Set up signed uploads for sensitive content
- Configure upload restrictions

**Stripe:**
- Use test keys in development
- Restrict webhook endpoints

**Google Maps:**
- Restrict to your domain
- Limit to specific APIs

## 🚀 Deployment Configuration

### Development
```bash
NODE_ENV=development
REACT_APP_DEBUG=true
```

### Production
```bash
NODE_ENV=production
REACT_APP_DEBUG=false
GENERATE_SOURCEMAP=false
```

### Environment-Specific Variables

**Vercel:**
```bash
# Add in Vercel dashboard under Environment Variables
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=...
# ... etc
```

**Netlify:**
```bash
# Add in Netlify dashboard under Site settings > Environment variables
REACT_APP_FIREBASE_API_KEY=...
# ... etc
```

**Firebase Hosting:**
```bash
# Use firebase functions:config:set for Cloud Functions
firebase functions:config:set stripe.secret_key="sk_live_..."
firebase functions:config:set cloudinary.api_secret="your-secret"
```

## 🧪 Testing Configuration

### Test Environment Variables
```bash
# Create .env.test
REACT_APP_FIREBASE_PROJECT_ID=your-test-project
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Firebase Emulator
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Start emulators
firebase emulators:start

# Use emulator in tests
REACT_APP_USE_FIREBASE_EMULATOR=true
```

## 🔧 Troubleshooting

### Common Issues

**Firebase Connection:**
```bash
# Check if project ID is correct
# Verify authentication is enabled
# Check Firestore rules
```

**Cloudinary Upload Fails:**
```bash
# Verify upload preset exists
# Check CORS settings
# Ensure preset is unsigned for client uploads
```

**Stripe Payments:**
```bash
# Use test keys in development
# Check webhook endpoint URL
# Verify webhook secret
```

**FCM Notifications:**
```bash
# Check VAPID key is correct
# Verify service worker is registered
# Test in HTTPS environment
```

### Debug Mode

Enable debug logging:
```bash
REACT_APP_DEBUG=true
```

This will show detailed logs for:
- Firebase operations
- Cloudinary uploads
- Payment processing
- Notification delivery

## 📝 Environment Checklist

Before deploying to production:

- [ ] All API keys are configured
- [ ] Firebase security rules are deployed
- [ ] Cloudinary upload presets are secured
- [ ] Stripe webhooks are configured
- [ ] FCM service worker is registered
- [ ] Environment variables are set in hosting platform
- [ ] Debug mode is disabled
- [ ] Source maps are disabled
- [ ] All integrations are tested

## 🆘 Support

If you encounter issues:

1. Check the console for error messages
2. Verify all environment variables are set
3. Test each service individually
4. Check service status pages
5. Review Firebase/Cloudinary/Stripe documentation

For ClubHub-specific issues, check the troubleshooting section in each step's README file.
