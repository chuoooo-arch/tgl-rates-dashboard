# 🚀 Railway Deployment Guide

## Prerequisites
- GitHub account with your code pushed
- Railway account (https://railway.app)

## Step 1: Prepare Project

### ✅ Package.json (Already Updated)
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && next build",
    "start": "prisma migrate deploy && next start",
    "postinstall": "prisma generate"
  }
}
```

### ✅ Schema.prisma (Already Updated)
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

## Step 2: Push to GitHub

```bash
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

## Step 3: Deploy on Railway

1. Go to https://railway.app
2. Click **"New Project"**
3. Select **"Deploy from GitHub Repo"**
4. Choose your repository
5. Railway will create a web service

## Step 4: Add PostgreSQL Database

1. In the same project, click **"+ New"**
2. Select **"Database"** → **"PostgreSQL"**
3. Railway will automatically create `DATABASE_URL`

## Step 5: Configure Environment Variables

Go to your **web service** (not postgres) → **Variables** tab:

### Required Variables:
```
DATABASE_URL = ${{Postgres.DATABASE_URL}}
NODE_ENV = production
```

### Optional Variables (if needed):
```
NEXT_PUBLIC_APP_URL = ${{RAILWAY_PUBLIC_DOMAIN}}
```

## Step 6: Connect Database to Web Service

1. Click on **web service**
2. Go to **"Settings"** → **"Service"**
3. In **"Connect to"**, select your Postgres database
4. Railway will automatically inject `DATABASE_URL`

## Step 7: Deploy

1. Railway will automatically deploy on every push
2. Get your app URL from **"Settings"** → **"Domains"**
3. Click **"Generate Domain"** if not exists

## Verify Deployment

Your app should be live at: `https://your-app.up.railway.app`

### Check if migrations ran:
```bash
# In Railway logs, you should see:
✓ Starting...
Running migrations...
Applied database migrations
Ready on ❯
```

## Troubleshooting

### If migrations fail:
1. Check Railway logs
2. Verify `DATABASE_URL` is set correctly
3. Ensure Postgres service is running
4. Check migration files in `prisma/migrations/`

### If build fails:
1. Check Node version matches (Railway defaults to Node 18+)
2. Verify all dependencies in package.json
3. Check build logs for errors

## Updating Your App

```bash
# Make changes locally
git add .
git commit -m "Update features"
git push origin main

# Railway will automatically redeploy
```

## Database Management

### View data in Railway:
1. Click on Postgres service
2. Go to **"Data"** tab
3. Or use **"Connect"** to get connection string

### Run migrations manually (if needed):
```bash
# In Railway web service settings → Custom Start Command:
npx prisma migrate deploy && npm start
```

## Environment-Specific Behavior

- **Development**: Uses SQLite (`file:./dev.db`)
- **Production**: Uses PostgreSQL (Railway's `DATABASE_URL`)

The app automatically switches based on `DATABASE_URL` format.

## Cost

- **Free tier**: Includes 500 hours/month
- **Paid**: $5/month for more resources

---

## Quick Checklist

- [x] `package.json` has Prisma scripts
- [x] `schema.prisma` uses PostgreSQL
- [x] Code pushed to GitHub
- [ ] Railway project created
- [ ] PostgreSQL added
- [ ] Environment variables configured
- [ ] Domain generated
- [ ] App deployed successfully

---

**Need help?** Check Railway docs: https://docs.railway.app
