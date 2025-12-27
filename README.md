# Oathbreakers - Trading Card Game

A full-stack Django trading card game with embedded React frontend using Tailwind CSS, Framer Motion, and Zustand state management.

## 🚀 Quick Start

### Development Setup

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd oathbreakers
```

#### 2. Create Virtual Environment
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

#### 3. Install Python Dependencies
```bash
pip install -r requirements.txt
```

#### 4. Install Node.js Dependencies
```bash
npm install
```

#### 5. Build Frontend Assets
```bash
# Build CSS (Tailwind)
npm run build:css

# Or watch for changes during development
npm run dev
```

#### 6. Run Migrations
```bash
python manage.py migrate
```

#### 7. Create Superuser
```bash
python manage.py createsuperuser
```

#### 8. Run Development Server
```bash
python manage.py runserver
```

**✨ No environment variables needed for development!** The application will use sensible defaults.

Visit: `http://localhost:8000/`

---

## 🏭 Production Setup

### Environment Variables

For production deployment, you **must** set the following environment variables:

```bash
# Set environment to production (required for strict validation)
export ENVIRONMENT=production

# Generate a secure secret key
export DJANGO_SECRET_KEY="$(python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())')"

# Disable debug mode
export DJANGO_DEBUG=False

# Set allowed hosts
export DJANGO_ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# Database configuration
export POSTGRES_DB=oathbreakers_db
export POSTGRES_USER=postgres
export POSTGRES_PASSWORD=your-secure-password
export POSTGRES_HOST=your-db-host
export POSTGRES_PORT=5432
```

Alternatively, create a `.env` file (see `.env.example`):

```bash
cp .env.example .env
# Edit .env with your production values
```

### Deployment Steps

#### 1. Install Dependencies
```bash
pip install -r requirements.txt
npm install
```

#### 2. Build Frontend Assets
```bash
npm run build
```

#### 3. Run Migrations
```bash
python manage.py migrate
```

#### 4. Collect Static Files
```bash
python manage.py collectstatic --noinput
```

#### 5. Create Superuser
```bash
python manage.py createsuperuser
```

#### 6. Run with Production Server
```bash
gunicorn oathbreakers.wsgi:application --bind 0.0.0.0:8000
```

---

## 📋 Environment Configuration

### ENVIRONMENT Variable

The `ENVIRONMENT` variable controls validation behavior:

- **`development`** (default): Uses safe defaults, no env vars required
- **`staging`**: Optional intermediate environment
- **`production`**: Strict validation, requires all critical env vars

### Required Environment Variables in Production

| Variable | Required | Default (Dev) | Description |
|----------|----------|---------------|-------------|
| `ENVIRONMENT` | No | `development` | Environment mode |
| `DJANGO_SECRET_KEY` | Yes (prod) | Auto-generated | Django secret key |
| `DJANGO_DEBUG` | No | `True` | Debug mode |
| `DJANGO_ALLOWED_HOSTS` | No | `localhost,127.0.0.1` | Allowed hosts |
| `POSTGRES_DB` | No | `oathbearkers_db` | Database name |
| `POSTGRES_USER` | No | `postgres` | Database user |
| `POSTGRES_PASSWORD` | Yes (prod) | `mehran9731` | Database password |
| `POSTGRES_HOST` | No | `127.0.0.1` | Database host |
| `POSTGRES_PORT` | No | `5432` | Database port |

---

## 🗂️ Project Structure

```
oathbreakers/
├── game/                   # Main game application
│   ├── models.py          # Database models (cards, profiles, etc.)
│   ├── serializers.py     # DRF serializers
│   ├── views.py           # API views & page templates
│   ├── urls.py            # URL routing
│   ├── templates/         # HTML templates
│   │   └── game/
│   │       └── base.html  # Main React SPA template
│   └── static/           # Frontend assets
│       └── game/
│           ├── css/       # Stylesheets
│           ├── js/        # React components & logic
│           └── dist/      # Built JavaScript bundles
├── oathbreakers/          # Project settings
│   ├── settings.py        # Django settings
│   ├── urls.py            # Root URL configuration
│   └── wsgi.py            # WSGI entry point
├── manage.py              # Django management script
├── requirements.txt       # Python dependencies
├── package.json          # Node.js dependencies
├── webpack.config.js     # Webpack configuration
├── tailwind.config.js    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
├── .env.example          # Example environment variables
└── README.md            # This file
```

---

## 🎨 Frontend Architecture

### Tech Stack
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Zustand** - State management
- **Axios** - HTTP client

### Frontend Structure
```
game/static/game/js/
├── index.tsx             # Application entry point
├── App.tsx               # Main app component with routing
├── api.ts                # API client with interceptors
├── store.ts              # Zustand stores (auth, game, notifications)
├── utils.ts              # Utility functions
├── types.ts              # TypeScript type definitions
├── components/
│   ├── Card.tsx          # Card display component
│   ├── Button.tsx        # Button component
│   ├── Notification.tsx   # Toast notifications
│   └── Icons.tsx         # Icon components
└── pages/
    ├── Dashboard.tsx      # Main dashboard
    ├── Inventory.tsx      # Card inventory
    ├── Marketplace.tsx    # Black market
    ├── Shop.tsx          # Card pack shop
    ├── Profile.tsx       # User profile
    ├── Leaderboard.tsx   # Player rankings
    ├── Login.tsx         # Login page
    └── Register.tsx      # Registration page
```

### Building the Frontend

#### Development
```bash
# Watch mode - rebuilds CSS on changes
npm run dev

# Watch JavaScript only
npm run watch:js
```

#### Production
```bash
# Build all assets
npm run build

# Build CSS only
npm run build:css

# Build JS only
npm run build:js
```

---

## 🎮 Game Features

- **Player Profiles**: Avatars, XP, levels, and equipped cards
- **Card System**: Common, Rare, Epic, and Legendary cards
- **Pack Opening**: Buy and open card packs with different rarities
- **Mining System**: Claim mining rewards and exchange currencies
- **Marketplace**: List and buy cards with Vow Fragments
- **Inventory Management**: View and manage your card collection
- **Leaderboard**: Compete with other players

---

## 🛠️ Development Commands

### Python/Django
```bash
# Run development server
python manage.py runserver

# Run migrations
python manage.py migrate

# Create migrations
python manage.py makemigrations

# Create superuser
python manage.py createsuperuser

# Django shell
python manage.py shell

# Check for issues
python manage.py check
```

### Node.js/Frontend
```bash
# Install dependencies
npm install

# Development (watch CSS)
npm run dev

# Build for production
npm run build

# Build CSS only
npm run build:css
```

---

## 🧪 Testing

```bash
# Run tests
python manage.py test

# Run tests with coverage
coverage run --source='.' manage.py test
coverage report
```

---

## 📦 Dependencies

### Python
- **Django 5.2.9**: Web framework
- **Django REST Framework**: REST API toolkit
- **PostgreSQL**: Database (psycopg2-binary)
- **Pillow**: Image processing

See `requirements.txt` for full list.

### Node.js
- **react**: UI library
- **typescript**: Type safety
- **tailwindcss**: CSS framework
- **framer-motion**: Animations
- **zustand**: State management
- **axios**: HTTP client

See `package.json` for full list.

---

## 🔒 Security Notes

### Development
- Uses insecure default SECRET_KEY (safe for local development only)
- DEBUG mode enabled by default
- Default database password

### Production
- **Never commit `.env` files!**
- Always set `ENVIRONMENT=production`
- Use strong, unique SECRET_KEY
- Use secure database passwords
- Set DEBUG=False
- Configure ALLOWED_HOSTS properly
- Use HTTPS in production

---

## 🚀 Deployment Checklist

- [ ] Set `ENVIRONMENT=production`
- [ ] Set secure `DJANGO_SECRET_KEY`
- [ ] Set `DJANGO_DEBUG=False`
- [ ] Configure `DJANGO_ALLOWED_HOSTS`
- [ ] Set strong database password
- [ ] Run `npm install`
- [ ] Run `npm run build` (build frontend assets)
- [ ] Run `python manage.py migrate`
- [ ] Run `python manage.py collectstatic`
- [ ] Use production WSGI server (gunicorn/uwsgi)
- [ ] Configure HTTPS
- [ ] Set up proper logging
- [ ] Configure backup strategy

---

## 📝 License

[Your License Here]

---

## 👥 Contributing

[Contributing Guidelines Here]

---

## 📧 Contact

[Contact Information Here]

