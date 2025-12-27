# Environment Setup Guide

## Overview

The settings.py has been updated to support both development and production environments with intelligent environment variable handling.

## Key Changes

### 1. Environment Detection
- Added `ENVIRONMENT` variable (default: `development`)
- Set `ENVIRONMENT=production` in production to enable strict validation
- Options: `development`, `staging`, `production`

### 2. Smart Environment Variable Handling

#### Development Mode (Default)
- **No environment variables required!**
- Uses safe default values:
  - `SECRET_KEY`: Auto-generated insecure key for dev
  - `DEBUG`: True
  - `POSTGRES_PASSWORD`: Default development password
- All env vars can still be overridden if needed

#### Production Mode (`ENVIRONMENT=production`)
- **Strict validation enabled**
- **Required environment variables:**
  - `DJANGO_SECRET_KEY` (raises error if missing)
  - `POSTGRES_PASSWORD` (raises error if missing)
- `DEBUG` is always `False` (cannot be overridden)
- Clear error messages with instructions for generating values

## Development Workflow

### Quick Start (No Setup Required)
```bash
# Just clone and run!
git clone <repo>
cd oathbreakers
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

**That's it!** No environment variables needed.

### Custom Development Settings (Optional)
If you want to override defaults:
```bash
export DJANGO_SECRET_KEY="my-custom-dev-key"
export POSTGRES_PASSWORD="my-custom-password"
python manage.py runserver
```

## Production Workflow

### 1. Set Required Environment Variables
```bash
export ENVIRONMENT=production
export DJANGO_SECRET_KEY="$(python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())')"
export POSTGRES_PASSWORD="secure-production-password"
```

### 2. Optional Production Variables
```bash
export DJANGO_ALLOWED_HOSTS="yourdomain.com,www.yourdomain.com"
export POSTGRES_DB="oathbreakers_db"
export POSTGRES_USER="postgres"
export POSTGRES_HOST="production-db-host"
export POSTGRES_PORT="5432"
```

### 3. Deploy
```bash
python manage.py migrate
python manage.py collectstatic --noinput
gunicorn oathbreakers.wsgi:application
```

## Using .env Files

### For Development (Optional)
Create `.env` file:
```bash
DJANGO_SECRET_KEY=my-dev-key
POSTGRES_PASSWORD=my-dev-password
```

### For Production
```bash
cp .env.example .env
# Edit .env with your production values
```

Then load with python-dotenv or similar tool.

## Environment Variables Reference

| Variable | Required | Default (Dev) | Production | Description |
|----------|----------|---------------|------------|-------------|
| `ENVIRONMENT` | No | `development` | `production` | Controls validation mode |
| `DJANGO_SECRET_KEY` | **Yes (prod)** | Auto-generated | Required | Django secret key |
| `DJANGO_DEBUG` | No | `True` | `False` (forced) | Debug mode |
| `DJANGO_ALLOWED_HOSTS` | No | `localhost,127.0.0.1` | Recommended | Allowed hosts |
| `POSTGRES_DB` | No | `oathbearkers_db` | Optional | Database name |
| `POSTGRES_USER` | No | `postgres` | Optional | Database user |
| `POSTGRES_PASSWORD` | **Yes (prod)** | `mehran9731` | Required | Database password |
| `POSTGRES_HOST` | No | `127.0.0.1` | Optional | Database host |
| `POSTGRES_PORT` | No | `5432` | Optional | Database port |

## Testing Configuration

Run the included test script to verify settings:
```bash
python test_settings.py
```

This will test:
1. ✅ Development mode works without env vars
2. ✅ Development mode accepts custom env vars
3. ✅ Production mode fails without SECRET_KEY
4. ✅ Production mode fails without POSTGRES_PASSWORD
5. ✅ Production mode works with all required vars

## Error Messages

### Missing SECRET_KEY in Production
```
ValueError: ERROR: DJANGO_SECRET_KEY environment variable must be set in production!
Generate one with: python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
```

**Solution:**
```bash
export DJANGO_SECRET_KEY="$(python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())')"
```

### Missing POSTGRES_PASSWORD in Production
```
ValueError: ERROR: POSTGRES_PASSWORD environment variable must be set in production!
```

**Solution:**
```bash
export POSTGRES_PASSWORD="your-secure-password"
```

## Migration from Old Configuration

### Before (Error in Development)
```python
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY')
if not SECRET_KEY:
    raise ValueError("DJANGO_SECRET_KEY environment variable must be set")
```

**Problem:** Developers had to set env vars just to run the project locally.

### After (Smart Defaults)
```python
ENVIRONMENT = os.environ.get('ENVIRONMENT', 'development')
IS_PRODUCTION = ENVIRONMENT == 'production'

if IS_PRODUCTION:
    SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY')
    if not SECRET_KEY:
        raise ValueError("ERROR: DJANGO_SECRET_KEY must be set in production!")
else:
    SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'django-insecure-dev-only-...')
```

**Solution:** Development "just works", production is still secure and strict.

## Security Notes

- ⚠️ Development defaults are **intentionally insecure**
- ⚠️ Never use development defaults in production
- ✅ Production mode enforces security requirements
- ✅ Clear separation between dev and prod configurations
- ✅ Explicit opt-in to production mode via `ENVIRONMENT=production`

## Files Modified

1. `oathbreakers/settings.py` - Updated with environment detection
2. `.gitignore` - Added `.env.local` and `.env.*.local`
3. `.env.example` - Created with production examples
4. `README.md` - Created with comprehensive setup guide
5. `requirements.txt` - Added Pillow dependency
6. `test_settings.py` - Created test script (optional)
7. `ENVIRONMENT_SETUP_GUIDE.md` - This file

## Acceptance Criteria ✅

- ✅ Development works without environment variables
- ✅ Production fails without required environment variables
- ✅ `.env.example` file created
- ✅ `.gitignore` updated to exclude `.env` files
- ✅ `README.md` created with setup instructions
- ✅ `python manage.py check` runs without errors (dev mode)
- ✅ `python manage.py check` fails in production mode without env vars
- ✅ Clear error messages guide users to correct configuration
- ✅ All tests pass in test script

## Support

If you encounter any issues:
1. Verify you're in the correct environment mode
2. Check that required variables are set (production only)
3. Run `python test_settings.py` to diagnose issues
4. Check error messages for specific guidance
