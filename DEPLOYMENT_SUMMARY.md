# Render Deployment - Changes Summary

## 🎯 What Was Changed

This project has been fully configured for deployment on **Render.com** free tier.

---

## 📦 New Dependencies Added

### requirements.txt
```python
gunicorn>=21.2.0          # Production WSGI server
dj-database-url>=2.1.0    # Parse DATABASE_URL for PostgreSQL
python-decouple>=3.8      # Environment variable management
whitenoise>=6.6.0         # Static file serving
```

---

## ⚙️ Settings Changes (settings.py)

### 1. Environment Variables (python-decouple)
```python
from decouple import config, Csv

SECRET_KEY = config('SECRET_KEY', default='dev-key')
DEBUG = config('DEBUG', default=False, cast=bool)
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='', cast=Csv())
```

### 2. Render Hostname Support
```python
RENDER_EXTERNAL_HOSTNAME = config('RENDER_EXTERNAL_HOSTNAME', default='')
if RENDER_EXTERNAL_HOSTNAME:
    ALLOWED_HOSTS.append(RENDER_EXTERNAL_HOSTNAME)
```

### 3. Database Configuration (dj-database-url)
```python
DATABASE_URL = config('DATABASE_URL', default='')

if DATABASE_URL:
    DATABASES = {
        'default': dj_database_url.parse(DATABASE_URL, conn_max_age=600)
    }
else:
    # SQLite fallback for local development
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }
```

### 4. Static Files (WhiteNoise)
```python
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # ← Added
    # ... other middleware
]

STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
```

### 5. CORS Auto-Configuration
```python
CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS',
    default='http://localhost:3000,http://127.0.0.1:3000',
    cast=Csv()
)

if RENDER_EXTERNAL_HOSTNAME:
    CORS_ALLOWED_ORIGINS.append(f'https://{RENDER_EXTERNAL_HOSTNAME}')
```

### 6. Security Settings (Production Only)
```python
if not DEBUG:
    SECURE_SSL_REDIRECT = config('SECURE_SSL_REDIRECT', default=True, cast=bool)
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = 'DENY'
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
```

---

## 📄 New Files Created

### 1. build.sh
Automated build script for Render:
```bash
#!/usr/bin/env bash
set -o errexit

pip install --upgrade pip
pip install -r requirements.txt

# Build frontend
npm install
npm run build:css
npm run build:js

# Collect static files
python manage.py collectstatic --no-input

# Run migrations
python manage.py migrate
```

### 2. render.yaml
Infrastructure as Code for Render:
```yaml
services:
  - type: web
    name: oathbreakers-backend
    env: python
    buildCommand: "./build.sh"
    startCommand: "gunicorn oathbreakers.wsgi:application"
    
databases:
  - name: oathbreakers-db
    plan: free
```

### 3. RENDER_DEPLOYMENT.md
Complete deployment guide with:
- Step-by-step instructions
- Environment variable reference
- Troubleshooting tips
- Security checklist

---

## 🚀 Quick Start (Deploy to Render)

### Method 1: Blueprint (Easiest)
1. Push code to GitHub
2. Go to [Render Dashboard](https://render.com)
3. New → Blueprint
4. Connect repository
5. Auto-deploys with `render.yaml`

### Method 2: Manual
1. Create PostgreSQL database on Render
2. Create Web Service
3. Set environment variables:
   - `SECRET_KEY` (generate new)
   - `DATABASE_URL` (from database)
4. Deploy

---

## 🔑 Required Environment Variables on Render

| Variable | Value | Notes |
|----------|-------|-------|
| `SECRET_KEY` | Generate new | Auto-generated if using render.yaml |
| `DATABASE_URL` | Auto-provided | Render sets this automatically |
| `PYTHON_VERSION` | 3.11.0 | Python runtime version |

**Optional:**
- `DEBUG` (default: False)
- `ALLOWED_HOSTS` (auto-configured)
- `CORS_ALLOWED_ORIGINS`
- `CSRF_TRUSTED_ORIGINS`

---

## ⚠️ Important Notes

### 1. Media Files Warning
```python
# In settings.py - Clear warning added:
# WARNING: Render free plan has NO persistent storage for media files!
# Uploaded files will be DELETED on every deploy or instance restart.
# For production, use external storage (AWS S3, Cloudinary, etc.)
```

### 2. Free Tier Limitations
- Services spin down after 15 minutes inactivity
- First request after sleep: ~30-60 seconds
- No persistent disk storage
- PostgreSQL database expires after 90 days

### 3. Local Development
Still works with SQLite:
```bash
python manage.py runserver  # Uses SQLite by default
```

---

## ✅ What Works Out of the Box

- ✅ PostgreSQL connection via DATABASE_URL
- ✅ Static files served via WhiteNoise
- ✅ HTTPS with automatic SSL
- ✅ CORS properly configured
- ✅ Environment-based settings
- ✅ Automatic migrations on deploy
- ✅ Secure cookies in production
- ✅ Frontend build integration

---

## 🔧 Testing Locally Before Deploy

```bash
# Install dependencies
pip install -r requirements.txt

# Test with production-like settings
export SECRET_KEY="test-secret-key"
export DEBUG=False
export DATABASE_URL="sqlite:///db.sqlite3"

# Run checks
python manage.py check --deploy

# Collect static files
python manage.py collectstatic --no-input

# Test gunicorn
gunicorn oathbreakers.wsgi:application
```

---

## 📚 Additional Resources

- **Full Guide**: See `RENDER_DEPLOYMENT.md`
- **Render Docs**: https://render.com/docs/deploy-django
- **Django Deployment**: https://docs.djangoproject.com/en/5.2/howto/deployment/

---

## 🆘 Troubleshooting

### Build Fails
- Check `build.sh` has execute permissions: `chmod +x build.sh`
- Verify Python version in Render settings

### Database Connection Error
- Use Internal Database URL (not External)
- Ensure database is created first

### Static Files Not Loading
- Check WhiteNoise in MIDDLEWARE
- Verify `collectstatic` runs in build

### CORS Issues
- Add frontend URL to `CORS_ALLOWED_ORIGINS` env var
- Format: `https://yourdomain.com,https://www.yourdomain.com`

---

## 📞 Support

Need help? Check:
1. `RENDER_DEPLOYMENT.md` for detailed guide
2. Render logs in dashboard
3. Render Community Forum
4. Django deployment docs
