# Frontend Development Guide

## 📖 Quick Start

### Prerequisites
- Node.js 18+ installed
- Django backend running on `http://localhost:8000`
- npm or yarn package manager

### Installation Steps

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
# or
yarn install
```

3. **Create environment file:**
```bash
cp .env.local.example .env.local
```

4. **Edit .env.local if needed:**
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/game
NEXT_PUBLIC_APP_NAME=OathBreakers
```

5. **Start development server:**
```bash
npm run dev
```

6. **Open browser:**
Navigate to `http://localhost:3000`

## 🏗️ Architecture

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Custom CSS
- **State Management**: Zustand
- **Animations**: Framer Motion
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast

### Folder Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth route group
│   │   ├── login/         # Login page
│   │   ├── register/      # Register page
│   │   └── layout.tsx     # Auth layout
│   ├── (game)/            # Game route group
│   │   ├── dashboard/     # Dashboard page
│   │   ├── inventory/     # Inventory page
│   │   ├── marketplace/   # Marketplace page
│   │   ├── shop/         # Shop page
│   │   ├── profile/      # Profile page
│   │   ├── leaderboard/   # Leaderboard page
│   │   └── layout.tsx    # Game layout
│   ├── components/        # Reusable components
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility functions & API
│   ├── store/           # Zustand stores
│   ├── styles/          # Global styles
│   └── public/          # Static assets
```

## 🎨 Components

### Common Components
Located in `components/Common/`:

1. **Button**: Reusable button component
   - Variants: primary, secondary, danger, success, ghost
   - Sizes: sm, md, lg
   - Loading state support

2. **Loading**: Loading spinner with message
   - Customizable message prop

3. **Modal**: Animated modal component
   - Backdrop blur effect
   - Size variants: sm, md, lg, xl
   - Escape key to close
   - Click outside to close

4. **Toast**: Notification component
   - Types: success, error, info, warning
   - Auto-dismiss support

### Game Components
Located in `components/Game/`:

1. **CardDisplay**: 3D card display
   - Rarity-based colors
   - Hover effects with 3D tilt
   - Shine animations for legendary cards
   - Size variants: sm, md, lg

2. **MiningWidget**: Real-time mining widget
   - Auto-updating earnings counter
   - Claim button with cooldown
   - Progress bar
   - Mining rate display

3. **PackOpening**: Animated pack opening
   - Pack reveal animation
   - Card-by-card reveal
   - Rarity-specific effects

4. **CurrencyDisplay**: Multi-currency display
   - Coins (🪙)
   - Gems (💎)
   - Vow Fragments (🔮)
   - Compact and full variants

### Layout Components
Located in `components/Layout/`:

1. **Navbar**: Top navigation bar
   - User info display
   - Navigation links
   - Logout button
   - Currency display

2. **Sidebar**: Side navigation
   - Active route highlighting
   - Hover effects
   - Player stats section

3. **Footer**: Page footer
   - Links
   - Copyright info

## 🗂️ Pages

### Authentication Pages

#### Login (`/login`)
- Username/password form
- Form validation
- Error handling
- Redirect after login

#### Register (`/register`)
- Username/password form
- Password confirmation
- Client-side validation
- Error handling

### Game Pages

#### Dashboard (`/game/dashboard`)
- User profile card
- Currency display
- Mining widget
- Quick action buttons
- Recent cards grid

#### Inventory (`/game/inventory`)
- Grid of user's cards
- Rarity filter
- Card detail modal
- List in marketplace
- Market status indicators

#### Marketplace (`/game/marketplace`)
- Grid of listings
- Rarity filter
- Card preview
- Price display
- Buy functionality

#### Shop (`/game/shop`)
- Pack display
- Pack opening modal
- Currency requirements
- Rarity guarantees

#### Profile (`/game/profile`)
- User profile header
- Avatar editing
- XP progress bar
- Stats by rarity
- Currency display
- Recent cards

#### Leaderboard (`/game/leaderboard`)
- User rank card
- Full rankings
- Top 3 styling
- Progress indicators
- Legend/rules

## 🏪 State Management

### Auth Store (`store/authStore.ts`)
```typescript
interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login(username, password): Promise<void>;
  register(username, password, confirmPassword): Promise<void>;
  logout(): void;
  setUser(user): void;
  initializeAuth(): void;
}
```

### Game Store (`store/gameStore.ts`)
```typescript
interface GameStore {
  cards: Card[];
  selectedCard: Card | null;
  marketListings: MarketListing[];
  packs: Pack[];
  leaderboard: LeaderboardEntry[];
  isLoading: boolean;
  error: string | null;

  fetchCards(): Promise<void>;
  selectCard(card): void;
  updateCards(cards): void;
  fetchMarketListings(): Promise<void>;
  buyCard(listingId): Promise<void>;
  listCard(cardId, price, currency): Promise<void>;
  fetchPacks(): Promise<void>;
  openPack(packId): Promise<Card[]>;
  fetchLeaderboard(): Promise<void>;
}
```

## 🎨 Styling

### CSS Variables (`styles/variables.css`)
- Colors: primary, secondary, backgrounds, text
- Rarity colors: common, rare, epic, legendary
- Spacing: xs, sm, md, lg, xl, 2xl
- Border radius: sm, md, lg, xl, 2xl
- Shadows: sm, md, lg, xl
- Transitions: fast, base, slow

### Animations (`styles/animations.css`)
- fadeIn, slideUp, slideDown
- cardFlip, shimmer, pulse
- bounce, spin, scaleIn
- float, glowPulse

### Tailwind Configuration
- Custom colors mapped to CSS variables
- Extended theme for gaming UI
- Responsive breakpoints
- Animation utilities

## 🔗 API Integration

### API Wrapper (`lib/api.ts`)
Axios instance with:
- Base URL from environment
- Automatic token injection
- Request/response interceptors
- Error handling (401 redirect)

### Utility Functions (`lib/utils.ts`)
- `cn()`: Class name merging with clsx
- `formatNumber()`: Number localization
- `getRarityColor()`: Rarity color mapping
- `getRarityGradient()`: Rarity gradient mapping
- `getCurrencyIcon()`: Currency icon mapping
- `formatDate()`: Date formatting in Persian

## 🎯 Custom Hooks

### useAuth (`hooks/useAuth.ts`)
Convenient hook wrapping authStore:
```typescript
const {
  user,
  token,
  isAuthenticated,
  isLoading,
  login,
  register,
  logout,
  setUser
} = useAuth();
```

## 🚀 Development Workflow

### Running Locally

1. **Start Django backend:**
```bash
cd ..
python manage.py runserver
```

2. **Start Next.js frontend:**
```bash
cd frontend
npm run dev
```

3. **Access application:**
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000/api/game`

### Building for Production

```bash
# Build
npm run build

# Test production build
npm start
```

### Linting

```bash
npm run lint
```

## 📝 Code Conventions

### Component Structure
```typescript
'use client'; // Add for client components

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function MyComponent() {
  // State
  const [data, setData] = useState(null);

  // Effects
  useEffect(() => {
    // Effect logic
  }, []);

  // Handlers
  const handleClick = () => {
    // Handler logic
  };

  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

### Styling Conventions
- Use Tailwind classes for most styling
- Use inline styles for dynamic values (colors, animations)
- Use CSS variables for theme colors
- Use motion components for animations

### TypeScript Conventions
- Use interfaces for type definitions
- Export types when reused
- Use type assertions sparingly
- Enable strict mode in tsconfig

## 🐛 Debugging

### Common Issues

1. **API Errors:**
   - Check Django backend is running
   - Verify API_BASE_URL in .env.local
   - Check browser console for errors

2. **Authentication Issues:**
   - Clear localStorage
   - Check token in dev tools
   - Verify backend auth endpoints

3. **Styling Issues:**
   - Check Tailwind classes are correct
   - Verify CSS variables are defined
   - Check responsive breakpoints

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Zustand Documentation](https://zustand-demo.pmnd.rs)
- [Framer Motion Documentation](https://www.framer.com/motion)

## 🤝 Contributing

When adding new features:

1. Create feature branch
2. Update documentation
3. Add type definitions
4. Follow code conventions
5. Test thoroughly
6. Submit pull request

## 📄 License

Same as parent project.
