# Oathbreakers Frontend Migration

## Overview
This project has been migrated from a separate Next.js frontend to a Django-embedded React SPA.

## Key Changes

### Removed
- `frontend/` directory (Next.js application)
- Old Django templates (index.html, login.html, register.html, welcome.html)
- Old JavaScript files (app.js, 3d-animations.js)
- Old template components and modals
- Extra documentation files (CHANGES_SUMMARY.md, FIXES_*.md, FRONTEND_*.md, etc.)

### Added
- React 18 SPA embedded in Django templates
- TypeScript for type safety
- Zustand for state management
- Framer Motion for animations
- Tailwind CSS for styling
- Axios for API calls
- Webpack for bundling
- Modern React component structure

## Frontend Structure
```
game/static/game/js/
├── index.tsx              # Entry point
├── App.tsx                # Main app with routing
├── api.ts                 # API client
├── store.ts               # Zustand stores
├── utils.ts               # Utilities
├── types.ts               # Type definitions
├── components/            # Reusable components
│   ├── Card.tsx
│   ├── Button.tsx
│   ├── Notification.tsx
│   └── Icons.tsx
└── pages/                # Page components
    ├── Dashboard.tsx
    ├── Inventory.tsx
    ├── Marketplace.tsx
    ├── Shop.tsx
    ├── Profile.tsx
    ├── Leaderboard.tsx
    ├── Login.tsx
    └── Register.tsx
```

## Build Process

### Development
```bash
npm install        # Install dependencies
npm run dev        # Watch and rebuild CSS
```

### Production
```bash
npm run build      # Build all assets
```

The build process creates:
- `game/static/game/dist/app.js` - Bundled React app
- `game/static/game/dist/vendor.js` - React vendor bundle
- `game/static/game/css/tailwind.css` - Compiled Tailwind CSS

## Configuration Files
- `package.json` - Node dependencies and scripts
- `webpack.config.js` - Webpack bundling configuration
- `tailwind.config.js` - Tailwind CSS customization
- `tsconfig.json` - TypeScript configuration
- `postcss.config.js` - PostCSS configuration
- `.babelrc` - Babel configuration for JSX/TSX

## Notes
- All pages now use `game/base.html` which serves the React SPA
- React handles routing internally based on URL path
- Static files are served by Django
- No separate Next.js server needed
