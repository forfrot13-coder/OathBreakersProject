"""
Django settings for oathbreakers project.
Optimized for Render.com deployment with environment variable configuration.
"""

from pathlib import Path
import os
import dj_database_url
from decouple import config, Csv

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# ============================================================
# SECURITY SETTINGS
# ============================================================

# SECRET_KEY: Required in all environments
# Generate with: python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
SECRET_KEY = config(
    'SECRET_KEY',
    default='django-insecure-dev-only-change-this-in-production-zxcv1234asdfqwerty9876'
)

# DEBUG: Default to False for safety
DEBUG = config('DEBUG', default=False, cast=bool)

# ALLOWED_HOSTS: Render provides RENDER_EXTERNAL_HOSTNAME
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='', cast=Csv())

# Add Render hostname if available
RENDER_EXTERNAL_HOSTNAME = config('RENDER_EXTERNAL_HOSTNAME', default='')
if RENDER_EXTERNAL_HOSTNAME:
    ALLOWED_HOSTS.append(RENDER_EXTERNAL_HOSTNAME)

# Add localhost for local development
if DEBUG:
    ALLOWED_HOSTS.extend(['localhost', '127.0.0.1', '[::1]'])

# Ensure ALLOWED_HOSTS is not empty
if not ALLOWED_HOSTS:
    ALLOWED_HOSTS = ['localhost', '127.0.0.1']


# ============================================================
# APPLICATION DEFINITION
# ============================================================

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
    'game',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # WhiteNoise for static files
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'oathbreakers.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.template.context_processors.static',
                'django.template.context_processors.media',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'oathbreakers.wsgi.application'


# ============================================================
# DATABASE CONFIGURATION
# ============================================================

# Use DATABASE_URL if provided (Render provides this automatically)
# Falls back to individual PostgreSQL settings or SQLite for local development
DATABASE_URL = config('DATABASE_URL', default='')

if DATABASE_URL:
    # Parse DATABASE_URL (Render provides this automatically)
    DATABASES = {
        'default': dj_database_url.parse(DATABASE_URL, conn_max_age=600)
    }
else:
    # Fallback to SQLite for local development
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }


# ============================================================
# REST FRAMEWORK
# ============================================================

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.TokenAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}


# ============================================================
# PASSWORD VALIDATION
# ============================================================

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# ============================================================
# INTERNATIONALIZATION
# ============================================================

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True


# ============================================================
# STATIC FILES (CSS, JavaScript, Images)
# ============================================================

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Additional directories for static files
STATICFILES_DIRS = []
_root_static_dir = BASE_DIR / 'static'
if _root_static_dir.exists():
    STATICFILES_DIRS.append(_root_static_dir)

# WhiteNoise configuration for efficient static file serving
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'


# ============================================================
# MEDIA FILES
# ============================================================
# WARNING: Render free plan has NO persistent storage for media files!
# Uploaded files will be DELETED on every deploy or instance restart.
# For production, use external storage (AWS S3, Cloudinary, etc.)

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'


# ============================================================
# CORS CONFIGURATION
# ============================================================

# CORS settings for API access
CORS_ALLOW_CREDENTIALS = True

# Configure CORS origins
CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS',
    default='http://localhost:3000,http://127.0.0.1:3000',
    cast=Csv()
)

# Add Render URL to CORS if available
if RENDER_EXTERNAL_HOSTNAME:
    CORS_ALLOWED_ORIGINS.append(f'https://{RENDER_EXTERNAL_HOSTNAME}')


# ============================================================
# CSRF CONFIGURATION
# ============================================================

# CSRF trusted origins for API requests
CSRF_TRUSTED_ORIGINS = config(
    'CSRF_TRUSTED_ORIGINS',
    default='',
    cast=Csv()
)

# Add Render URL to CSRF trusted origins
if RENDER_EXTERNAL_HOSTNAME:
    CSRF_TRUSTED_ORIGINS.append(f'https://{RENDER_EXTERNAL_HOSTNAME}')


# ============================================================
# SECURITY SETTINGS (Production)
# ============================================================

if not DEBUG:
    # Security settings for production
    SECURE_SSL_REDIRECT = config('SECURE_SSL_REDIRECT', default=True, cast=bool)
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = 'DENY'
    SECURE_HSTS_SECONDS = 31536000  # 1 year
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True


# ============================================================
# DEFAULT PRIMARY KEY
# ============================================================

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
