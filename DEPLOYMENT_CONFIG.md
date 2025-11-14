# Vercel Deployment Configuration

## Environment Variables Required for Production

You need to add these environment variables in your Vercel project settings:

### Essential Variables

```bash
# Clerk Authentication (Production Keys)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your_production_key_here
CLERK_SECRET_KEY=sk_live_your_production_secret_key_here

# Clerk Configuration URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Database
MONGODB_URI=your_mongodb_atlas_connection_string
MONGODB_DB=togetherflow

# Security
AUTH_SECRET=your_secure_random_string_at_least_32_characters
```

## Steps to Fix Authentication Error

1. **Get Production Clerk Keys**:
   - Go to https://dashboard.clerk.com
   - Switch to Production environment
   - Copy your production keys (pk_live_* and sk_live_*)

2. **Add Environment Variables in Vercel**:
   - Go to your Vercel project dashboard
   - Settings → Environment Variables
   - Add all the variables listed above

3. **Configure Clerk Domain**:
   - In Clerk dashboard, add your Vercel domain
   - Set allowed origins to include your production URL

4. **Redeploy**:
   - After adding environment variables, redeploy your app
   - Or push a new commit to trigger automatic deployment

## Testing Deployment

After deployment, visit:
- `https://your-app.vercel.app/api/health` - Check configuration status
- `https://your-app.vercel.app/sign-in` - Test authentication

## Common Issues

1. **Missing Environment Variables**: Check that all required variables are set
2. **Wrong Clerk Keys**: Ensure you're using production keys (pk_live_*, sk_live_*)
3. **Domain Not Configured**: Add your Vercel domain to Clerk allowed domains
4. **Network Access**: Ensure MongoDB Atlas allows connections from anywhere (0.0.0.0/0)