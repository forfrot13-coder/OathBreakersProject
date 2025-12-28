# ⚡ Quick Deploy to Render (5 Minutes)

## Step 1: Push to GitHub
```bash
git add .
git commit -m "Configure for Render deployment"
git push origin main
```

## Step 2: Deploy on Render

### Using Blueprint (Recommended - 2 clicks)
1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub repo: `forfrot13-coder/OathBreakersProject`
4. Click **"Apply"**
5. Done! ✅

Render will automatically:
- Create PostgreSQL database
- Create web service
- Set environment variables
- Build and deploy

### Manual Setup (Alternative)

**A. Create Database**
1. New + → PostgreSQL
2. Name: `oathbreakers-db`
3. Plan: Free
4. Create Database
5. **Copy "Internal Database URL"**

**B. Create Web Service**
1. New + → Web Service
2. Connect GitHub repo
3. Configure:
   - **Name**: `oathbreakers-backend`
   - **Runtime**: Python 3
   - **Build Command**: `./build.sh`
   - **Start Command**: `gunicorn oathbreakers.wsgi:application`
   - **Plan**: Free

4. **Environment Variables**:
   ```
   SECRET_KEY = [Generate: python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())']
   DATABASE_URL = [Paste Internal Database URL from step A5]
   PYTHON_VERSION = 3.11.0
   ```

5. Click **"Create Web Service"**

## Step 3: Wait for Build
- Monitor logs in Render dashboard
- First deploy takes 5-10 minutes
- Look for: "Starting gunicorn"

## Step 4: Access Your App
```
https://oathbreakers-backend.onrender.com
```

## Step 5: Create Admin User
In Render Shell:
```bash
python manage.py createsuperuser
```

---

## 🎯 That's It!

Your Django app is now live on Render with:
- ✅ PostgreSQL database
- ✅ HTTPS enabled
- ✅ Static files served
- ✅ Auto-deploy on git push
- ✅ Free tier (no credit card needed)

---

## 🔧 Common Issues

### Build fails on `./build.sh`
**Fix:** The file needs execute permissions. This is automatically handled on Unix systems, but if you're on Windows, run:
```bash
git update-index --chmod=+x build.sh
git commit -m "Make build.sh executable"
git push
```

### "Application failed to respond"
**Fix:** Wait 30-60 seconds after deployment. Free tier spins down after inactivity.

### CORS errors
**Fix:** Add your frontend URL to environment variables:
```
CORS_ALLOWED_ORIGINS=https://your-frontend.com
CSRF_TRUSTED_ORIGINS=https://your-frontend.com
```

---

## 📱 Next Steps

1. **Test your API**: `https://your-app.onrender.com/api/`
2. **Access admin**: `https://your-app.onrender.com/admin/`
3. **Check logs**: Render Dashboard → Logs tab
4. **Deploy frontend**: Render static site or Vercel

---

## 💡 Pro Tips

- **Auto-deploy**: Every push to `main` triggers deployment
- **Logs**: Check Render dashboard for errors
- **Database**: Backup regularly (free tier DB expires in 90 days)
- **Wake up**: First request after sleep takes ~30-60 seconds

---

Need detailed docs? See: `RENDER_DEPLOYMENT.md`
