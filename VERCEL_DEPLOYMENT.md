# Vercel Deployment Guide for DANA

This guide walks you through deploying DANA to Vercel so you can access it on your phone via a live URL.

## ✅ Pre-Deployment Checklist

- [x] Next.js config updated with `transpilePackages: ['shared']`
- [x] Next.js config updated with `experimental.externalDir: true`
- [x] Shared package properly configured in `shared/package.json`
- [ ] Environment variables configured
- [ ] Database migrations run in Supabase

## 📋 Step-by-Step Deployment

### 1. Install Vercel CLI (if not already installed)

```bash
npm i -g vercel
```

Or use pnpm:

```bash
pnpm add -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Link Your Project

From the root of your DANA project:

```bash
vercel link
```

This will:
- Ask if you want to link to an existing project or create a new one
- Set up `.vercel` folder with project configuration

### 4. Configure Environment Variables

You'll need to set your Supabase environment variables in Vercel:

**Option A: Via Vercel Dashboard**
1. Go to [vercel.com](https://vercel.com)
2. Select your project
3. Go to Settings → Environment Variables
4. Add the following:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key (for server-side)
```

**Option B: Via CLI**

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

### 5. Configure Build Settings

Vercel should auto-detect Next.js, but verify these settings:

**Root Directory**: `.` (root of your repo)

**Build Command**: 
```bash
pnpm install && pnpm shared:build && pnpm build
```

**Output Directory**: `.next`

**Install Command**: 
```bash
pnpm install
```

### 6. Deploy

**Preview Deployment (for testing):**
```bash
vercel
```

**Production Deployment:**
```bash
vercel --prod
```

### 7. Access Your App

After deployment, Vercel will provide:
- **Preview URL**: `https://your-project-xyz.vercel.app`
- **Production URL**: `https://your-project.vercel.app` (if you set up a custom domain)

## 🔧 Troubleshooting

### Issue: "Cannot find module 'shared'"

**Solution**: Ensure `transpilePackages: ['shared']` is in `next.config.mjs` and that the shared package is built before Next.js build.

**Fix**: Update your build command to:
```bash
pnpm install && pnpm shared:build && pnpm build
```

### Issue: "Module not found" errors for shared utilities

**Solution**: Verify `experimental.externalDir: true` is set in `next.config.mjs`.

### Issue: Environment variables not working

**Solution**: 
1. Ensure variables are prefixed with `NEXT_PUBLIC_` for client-side access
2. Redeploy after adding environment variables
3. Check Vercel dashboard → Settings → Environment Variables

### Issue: Build fails with TypeScript errors

**Solution**: Your config has `ignoreBuildErrors: true`, but if you want to catch errors:
1. Remove `ignoreBuildErrors` temporarily
2. Fix TypeScript errors
3. Re-enable if needed for faster deploys

## 📱 Testing on Mobile

Once deployed:

1. **Open the Vercel URL on your phone's browser**
2. **Test the infrastructure components:**
   - Error Boundary (if you have test error button)
   - Terms Guard (if integrated)
   - Profile privacy filtering

## 🚀 Continuous Deployment

Vercel automatically deploys when you push to:
- `main` branch → Production
- Other branches → Preview deployments

To set up:
1. Connect your GitHub/GitLab/Bitbucket repo to Vercel
2. Vercel will auto-detect and deploy on push

## 📝 Vercel Configuration File (Optional)

You can create `vercel.json` for more control:

```json
{
  "buildCommand": "pnpm install && pnpm shared:build && pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "regions": ["iad1"]
}
```

## 🎯 Next Steps After Deployment

1. **Test all infrastructure components** on the live URL
2. **Set up custom domain** (optional) in Vercel dashboard
3. **Configure analytics** (Vercel Analytics is built-in)
4. **Set up monitoring** (Sentry, LogRocket, etc.)
5. **Test mobile experience** on actual devices

## 📚 Additional Resources

- [Vercel Next.js Documentation](https://vercel.com/docs/frameworks/nextjs)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vercel CLI Reference](https://vercel.com/docs/cli)

---

## ✅ Quick Deploy Command

For fastest deployment:

```bash
# 1. Login (one-time)
vercel login

# 2. Link project (one-time)
vercel link

# 3. Deploy
vercel --prod
```

Your app will be live at the provided URL! 🎉
