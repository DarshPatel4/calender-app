# Vercel Deployment Guide

This guide will walk you through deploying your Calendar App to Vercel step by step.

## Prerequisites

1. **GitHub/GitLab/Bitbucket Account** - Your code needs to be in a Git repository
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com) (free tier available)
3. **Supabase Project** - Your Supabase credentials ready

---

## Step 1: Prepare Your Repository

### 1.1 Ensure Your Code is Committed

Make sure all your changes are committed to Git:

```bash
git add .
git commit -m "Prepare for Vercel deployment"
```

### 1.2 Push to Remote Repository

If you haven't already, push your code to GitHub/GitLab/Bitbucket:

```bash
git remote add origin <your-repository-url>
git push -u origin main
```

---

## Step 2: Get Your Supabase Credentials

You'll need these environment variables from your Supabase project:

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings**  **API**
4. Copy the following:
   - **Project URL**  This is your `VITE_SUPABASE_URL`
   - **anon/public key**  This is your `VITE_SUPABASE_ANON_KEY`

---

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended for First Time)

1. **Sign in to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub/GitLab/Bitbucket

2. **Import Your Project**
   - Click **"Add New..."**  **"Project"**
   - Import your repository from the list
   - Click **"Import"**

3. **Configure Project Settings**
   - **Framework Preset**: Vercel should auto-detect "Vite"
   - **Root Directory**: Leave as `./` (unless your project is in a subfolder)
   - **Build Command**: `npm run build` (should be auto-filled)
   - **Output Directory**: `dist` (should be auto-filled)
   - **Install Command**: `npm install` (should be auto-filled)

4. **Add Environment Variables**
   Click **"Environment Variables"** and add:

   ```
   VITE_SUPABASE_URL = https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY = your-anon-key-here
   ```

   > **Note**: You can optionally add `VITE_SUPABASE_CONNECTION_STRING` if you use it, but it's not required if you have the URL and key.

5. **Deploy**
   - Click **"Deploy"**
   - Wait for the build to complete (usually 1-3 minutes)

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Link to existing project or create new
   - Confirm settings
   - Add environment variables when prompted

4. **For Production Deployment**
   ```bash
   vercel --prod
   ```

---

## Step 4: Configure Environment Variables (If Not Done During Setup)

If you need to add/update environment variables after deployment:

1. Go to your project on [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your project
3. Go to **Settings**  **Environment Variables**
4. Add or edit:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. **Important**: After adding/updating variables, you need to **redeploy**:
   - Go to **Deployments** tab
   - Click the **"..."** menu on the latest deployment
   - Click **"Redeploy"**

---

## Step 5: Verify Your Deployment

1. **Check Build Logs**
   - Go to your deployment in Vercel
   - Click on the deployment to see build logs
   - Ensure there are no errors

2. **Test Your App**
   - Visit your deployment URL (e.g., `your-app.vercel.app`)
   - Test all functionality:
     - Calendar view
     - Adding events
     - Supabase connection

3. **Check Browser Console**
   - Open browser DevTools (F12)
   - Check for any errors in the Console tab
   - Verify Supabase connection is working

---

## Step 6: Custom Domain (Optional)

1. Go to **Settings**  **Domains**
2. Add your custom domain
3. Follow Vercel's instructions to configure DNS
4. SSL certificate is automatically provisioned

---

## Troubleshooting

### Build Fails

**Error: Missing environment variables**
- Ensure all required environment variables are set in Vercel
- Redeploy after adding variables

**Error: Build command failed**
- Check build logs in Vercel dashboard
- Try building locally: `npm run build`
- Ensure all dependencies are in `package.json`

### App Works Locally But Not on Vercel

**404 Errors on Routes**
- The `vercel.json` file should handle SPA routing
- Ensure `vercel.json` is in your repository root
- Check that the rewrite rule is correct

**Supabase Connection Errors**
- Verify environment variables are set correctly
- Check that your Supabase project allows requests from your Vercel domain
- In Supabase: **Settings**  **API**  Check CORS settings

**Blank Page**
- Check browser console for errors
- Verify build output in Vercel logs
- Ensure `index.html` is in the `dist` folder

### Environment Variables Not Working

- Environment variables must start with `VITE_` to be exposed to the client
- After adding variables, **redeploy** your application
- Variables are case-sensitive

---

## Continuous Deployment

Vercel automatically deploys when you push to your main branch:

1. Push to `main` branch  Production deployment
2. Push to other branches  Preview deployment
3. Create Pull Request  Preview deployment with unique URL

---

## Useful Commands

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View deployment logs
vercel logs

# Remove deployment
vercel remove
```

---

## Project Structure for Vercel

Your project should have:
```
calender-app/
 vercel.json          # Vercel configuration
 package.json         # Dependencies and scripts
 vite.config.ts       # Vite configuration
 index.html           # Entry HTML
 src/                 # Source code
 dist/                # Build output (generated)
```

---

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html#vercel)
- [Supabase Documentation](https://supabase.com/docs)

---

## Quick Checklist

- [ ] Code pushed to Git repository
- [ ] `vercel.json` file created
- [ ] Supabase credentials ready
- [ ] Environment variables added in Vercel
- [ ] Build successful
- [ ] App tested on deployment URL
- [ ] Custom domain configured (optional)

---

**Need Help?** Check Vercel's [support documentation](https://vercel.com/docs/support) or [community forums](https://github.com/vercel/vercel/discussions).

