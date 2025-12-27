# Oathbreakers - Trading Card Game

A Django-based trading card game with REST API backend and modern Next.js frontend.

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

#### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

#### 4. Run Migrations
```bash
python manage.py migrate
```

#### 5. Create Superuser
```bash
python manage.py createsuperuser
```

#### 6. Run Development Server
```bash
python manage.py runserver
```

**✨ No environment variables needed for development!** The application will use sensible defaults.

Visit: `http://localhost:8000/`

---

## 🎨 Frontend Setup (Next.js)

This project includes a modern Next.js 14 frontend with TypeScript and Tailwind CSS.

### Frontend Installation

```bash
cd frontend
npm install
cp .env.local.example .env.local
```

### Run Frontend Development Server

```bash
npm run dev
```

Visit: `http://localhost:3000/`

### Frontend Features

- **Modern UI**: Built with Next.js 14, TypeScript, and Tailwind CSS
- **State Management**: Zustand for efficient state management
- **Animations**: Framer Motion for smooth 3D animations
- **API Integration**: Axios wrapper with automatic token handling
- **Responsive Design**: Mobile-first approach with full responsiveness
- **Dark Theme**: Gaming-themed dark UI throughout

### Frontend Pages

- `/login` - User authentication
- `/register` - User registration
- `/game/dashboard` - Main dashboard with mining widget
- `/game/inventory` - Card inventory management
- `/game/marketplace` - Buy and sell cards
- `/game/shop` - Purchase card packs
- `/game/profile` - User profile and stats
- `/game/leaderboard` - Player rankings

For detailed frontend documentation, see [frontend/README.md](frontend/README.md).

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
```

#### 2. Run Migrations
```bash
python manage.py migrate
```

#### 3. Collect Static Files
```bash
python manage.py collectstatic --noinput
```

#### 4. Create Superuser
```bash
python manage.py createsuperuser
```

#### 5. Run with Production Server
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
│   ├── views.py           # API views
│   ├── urls.py            # URL routing
│   ├── templates/         # HTML templates
│   └── static/            # CSS, JS, images
├── oathbreakers/          # Project settings
│   ├── settings.py        # Django settings
│   ├── urls.py            # Root URL configuration
│   └── wsgi.py            # WSGI entry point
├── manage.py              # Django management script
├── requirements.txt       # Python dependencies
├── .env.example          # Example environment variables
└── README.md             # This file
```

---

## 🎮 Game Features

- **Player Profiles**: Avatars, XP, levels, and equipped cards
- **Card System**: Common, Rare, Epic, and Legendary cards
- **Pack Opening**: Buy and open card packs with different rarities
- **Mining System**: Claim mining rewards and exchange currencies
- **Marketplace**: List and buy cards from other players
- **Inventory Management**: View and manage your card collection
- **Leaderboard**: Compete with other players

---

## 🛠️ Development Commands

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

- **Django 5.2.9**: Web framework
- **Django REST Framework**: REST API toolkit
- **PostgreSQL**: Database (psycopg2-binary)
- **Pillow**: Image processing

See `requirements.txt` for full list.

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

## 📝 License

[Your License Here]

---

## 👥 Contributing

[Contributing Guidelines Here]

---

## 📧 Contact

[Contact Information Here]
