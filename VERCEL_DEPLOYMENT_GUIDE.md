# Complete Vercel Deployment Guide for TogetherFlow

This guide will walk you through deploying your TogetherFlow project on Vercel via GitHub with all features working properly.

## Prerequisites

1. **GitHub Account**: Ensure you have a GitHub account
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com) using your GitHub account
3. **MongoDB Atlas**: Your MongoDB database should be accessible from the internet
4. **Clerk Account**: Your Clerk authentication should be set up

## Step 1: Prepare Your Repository

### 1.1 Push to GitHub

1. **Initialize Git** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Create GitHub Repository**:
   - Go to [github.com](https://github.com)
   - Click "New repository"
   - Name it `togetherflow-app` (or your preferred name)
   - Don't initialize with README (since you already have files)
   - Click "Create repository"

3. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/togetherflow-app.git
   git branch -M main
   git push -u origin main
   ```

### 1.2 Update Your Environment Variables

1. **Review `.env.example`**: Check the template we created
2. **Update your local `.env.local`** with production-ready values
3. **Never commit `.env.local`** to GitHub (it's already in `.gitignore`)

## Step 2: Set Up Clerk for Production

### 2.1 Create Production Instance

1. **Go to Clerk Dashboard**: Visit [dashboard.clerk.com](https://dashboard.clerk.com)
2. **Select Your Application** or create a new one
3. **Switch to Production Environment**:
   - Look for "Development" / "Production" toggle
   - Switch to "Production"
4. **Configure Production Settings**:
   - Set your production domain (will be `https://your-app-name.vercel.app`)
   - Configure allowed redirect URLs
   - Set up any additional settings you need

### 2.2 Get Production API Keys

1. **Go to API Keys section** in Clerk Dashboard
2. **Copy Production Keys**:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (starts with `pk_live_`)
   - `CLERK_SECRET_KEY` (starts with `sk_live_`)

## Step 3: Set Up MongoDB Atlas for Production

### 3.1 Configure Network Access

1. **Go to MongoDB Atlas Dashboard**
2. **Network Access** → **IP Access List**
3. **Add IP Address**:
   - Click "Add IP Address"
   - Select "Allow access from anywhere" (`0.0.0.0/0`)
   - Or add Vercel's IP ranges if you prefer more security

### 3.2 Create Database User

1. **Database Access** → **Database Users**
2. **Add New Database User**:
   - Username: `vercel-user` (or your choice)
   - Password: Generate a strong password
   - Database User Privileges: "Read and write to any database"

### 3.3 Get Connection String

1. **Connect** → **Connect your application**
2. **Copy the connection string**
3. **Replace** `<password>` with your database user password

## Step 4: Deploy to Vercel

### 4.1 Connect GitHub to Vercel

1. **Go to Vercel Dashboard**: Visit [vercel.com/dashboard](https://vercel.com/dashboard)
2. **New Project**: Click "New Project"
3. **Import Git Repository**:
   - Find your `togetherflow-app` repository
   - Click "Import"

### 4.2 Configure Deployment Settings

1. **Framework Preset**: Should auto-detect as "Next.js"
2. **Root Directory**: Leave as `./` (root)
3. **Build and Output Settings**:
   - Build Command: `next build` (should be auto-detected)
   - Output Directory: `.next` (should be auto-detected)
   - Install Command: `npm install` (should be auto-detected)

### 4.3 Add Environment Variables

In the Vercel deployment configuration, add these environment variables:

#### Required Environment Variables:

```bash
# MongoDB
MONGODB_URI=your_mongodb_connection_string_here
MONGODB_DB=togetherflow

# Auth Secret (generate a new secure random string)
AUTH_SECRET=your_long_random_secure_string_here

# Clerk Production Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your_production_key_here
CLERK_SECRET_KEY=sk_live_your_production_secret_here

# Clerk URLs (keep these as is)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
```

#### How to Add Environment Variables in Vercel:

1. **During Initial Deployment**:
   - In the "Environment Variables" section
   - Add each variable name and value
   - Click "Add" for each one

2. **After Deployment**:
   - Go to your project dashboard
   - Settings → Environment Variables
   - Add/edit variables as needed

### 4.4 Deploy

1. **Click "Deploy"**: Vercel will build and deploy your app
2. **Wait for Deployment**: This usually takes 2-5 minutes
3. **Get Your URL**: You'll receive a URL like `https://your-app-name.vercel.app`

## Step 5: Post-Deployment Configuration

### 5.1 Update Clerk with Production URL

1. **Go back to Clerk Dashboard**
2. **Configure Domain**:
   - Add your Vercel URL as an authorized domain
   - Update redirect URLs to use your production domain

### 5.2 Test Your Application

1. **Visit your deployed app**
2. **Test key features**:
   - User registration/login
   - Database operations
   - Real-time features (Socket.IO)
   - Notifications

### 5.3 Set Up Custom Domain (Optional)

1. **In Vercel Dashboard**:
   - Go to your project
   - Settings → Domains
   - Add your custom domain
   - Follow DNS configuration instructions

2. **Update Clerk**:
   - Add your custom domain to Clerk configuration
   - Update redirect URLs

## Step 6: Ongoing Management

### 6.1 Automatic Deployments

- **Any push to `main` branch** will automatically trigger a new deployment
- **Pull requests** will create preview deployments

### 6.2 Environment Variable Updates

1. **Go to Vercel Dashboard**
2. **Your Project** → **Settings** → **Environment Variables**
3. **Edit/Add variables** as needed
4. **Redeploy** if necessary

### 6.3 Monitoring and Logs

1. **Functions Tab**: Monitor serverless function performance
2. **Analytics**: Track usage and performance
3. **Logs**: Debug issues in real-time

## Step 7: Troubleshooting Common Issues

### 7.1 Build Failures

**Issue**: TypeScript or ESLint errors during build

**Solution**: 
- Check the build logs in Vercel
- Fix any TypeScript errors in your code
- Ensure all dependencies are properly installed

### 7.2 Environment Variables Not Working

**Issue**: App can't connect to database or Clerk

**Solution**:
- Double-check all environment variable names and values
- Ensure no extra spaces or quotes
- Redeploy after adding missing variables

### 7.3 Socket.IO Connection Issues

**Issue**: Real-time features not working

**Solution**:
- Check that the Socket.IO API route is accessible at `/api/socketio`
- Verify CORS settings in the socket configuration
- Check browser console for connection errors

### 7.4 Database Connection Issues

**Issue**: MongoDB connection timeouts

**Solution**:
- Verify your MongoDB Atlas connection string
- Check network access settings (allow Vercel IPs)
- Ensure database user has proper permissions

## Step 8: Performance Optimization

### 8.1 Enable Analytics

1. **Vercel Dashboard** → **Analytics**
2. **Enable Web Analytics** for your project

### 8.2 Configure Edge Functions (Optional)

For better performance, consider moving some API routes to Edge Runtime:

```typescript
// In your API routes, add:
export const runtime = 'edge'
```

### 8.3 Optimize Images

Ensure you're using Next.js Image optimization:

```typescript
import Image from 'next/image'

// Use this instead of regular <img> tags
<Image src="/path/to/image.jpg" alt="Description" width={400} height={300} />
```

## Security Checklist

- ✅ Environment variables are properly set
- ✅ Database access is restricted to necessary IPs
- ✅ Clerk is configured with production keys
- ✅ CORS is properly configured for Socket.IO
- ✅ No sensitive data is committed to GitHub
- ✅ HTTPS is enabled (automatic with Vercel)

## Support and Resources

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Documentation**: [nextjs.org/docs](https://nextjs.org/docs)
- **Clerk Documentation**: [clerk.com/docs](https://clerk.com/docs)
- **MongoDB Atlas Documentation**: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)

## Success! 🎉

Your TogetherFlow application should now be fully deployed and functional on Vercel with:

- ✅ User authentication via Clerk
- ✅ Database operations via MongoDB Atlas
- ✅ Real-time features via Socket.IO
- ✅ Automatic deployments from GitHub
- ✅ Production-ready performance and security

Your app is now accessible at: `https://your-app-name.vercel.app`