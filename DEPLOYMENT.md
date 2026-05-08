# Deployment Guide - PulseFlow

## ⚠️ Important: GitHub Pages Limitation

**GitHub Pages cannot host PulseFlow** because:
- ❌ No support for API routes (Node.js server required)
- ❌ No serverless function support for real-time data
- ❌ Static HTML only - can't run Next.js backend

PulseFlow is a **full-stack Next.js application** that requires a server runtime.

---

## ✅ Recommended Deployment Platforms

### **1. VERCEL (Recommended) ⭐**
**Best for**: Zero-config Next.js deployment, free tier, custom domains

**Advantages**:
- ✅ Made by Next.js creators
- ✅ Automatic deployments on push
- ✅ Free tier includes 3 projects
- ✅ 100GB bandwidth/month free
- ✅ Automatic SSL/HTTPS
- ✅ Environment variable management
- ✅ Serverless functions for API routes
- ✅ Global CDN

**Steps**:
```bash
# 1. Sign up at https://vercel.com
# 2. Connect GitHub repository
# 3. Import project (auto-detects Next.js)
# 4. Add environment variables (see .env.local.example)
# 5. Deploy!
```

**Set GitHub secrets for automatic deployment**:
```
VERCEL_TOKEN - Get from https://vercel.com/account/tokens
VERCEL_ORG_ID - From Vercel dashboard
VERCEL_PROJECT_ID - From project settings
(+ all NEXT_PUBLIC_* and other env vars)
```

---

### **2. NETLIFY**
**Best for**: Easy GitHub integration, free tier, serverless functions

**Advantages**:
- ✅ Free tier includes 500 build minutes/month
- ✅ Serverless functions for API routes
- ✅ Automatic deployments
- ✅ Built-in forms, redirects, headers

**Steps**:
```bash
# 1. Sign up at https://netlify.com
# 2. Connect GitHub
# 3. Set build command: npm run build
# 4. Set publish directory: .next
# 5. Add environment variables
# 6. Deploy!
```

---

### **3. RAILWAY / RENDER / HEROKU**
**Best for**: Full control, custom domains, paid tiers

All support:
- ✅ Full Node.js server
- ✅ PostgreSQL/Supabase integration
- ✅ Environment variables
- ✅ Automatic SSL

---

### **4. DOCKER + SELF-HOSTED**
**Best for**: Maximum control, on-premises, air-gapped environments

**Dockerfile included**:
```bash
docker build -t pulseflow:latest .
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=... \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=... \
  pulseflow:latest
```

---

## 🚀 Quick Start: Deploy to Vercel

### **Method 1: Automatic GitHub Actions (Recommended)**

1. **Fork/Push to GitHub**
```bash
git add .
git commit -m "Deploy to Vercel"
git push origin main
```

2. **Go to GitHub Settings → Secrets and Variables → Actions**

3. **Add these secrets**:
```
VERCEL_TOKEN          → https://vercel.com/account/tokens
VERCEL_ORG_ID         → https://vercel.com/account/overview
VERCEL_PROJECT_ID     → Vercel Project Settings
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
SLACK_BOT_TOKEN       (optional)
SALESFORCE_*          (optional)
```

4. **Push again** - GitHub Actions will automatically deploy

### **Method 2: Manual Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
# (repeat for other vars)

# Redeploy with env vars
vercel --prod
```

---

## 📋 Environment Variables Required

### **Essential (Required)**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### **Optional (Integrations)**
```env
# Slack Integration
SLACK_BOT_TOKEN=xoxb-your-token
SLACK_SIGNING_SECRET=your_signing_secret
SLACK_APP_TOKEN=xapp-your-token

# Salesforce Integration
SALESFORCE_CLIENT_ID=your_client_id
SALESFORCE_CLIENT_SECRET=your_client_secret
SALESFORCE_USERNAME=your_username
SALESFORCE_PASSWORD=your_password
SALESFORCE_SECURITY_TOKEN=your_token
```

---

## 🔄 Continuous Deployment (CI/CD)

**GitHub Actions workflows included**:

1. **`.github/workflows/ci.yml`** - Tests on every push
2. **`.github/workflows/deploy-vercel.yml`** - Auto-deploy to Vercel
3. **`.github/workflows/deploy-docker.yml`** - Build Docker images
4. **`.github/workflows/security.yml`** - Weekly security audits

**View status**: GitHub repo → Actions tab

---

## 🧪 Pre-Deployment Checklist

```bash
# 1. Test locally
npm run dev
# Visit http://localhost:3000

# 2. Run tests
npm run test:ci

# 3. Build for production
npm run build

# 4. Check for lint errors
npm run lint

# 5. Verify environment variables
# Make sure .env.local exists with all required vars
cat .env.local
```

---

## 🔒 Security Best Practices

1. **Never commit `.env.local`** ✅ (in .gitignore)
2. **Use GitHub Secrets** for all sensitive data
3. **Rotate tokens** every 3-6 months
4. **Use read-only keys** where possible
5. **Enable HTTPS** (automatic on Vercel/Netlify)
6. **Rate limit APIs** (implement in production)
7. **Monitor logs** for errors

---

## 📊 Monitoring & Analytics

### **Vercel Analytics**
- Dashboard at https://vercel.com
- Real-time logs
- Performance metrics
- Error tracking

### **Application Monitoring**
Add monitoring with:
- **Sentry** (error tracking)
- **LogRocket** (session replay)
- **Datadog** (infrastructure)

---

## 🆘 Troubleshooting Deployment

### **Build Fails**
```bash
# Check Node version compatibility
node --version  # Should be 18+

# Clear cache and rebuild
npm ci
npm run build
```

### **Missing Environment Variables**
```bash
# Verify all required vars are set
vercel env ls
# or in GitHub Secrets: Settings → Secrets → Review
```

### **Database Connection Issues**
```bash
# Test Supabase connection
curl https://your-project.supabase.co/rest/v1/

# Check credentials in .env.local
```

### **API Routes Not Working**
```bash
# Vercel requires specific structure
# Must be in src/app/api/*/route.ts
# Not supported on static hosts (GitHub Pages, Netlify static)
```

---

## 📈 Performance Optimization

**Already configured**:
- ✅ Image optimization (Next.js Image component)
- ✅ Code splitting (automatic)
- ✅ Tree-shaking (production builds)
- ✅ Minification (automatic)
- ✅ Caching headers (configured)

**Further improvements**:
```bash
# Enable Vercel Analytics
# Add to package.json:
npm install @vercel/analytics

# Enable Web Vitals tracking
npm install web-vitals
```

---

## 🤝 Support & Documentation

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **Slack API**: https://api.slack.com/docs
- **Salesforce API**: https://developer.salesforce.com/docs

---

## 🎓 Next Steps

1. **Choose deployment platform** (Vercel recommended)
2. **Prepare environment variables**
3. **Set up GitHub Secrets** for CI/CD
4. **Push to GitHub** - deployment starts automatically
5. **Monitor in dashboard** - watch build/deployment logs
6. **Test production** - verify all features work
7. **Scale as needed** - upgrade plan if needed

---

## 📝 Summary

| Platform | Best For | Cost | Setup Time |
|----------|----------|------|-----------|
| **Vercel** | Next.js projects | Free-$250/mo | 5 min |
| **Netlify** | General web apps | Free-$500/mo | 10 min |
| **Railway** | Full control | Free-$5/mo base | 15 min |
| **Docker** | Self-hosted | $5-50/mo | 30 min |
| **GitHub Pages** | ❌ NOT SUITABLE | Free | N/A |

**Recommendation**: Deploy to **Vercel** with GitHub Actions for zero-downtime automatic updates.

---

## ✅ You're Ready to Deploy!

Push your code and watch it deploy automatically. Your PulseFlow instance will be live within minutes. 🚀
