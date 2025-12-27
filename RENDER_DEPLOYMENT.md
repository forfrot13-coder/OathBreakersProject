# Render.com Deployment Guide

## Overview
This project is configured for deployment on Render.com's free tier using:
- **Backend**: Django 5.2.9 + Django REST Framework
- **Database**: PostgreSQL (managed by Render)
- **Static Files**: WhiteNoise
- **WSGI Server**: Gunicorn

---

## Quick Deployment Steps

### Option 1: Using render.yaml (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Configure for Render deployment"
   git push origin main
   ```

2. **Connect to Render**
   - Go to https://render.com and sign up/login
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect `render.yaml` and set up:
     - Web service (Django app)
     - PostgreSQL database
     - Environment variables

3. **Wait for deployment**
   - Render will automatically build and deploy your app
   - Check the logs for any errors
   - Your app will be available at: `https://oathbreakers-backend.onrender.com`

### Option 2: Manual Setup

1. **Create PostgreSQL Database**
   - Go to Render Dashboard
   - Click "New +" → "PostgreSQL"
   - Name: `oathbreakers-db`
   - Region: Choose closest to your users
   - Plan: Free
   - Click "Create Database"
   - Copy the "Internal Database URL"

2. **Create Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: `oathbreakers-backend`
     - **Region**: Same as database
     - **Branch**: `main`
     - **Runtime**: Python 3
     - **Build Command**: `./build.sh`
     - **Start Command**: `gunicorn oathbreakers.wsgi:application`
     - **Plan**: Free

3. **Set Environment Variables**
   Add these in Render's environment variables section:
   
   **Required:**
   - `SECRET_KEY`: Generate with `python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'`
   - `DATABASE_URL`: Paste the Internal Database URL from step 1
   - `PYTHON_VERSION`: `3.11.0`
   
   **Optional:**
   - `DEBUG`: `False` (default)
   - `ALLOWED_HOSTS`: Leave empty (auto-configured)
   - `CORS_ALLOWED_ORIGINS`: Add your frontend URL if different
   - `CSRF_TRUSTED_ORIGINS`: Add your frontend URL if different

4. **Deploy**
   - Click "Create Web Service"
   - Render will build and deploy automatically

---

## Environment Variables Reference

### Auto-Provided by Render
- `RENDER_EXTERNAL_HOSTNAME` - Your app's hostname (auto-added to ALLOWED_HOSTS)
- `DATABASE_URL` - PostgreSQL connection string (when using Render database)

### Required
- `SECRET_KEY` - Django secret key (generate new one for production)

### Optional
- `DEBUG` - Set to `True` for debugging (default: `False`)
- `ALLOWED_HOSTS` - Comma-separated additional hosts
- `CORS_ALLOWED_ORIGINS` - Comma-separated CORS origins
- `CSRF_TRUSTED_ORIGINS` - Comma-separated CSRF trusted origins
- `SECURE_SSL_REDIRECT` - Enable/disable SSL redirect (default: `True`)

---

## Post-Deployment Tasks

### 1. Create Superuser
Access the Render shell:
```bash
python manage.py createsuperuser
```

### 2. Test Your Deployment
- Visit your app URL: `https://your-app-name.onrender.com`
- Check admin: `https://your-app-name.onrender.com/admin/`
- Test API endpoints: `https://your-app-name.onrender.com/api/`

### 3. Monitor Logs
- Go to Render Dashboard → Your Service → Logs
- Check for any errors or warnings

---

## Important Notes

### Free Tier Limitations
1. **Spin Down**: Services spin down after 15 minutes of inactivity
   - First request after spin down takes 30-60 seconds
   
2. **No Persistent Storage**: Uploaded media files are deleted on restart
   - Solution: Use external storage (AWS S3, Cloudinary)
   - Current setup warns about this in settings.py

3. **750 Hours/Month**: Free tier includes 750 hours/month
   - Enough for continuous uptime of one service

4. **Database**: 
   - Free PostgreSQL database expires after 90 days
   - Limited to 1GB storage

### Static Files
- Handled by WhiteNoise (no separate CDN needed)
- Run `python manage.py collectstatic` during build
- Compressed and cached automatically

### Database Migrations
- Automatically run during build via `build.sh`
- Manual migration: Use Render shell → `python manage.py migrate`

---

## Troubleshooting

### Build Fails
1. Check `build.sh` has execute permissions
2. Verify all dependencies in `requirements.txt`
3. Check Python version compatibility

### Static Files Not Loading
1. Ensure `python manage.py collectstatic` runs in build
2. Check WhiteNoise is in MIDDLEWARE
3. Verify STATIC_ROOT is set correctly

### Database Connection Issues
1. Verify DATABASE_URL is set
2. Check database is in same region
3. Use Internal Database URL (not External)

### App Not Starting
1. Check logs for errors
2. Verify SECRET_KEY is set
3. Ensure gunicorn is installed

### CORS Errors
1. Add frontend URL to CORS_ALLOWED_ORIGINS
2. Check CSRF_TRUSTED_ORIGINS includes your domain
3. Verify CORS_ALLOW_CREDENTIALS is True

---

## Local Development

### Setup
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file (optional for local)
cp .env.example .env

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run development server
python manage.py runserver
```

### Local Environment Variables
For local development, Django uses SQLite by default (no DATABASE_URL needed).

---

## Updating Your Deployment

1. **Push changes to GitHub**
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```

2. **Auto-deploy**
   - Render automatically deploys on push to `main`
   - Monitor the build logs

3. **Manual deploy**
   - Go to Render Dashboard → Your Service
   - Click "Manual Deploy" → "Clear build cache & deploy"

---

## Security Checklist

- ✅ `DEBUG = False` in production
- ✅ Strong `SECRET_KEY` (never commit to git)
- ✅ `ALLOWED_HOSTS` properly configured
- ✅ HTTPS enforced via `SECURE_SSL_REDIRECT`
- ✅ Secure cookies enabled
- ✅ HSTS headers configured
- ✅ Database credentials from environment variables
- ✅ `.env` file in `.gitignore`

---

## Support Resources

- **Render Docs**: https://render.com/docs
- **Django Deployment**: https://docs.djangoproject.com/en/5.2/howto/deployment/
- **Render Community**: https://community.render.com/

---

## Cost Optimization

### Free Tier Strategy
- Keep one service + one database = FREE
- Database auto-paused after inactivity
- Consider upgrading if you need:
  - No spin-down
  - More database storage
  - Custom domains without Render branding

### Scaling Up
When ready to scale:
1. Upgrade to Starter plan ($7/month)
2. Add Redis for caching
3. Configure CDN for static files
4. Add external storage for media files
