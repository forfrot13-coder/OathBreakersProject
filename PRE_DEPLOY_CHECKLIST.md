# 📋 Pre-Deployment Checklist for Render

Before deploying to Render, verify these items:

## ✅ Required Files

- [x] `requirements.txt` - Contains all production dependencies
- [x] `build.sh` - Build script with execute permissions
- [x] `render.yaml` - Infrastructure configuration (for Blueprint)
- [x] `.gitignore` - Excludes sensitive files (.env, db.sqlite3, venv/)
- [x] `oathbreakers/settings.py` - Render-compatible configuration

## ✅ Settings Verification

### Environment Variables
- [x] Uses `python-decouple` for env var management
- [x] `SECRET_KEY` configured with config()
- [x] `DEBUG` defaults to False
- [x] `DATABASE_URL` support via dj-database-url
- [x] `RENDER_EXTERNAL_HOSTNAME` auto-detection

### Middleware
- [x] WhiteNoise middleware added for static files
- [x] Correct order: SecurityMiddleware → WhiteNoiseMiddleware

### Database
- [x] Supports DATABASE_URL parsing
- [x] Falls back to SQLite for local development
- [x] conn_max_age=600 for connection pooling

### Static Files
- [x] `STATIC_ROOT = BASE_DIR / 'staticfiles'`
- [x] `STATICFILES_STORAGE` uses WhiteNoise compressed storage
- [x] `python manage.py collectstatic` works without errors

### Security (Production)
- [x] `SECURE_SSL_REDIRECT` enabled when DEBUG=False
- [x] `SESSION_COOKIE_SECURE = True`
- [x] `CSRF_COOKIE_SECURE = True`
- [x] `SECURE_HSTS_SECONDS = 31536000`
- [x] `X_FRAME_OPTIONS = 'DENY'`

### CORS & CSRF
- [x] `CORS_ALLOWED_ORIGINS` configurable via env var
- [x] Auto-adds Render hostname to CORS
- [x] `CSRF_TRUSTED_ORIGINS` configured
- [x] Auto-adds Render hostname to CSRF

## ✅ Dependencies Check

Run locally to verify:

```bash
# Activate virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Verify no missing imports
python manage.py check

# Verify deployment configuration
DEBUG=False SECRET_KEY="test-key-$(openssl rand -hex 32)" python manage.py check --deploy

# Test static files collection
python manage.py collectstatic --no-input

# Test migrations
python manage.py migrate

# Test gunicorn
gunicorn --check-config oathbreakers.wsgi:application
```

All should pass with no errors.

## ✅ Build Script Check

```bash
# Verify build.sh has execute permissions
ls -l build.sh
# Should show: -rwxr-xr-x

# If not executable:
chmod +x build.sh
git add build.sh
git commit -m "Make build.sh executable"
```

## ✅ Git Repository Check

```bash
# Verify sensitive files are not tracked
git status

# Should NOT see:
# - .env
# - db.sqlite3
# - venv/
# - __pycache__/
# - *.pyc

# Add all changes
git add .

# Commit
git commit -m "Configure for Render deployment"

# Push to GitHub
git push origin main
```

## ✅ Render Configuration

### Option 1: Blueprint (render.yaml)
- [x] `render.yaml` exists in root directory
- [x] Service name configured
- [x] Database name configured
- [x] Build command: `./build.sh`
- [x] Start command: `gunicorn oathbreakers.wsgi:application`
- [x] Environment variables defined

### Option 2: Manual Setup
Prepare these values:

1. **SECRET_KEY** (Generate):
   ```bash
   python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
   ```

2. **DATABASE_URL** (Copy from Render PostgreSQL dashboard):
   - Format: `postgres://user:password@host:port/dbname`
   - Use "Internal Database URL"

3. **PYTHON_VERSION**: `3.11.0`

## ✅ Post-Deployment Verification

After deployment succeeds:

### 1. Check Build Logs
- Look for: "Installing collected packages"
- Look for: "X static files copied to '/opt/render/project/src/staticfiles'"
- Look for: "Running migrations"
- Look for: "Starting gunicorn"

### 2. Test Endpoints
```bash
# Health check
curl https://your-app.onrender.com/

# Admin panel
curl https://your-app.onrender.com/admin/

# API endpoints
curl https://your-app.onrender.com/api/

# Static files
curl https://your-app.onrender.com/static/
```

### 3. Create Superuser
In Render Shell:
```bash
python manage.py createsuperuser
```

### 4. Test Admin Login
Visit: `https://your-app.onrender.com/admin/`

### 5. Monitor Logs
- Render Dashboard → Your Service → Logs
- Check for any errors or warnings

## ✅ Common Issues & Solutions

### Issue: Build fails on "./build.sh: Permission denied"
**Solution:**
```bash
chmod +x build.sh
git add build.sh
git commit -m "Fix build.sh permissions"
git push
```

### Issue: "ModuleNotFoundError" during build
**Solution:** Verify all packages in `requirements.txt`

### Issue: "ImproperlyConfigured: SECRET_KEY"
**Solution:** Set SECRET_KEY environment variable in Render dashboard

### Issue: "could not connect to server: Connection refused"
**Solution:** 
- Verify DATABASE_URL is set
- Use Internal Database URL (not External)

### Issue: Static files not loading (404)
**Solution:**
- Verify WhiteNoise in MIDDLEWARE
- Check `python manage.py collectstatic` ran in build logs
- Verify STATIC_ROOT path

### Issue: CORS errors in browser
**Solution:**
- Add frontend URL to CORS_ALLOWED_ORIGINS env var
- Format: `https://frontend.com,https://www.frontend.com`

### Issue: CSRF verification failed
**Solution:**
- Add frontend URL to CSRF_TRUSTED_ORIGINS env var
- Include https:// prefix

## ✅ Environment Variables Reference

### Auto-Provided by Render:
- `RENDER_EXTERNAL_HOSTNAME` - Your app's hostname
- `DATABASE_URL` - PostgreSQL connection string

### Required:
- `SECRET_KEY` - Django secret key (auto-generated if using render.yaml)

### Optional:
- `DEBUG` - Default: False
- `ALLOWED_HOSTS` - Default: auto-configured
- `CORS_ALLOWED_ORIGINS` - Default: includes Render URL
- `CSRF_TRUSTED_ORIGINS` - Default: includes Render URL
- `SECURE_SSL_REDIRECT` - Default: True

## ✅ Final Pre-Deploy Command

Run this to verify everything:

```bash
# Full test
cd /path/to/project
python3 -m venv test_venv
source test_venv/bin/activate
pip install -r requirements.txt
export SECRET_KEY="test-$(openssl rand -hex 32)"
export DEBUG=False
python manage.py check --deploy
python manage.py collectstatic --no-input
python manage.py migrate
gunicorn --check-config oathbreakers.wsgi:application
deactivate
rm -rf test_venv
```

If all pass: **Ready to Deploy!** 🚀

---

## 📚 Next Steps

1. Push code to GitHub
2. Deploy to Render (Blueprint or Manual)
3. Monitor build logs
4. Test deployed app
5. Create superuser
6. Celebrate! 🎉

---

**Need help?** See:
- `QUICK_DEPLOY.md` - 5-minute deployment guide
- `RENDER_DEPLOYMENT.md` - Complete documentation
- `CHANGES_FOR_RENDER.md` - Detailed code changes
