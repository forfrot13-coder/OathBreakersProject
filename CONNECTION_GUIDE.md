# Frontend-Backend Connection Guide

This guide helps you verify the connection between the Next.js frontend (localhost:3000) and Django backend (localhost:8000).

## Prerequisites

1. **Backend running on port 8000:**
   ```bash
   cd /home/engine/project
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py runserver 0.0.0.0:8000
   ```

2. **Frontend running on port 3000:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Configuration

### Backend (.env or settings)
```env
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/game
NEXT_PUBLIC_APP_NAME=OathBreakers
```

## CORS Configuration

The backend is configured to accept requests from:
- `http://localhost:3000`
- `http://127.0.0.1:3000`

## API Endpoints

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/auth/login/` | POST | No | User login |
| `/auth/register/` | POST | No | User registration |
| `/profile/me/` | GET | Yes | Get user profile |
| `/profile/update/` | POST | Yes | Update profile |
| `/claim/` | POST | Yes | Claim mining rewards |
| `/my-cards/` | GET | Yes | Get user's cards |
| `/market/` | GET | No | List market listings |
| `/market/create/` | POST | Yes | Create listing |
| `/market/buy/<id>/` | POST | Yes | Buy a card |
| `/packs/` | GET | Yes | Get available packs |
| `/open-pack/` | POST | Yes | Open a pack |
| `/leaderboard/` | GET | No | Get leaderboard |
| `/avatars/` | GET | Yes | Get available avatars |
| `/equip/` | POST | Yes | Equip a card |

## Testing Connection

### Option 1: Using the Test Script
```bash
# From the frontend directory
cd frontend
node scripts/test-api.js
```

Or with the environment variable:
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/game node scripts/test-api.js
```

### Option 2: Manual Test with curl

**Test CORS preflight:**
```bash
curl -X OPTIONS \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: GET" \
  -I http://localhost:8000/api/game/leaderboard/
```

**Test public endpoint:**
```bash
curl http://localhost:8000/api/game/leaderboard/
```

**Test authenticated endpoint (after login):**
```bash
# First login to get token
TOKEN=$(curl -s -X POST http://localhost:8000/api/game/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}' | jq -r '.token')

# Then use the token
curl http://localhost:8000/api/game/profile/me/ \
  -H "Authorization: Token $TOKEN"
```

## Expected CORS Headers

For requests from `http://localhost:3000`, the response should include:
```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Credentials: true
```

## Troubleshooting

### CORS Error
If you see `Access to fetch at 'http://localhost:8000/api/game/...' from origin 'http://localhost:3000' has been blocked by CORS policy`:

1. Verify `django-cors-headers` is installed
2. Check `CORS_ALLOWED_ORIGINS` in settings.py
3. Ensure `CorsMiddleware` is at the top of MIDDLEWARE

### 401 Unauthorized
- Make sure you're sending the token in the `Authorization` header: `Token <token>`
- Check that the token is valid and not expired

### 404 Not Found
- Verify the endpoint URL matches exactly
- Check that the Django server is running
- Ensure the URL path includes `/api/game/` prefix

### Connection Refused
- Make sure Django is running on port 8000
- Check that Django is bound to `0.0.0.0` or `127.0.0.1`
- Verify no firewall is blocking the connection
