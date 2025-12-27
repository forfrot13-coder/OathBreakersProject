# OathBreakers Frontend Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Browser                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP Requests
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Next.js Frontend                        │
│                    (localhost:3000)                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ API Calls (Token Auth)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Django REST API                            │
│                   (localhost:8000)                         │
│                    /api/game/*                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   PostgreSQL    │
                    │    Database     │
                    └─────────────────┘
```

## Frontend Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js App Router                     │
│                  (app/ directory)                        │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐                   │
│  │   (auth)/    │  │   (game)/    │                   │
│  │  Route Group │  │  Route Group │                   │
│  └──────────────┘  └──────────────┘                   │
│       │                   │                             │
│       ▼                   ▼                             │
│  ┌──────┐          ┌──────────┐                      │
│  │Login │          │Dashboard │                      │
│  │Register│         │Inventory │                      │
│  └──────┘          │Marketplace│                     │
│                    │   Shop   │                      │
│                    │ Profile  │                      │
│                    │Leaderboard│                     │
│                    └──────────┘                      │
└─────────────────────────────────────────────────────────────┘
```

## Component Architecture

```
Page Components
       │
       ├── Layout Components (Navbar, Sidebar, Footer)
       │
       ├── Common Components (Button, Modal, Loading, Toast)
       │
       ├── Game Components
       │     ├── CardDisplay
       │     ├── MiningWidget
       │     ├── PackOpening
       │     └── CurrencyDisplay
       │
       └── Card Components
             └── CardGrid
```

## State Management

```
┌─────────────────────────────────────────────────────────────┐
│                   Zustand Stores                        │
├─────────────────────────────────────────────────────────────┤
│                                                         │
│  authStore:                                            │
│  ┌──────────────────────────────────────┐               │
│  │ user: User | null                 │               │
│  │ token: string | null               │               │
│  │ isLoading: boolean                │               │
│  │ login(), register(), logout()      │               │
│  │ setUser(), initializeAuth()        │               │
│  └──────────────────────────────────────┘               │
│                    ↑ localStorage                      │
│                    └──────────┘                         │
│                                                         │
│  gameStore:                                             │
│  ┌──────────────────────────────────────┐               │
│  │ cards: Card[]                    │               │
│  │ marketListings: MarketListing[]    │               │
│  │ packs: Pack[]                    │               │
│  │ leaderboard: LeaderboardEntry[]    │               │
│  │ isLoading: boolean                │               │
│  │ fetchCards(), fetchMarket(),        │               │
│  │ buyCard(), listCard(), etc.       │               │
│  └──────────────────────────────────────┘               │
│                    ↑ API calls                         │
│                    └──────────┘                         │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

```
User Action
    │
    ├─→ Page Component
    │       │
    │       ├─→ Zustand Store (State Update)
    │       │       │
    │       │       └─→ LocalStorage (Persist Auth)
    │       │
    │       └─→ API Call (Axios)
    │               │
    │               ├─→ Request Interceptor (Add Token)
    │               │
    │               └─→ Django Backend
    │                       │
    │                       └─→ Response
    │                               │
    │                               ├─→ Success: Update State + Show Toast
    │                               └─→ Error: Show Toast
    │
    └─→ Re-render UI
```

## API Integration

```
┌─────────────────────────────────────────────────────────────┐
│                  lib/api.ts (Axios)                    │
│                                                          │
│  ┌────────────────────────────────────────────┐           │
│  │  const api = axios.create({             │           │
│  │    baseURL: process.env.API_BASE_URL,    │           │
│  │  })                                    │           │
│  └────────────────────────────────────────────┘           │
│                    │                                  │
│                    ▼                                  │
│  ┌────────────────────────────────────────────┐           │
│  │  Request Interceptor:                   │           │
│  │  - Add Authorization header              │           │
│  │  - Get token from localStorage          │           │
│  └────────────────────────────────────────────┘           │
│                    │                                  │
│                    ▼                                  │
│  ┌────────────────────────────────────────────┐           │
│  │  Response Interceptor:                  │           │
│  │  - Handle 401 errors                  │           │
│  │  - Redirect to login                  │           │
│  │  - Pass errors to calling code         │           │
│  └────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

## Styling Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Styling System                          │
├─────────────────────────────────────────────────────────────┤
│                                                         │
│  1. CSS Variables (styles/variables.css)                │
│     └─→ Colors, Spacing, Shadows, Borders              │
│                                                         │
│  2. Tailwind CSS (tailwind.config.ts)                   │
│     └─→ Utility classes, Custom theme                    │
│                                                         │
│  3. Animations (styles/animations.css)                    │
│     └─→ Keyframes, Animation classes                  │
│                                                         │
│  4. Component Styles                                    │
│     └─→ Tailwind classes + Inline styles               │
│                                                         │
│  5. Global Styles (styles/globals.css)                   │
│     └─→ Reset, Base styles, Utilities                │
│                                                         │
└─────────────────────────────────────────────────────────────┘
```

## Route Structure

```
/ (root)
├── → Redirect to login or dashboard
│
/login
├── → Login form
├── → POST /auth/login/
└── → Redirect to /game/dashboard
│
/register
├── → Register form
├── → POST /auth/register/
└── → Redirect to /game/dashboard
│
/game (protected route group)
├── → Layout with Navbar, Sidebar, Footer
│   │
│   ├── /game/dashboard
│   │   ├── → User profile card
│   │   ├── → Mining widget
│   │   ├── → Quick actions
│   │   └── → Recent cards
│   │
│   ├── /game/inventory
│   │   ├── → Cards grid
│   │   ├── → Rarity filters
│   │   └── → Card detail modal
│   │
│   ├── /game/marketplace
│   │   ├── → Listings grid
│   │   ├── → Rarity filters
│   │   └── → Buy functionality
│   │
│   ├── /game/shop
│   │   ├── → Packs display
│   │   └── → Pack opening modal
│   │
│   ├── /game/profile
│   │   ├── → Profile header
│   │   ├── → Stats display
│   │   └── → Avatar editing
│   │
│   └── /game/leaderboard
│       ├── → Leaderboard list
│       └── → User rank card
```

## Tech Stack

```
┌─────────────────────────────────────────────────────────────┐
│                   Technology Stack                       │
├─────────────────────────────────────────────────────────────┤
│                                                         │
│  Framework:      Next.js 14 (App Router)                │
│  Language:      TypeScript                              │
│  Styling:       Tailwind CSS + Custom CSS              │
│  State:         Zustand                                 │
│  Animations:    Framer Motion                          │
│  HTTP Client:   Axios                                   │
│  Notifications: React Hot Toast                        │
│  Icons:         Emojis (no dependencies)               │
│                                                         │
│  Build Tool:    Next.js (Turbopack)                   │
│  Package Mgr:   npm                                    │
│  Runtime:       Node.js 18+                            │
│                                                         │
└─────────────────────────────────────────────────────────────┘
```

## Security

```
┌─────────────────────────────────────────────────────────────┐
│                   Security Layers                        │
├─────────────────────────────────────────────────────────────┤
│                                                         │
│  1. Authentication                                     │
│     └─→ Token-based (JWT-like)                      │
│     └─→ localStorage persistence                      │
│     └─→ Protected routes                              │
│                                                         │
│  2. Authorization                                      │
│     └─→ Token attached to all requests                │
│     └─→ Backend validation                           │
│                                                         │
│  3. Data Protection                                    │
│     └─→ XSS protection (React auto-escape)          │
│     └─→ CSRF protection (via backend)                │
│     └─→ HTTPS in production                          │
│                                                         │
│  4. Input Validation                                   │
│     └─→ Client-side validation                         │
│     └─→ Server-side validation (backend)              │
│                                                         │
│  5. Secrets Management                                  │
│     └─→ Environment variables                          │
│     └─→ No hardcoded secrets                         │
│     └─→ .gitignore protection                         │
│                                                         │
└─────────────────────────────────────────────────────────────┘
```

## Performance Optimizations

```
┌─────────────────────────────────────────────────────────────┐
│              Performance Optimizations                    │
├─────────────────────────────────────────────────────────────┤
│                                                         │
│  1. Code Splitting                                     │
│     └─→ Automatic with Next.js App Router             │
│     └─→ Lazy loading components                     │
│                                                         │
│  2. Image Optimization                                   │
│     └─→ Next.js Image component                       │
│     └─→ WebP conversion                              │
│     └─→ Lazy loading                                 │
│                                                         │
│  3. State Management                                     │
│     └─→ Zustand (lightweight)                         │
│     └─→ Selective re-renders                         │
│                                                         │
│  4. CSS Optimization                                    │
│     └─→ Tailwind (purge unused)                     │
│     └─→ CSS-in-JS reduction                         │
│                                                         │
│  5. Bundle Size                                        │
│     └─→ Tree shaking                                 │
│     └─→ Minimal dependencies                         │
│                                                         │
└─────────────────────────────────────────────────────────────┘
```

## Development Workflow

```
1. Development Server
   └─→ npm run dev
       └─→ localhost:3000

2. Code Changes
   ├─→ Hot Module Replacement (HMR)
   ├─→ Fast refresh (React)
   └─→ Instant updates

3. Type Checking
   └─→ TypeScript compiler

4. Linting
   └─→ npm run lint

5. Building
   └─→ npm run build
       └─→ Optimized production build

6. Testing
   └─→ Manual testing
   └─→ API integration testing
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Deployment Options                      │
├─────────────────────────────────────────────────────────────┤
│                                                         │
│  1. Vercel (Recommended)                               │
│     ├─→ Git push → Auto deploy                        │
│     ├─→ Preview deployments                           │
│     └─→ Edge network                                  │
│                                                         │
│  2. Netlify                                            │
│     ├─→ Git push → Auto deploy                        │
│     ├─→ Preview deployments                           │
│     └─→ CDN edge                                     │
│                                                         │
│  3. Railway                                            │
│     ├─→ Docker support                               │
│     ├─→ PostgreSQL included                          │
│     └─→ Full-stack deployment                       │
│                                                         │
│  4. Traditional VPS                                    │
│     ├─→ PM2 process manager                        │
│     ├─→ Nginx reverse proxy                        │
│     └─→ SSL certificate                             │
│                                                         │
└─────────────────────────────────────────────────────────────┘
```

---

**Status**: ✅ Architecture Complete
**Branch**: feat/oathbreakers-frontend-structure
**Date**: 2024-12-27
