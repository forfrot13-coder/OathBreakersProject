# OathBreakers Frontend

یک Frontend مدرن برای بازی OathBreakers با استفاده از Next.js 14، TypeScript، و Tailwind CSS.

## 🚀 ویژگی‌ها

### ✅ Structure
- ✅ Next.js App Router با TypeScript
- ✅ ساختار مبتنی بر folder برای صفحات و کامپوننت‌ها
- ✅ کامپوننت‌های قابل استفاده مجدد

### ✅ Authentication
- ✅ صفحه Login کامل و کاربردی
- ✅ صفحه Register کامل
- ✅ مدیریت توکن و ذخیره‌سازی در localStorage
- ✅ حفظ session کاربر

### ✅ Pages
- ✅ Dashboard (با Inventory، Mining، Quick Actions)
- ✅ Marketplace (لیست، فیلتر، خرید)
- ✅ Inventory (مشاهده و مدیریت کارت‌ها)
- ✅ Shop (خرید پک کارت با انیمیشن باز کردن)
- ✅ Profile (مشاهده و ویرایش پروفایل)
- ✅ Leaderboard (رتبه‌بندی بازیکنان)

### ✅ Components
- ✅ CardDisplay با انیمیشن‌های 3D
- ✅ MiningWidget برای استخراج
- ✅ CurrencyDisplay برای نمایش ارزها
- ✅ Modal برای پنجره‌های پاپ‌آپ
- ✅ Loading برای وضعیت بارگذاری
- ✅ Button با variantهای مختلف
- ✅ Toast برای اعلان‌ها

### ✅ Styling
- ✅ Dark theme با حالت gaming
- ✅ Responsive design برای موبایل و دسکتاپ
- ✅ رنگ‌بندی بر اساس نادرتی کارت‌ها
- ✅ انیمیشن‌های smooth با Framer Motion
- ✅ CSS Variables برای تم‌بندی آسان

### ✅ API Integration
- ✅ Axios wrapper برای API calls
- ✅ Token authorization در تمام درخواست‌ها
- ✅ Error handling و نمایش خطاها
- ✅ Toast notifications برای بازخورد کاربر

### ✅ State Management
- ✅ Zustand برای مدیریت state
- ✅ authStore برای احراز هویت
- ✅ gameStore برای داده‌های بازی

## 📦 نصب و اجرا

### پیش‌نیازها
- Node.js 18+ نصب شده
- Django backend در حال اجرا روی `http://localhost:8000`

### مراحل نصب

1. **نصب dependencies**
```bash
cd frontend
npm install
```

2. **ایجاد فایل env**
```bash
cp .env.local.example .env.local
```

3. **اجرای development server**
```bash
npm run dev
```

4. **باز کردن برنامه در مرورگر**
```
http://localhost:3000
```

## 🗂️ ساختار پروژه

```
frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx          # صفحه ورود
│   │   ├── register/
│   │   │   └── page.tsx          # صفحه ثبت‌نام
│   │   └── layout.tsx            # Layout احراز هویت
│   │
│   ├── (game)/
│   │   ├── dashboard/
│   │   │   └── page.tsx          # داشبورد اصلی
│   │   ├── inventory/
│   │   │   └── page.tsx          # مدیریت موجودی
│   │   ├── marketplace/
│   │   │   └── page.tsx          # بازار کارت
│   │   ├── shop/
│   │   │   └── page.tsx          # فروشگاه پک
│   │   ├── profile/
│   │   │   └── page.tsx          # پروفایل کاربر
│   │   ├── leaderboard/
│   │   │   └── page.tsx          # رتبه‌بندی
│   │   └── layout.tsx            # Layout بازی
│   │
│   ├── components/
│   │   ├── Auth/                 # کامپوننت‌های احراز هویت
│   │   ├── Game/
│   │   │   ├── Card/
│   │   │   │   └── CardDisplay.tsx
│   │   │   ├── Mining/
│   │   │   │   └── MiningWidget.tsx
│   │   │   ├── Pack/
│   │   │   │   └── PackOpening.tsx
│   │   │   └── Currency/
│   │   │       └── CurrencyDisplay.tsx
│   │   ├── Layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Footer.tsx
│   │   ├── Common/
│   │   │   ├── Button.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Loading.tsx
│   │   │   └── Toast.tsx
│   │   └── Card/
│   │       ├── CardGrid.tsx
│   │       └── CardItem.tsx
│   │
│   ├── hooks/
│   │   └── useAuth.ts            # Hook احراز هویت
│   │
│   ├── lib/
│   │   ├── api.ts                # API wrapper
│   │   └── utils.ts              # Utility functions
│   │
│   ├── store/
│   │   ├── authStore.ts          # Auth state
│   │   └── gameStore.ts          # Game state
│   │
│   ├── globals.css               # Global styles
│   └── layout.tsx                # Root layout
│
├── styles/
│   ├── variables.css             # CSS variables
│   ├── animations.css            # Animations
│   └── globals.css               # Base styles
│
├── public/                       # Static assets
│
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── README.md
```

## 🎨 استایل‌بندی

### رنگ‌های نادرتی کارت‌ها
- **COMMON**: `#6b7280` (خاکستری)
- **RARE**: `#3b82f6` (آبی)
- **EPIC**: `#a855f7` (بنفش)
- **LEGENDARY**: `#f59e0b` (طلایی)

### Theme
- **Background primary**: `#0f172a` (Slate-900)
- **Background secondary**: `#1e293b` (Slate-800)
- **Primary color**: `#6366f1` (Indigo-500)
- **Secondary color**: `#a855f7` (Purple-500)

## 🔧 Environment Variables

فایل `.env.local` خود را با مقادیر زیر ایجاد کنید:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/game
NEXT_PUBLIC_APP_NAME=OathBreakers
```

## 📱 Responsive Design

اپلیکیشن کاملاً responsive طراحی شده است:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🎮 API Integration

### Endpoints استفاده شده

| Endpoint | Method | توضیحات |
|----------|--------|---------|
| `/auth/login/` | POST | ورود کاربر |
| `/auth/register/` | POST | ثبت‌نام کاربر |
| `/profile/` | GET/PUT | پروفایل کاربر |
| `/my-cards/` | GET | کارت‌های کاربر |
| `/market/` | GET | لیست بازار |
| `/market/buy/:id/` | POST | خرید کارت |
| `/market/list/` | POST | ثبت کارت در بازار |
| `/packs/` | GET | لیست پک‌ها |
| `/open-pack/` | POST | باز کردن پک |
| `/claim/` | POST | برداشت سکه |
| `/leaderboard/` | GET | رتبه‌بندی |

## 🔐 Authentication

کاربران با Token احراز هویت می‌شوند:
- Token در localStorage ذخیره می‌شود
- به تمام درخواست‌های API به عنوان `Authorization: Token <token>` اضافه می‌شود
- با بستن مرورگر session حفظ می‌شود

## 🎯 Features

### Dashboard
- نمایش اطلاعات کاربر
- Mining widget برای استخراج سکه
- دسترسی سریع به بخش‌های مختلف
- نمایش کارت‌های اخیر

### Inventory
- مشاهده تمام کارت‌ها
- فیلتر بر اساس نادرتی
- مشاهده جزئیات کارت
- ثبت کارت در بازار

### Marketplace
- مشاهده تمام آگهی‌ها
- فیلتر بر اساس نادرتی
- خرید کارت با ارزهای مختلف
- نمایش قیمت به ارزهای مختلف

### Shop
- مشاهده پک‌های موجود
- باز کردن پک با انیمیشن جذاب
- نمایش کارت‌های دریافت شده

### Profile
- مشاهده اطلاعات پروفایل
- ویرایش آواتار
- نمایش آمار کارت‌ها
- نمایش ارزها

### Leaderboard
- مشاهده رتبه کاربر
- لیست بازیکنان برتر
- نمایش امتیاز هر بازیکن

## 🛠️ Development

```bash
# نصب dependencies
npm install

# اجرای development server
npm run dev

# Build برای production
npm run build

# اجرای production build
npm start

# Linting
npm run lint
```

## 📝 توضیحات اضافی

### State Management
- استفاده از Zustand برای مدیریت state
- authStore برای احراز هویت
- gameStore برای داده‌های بازی

### Animations
- Framer Motion برای انیمیشن‌ها
- انیمیشن‌های 3D برای کارت‌ها
- انیمیشن‌های smooth برای UI

### Error Handling
- نمایش خطاها با toast
- مدیریت خطاهای API
- نمایش loading states

## 🚀 Deployment

برای deployment، مطمئن شوید که:
1. Environment variables را در پلتفرم deployment تنظیم کرده‌اید
2. API_BASE_URL را به URL production backend تغییر دهید
3. دستور `npm run build` را اجرا کنید

## 🤝 Contributing

1. Fork کنید
2. Branch خود را ایجاد کنید (`git checkout -b feature/amazing-feature`)
3. Commit کنید (`git commit -m 'Add some amazing feature'`)
4. Push کنید (`git push origin feature/amazing-feature`)
5. Pull Request ایجاد کنید

## 📄 License

این پروژه تحت لایسنس [Your License] منتشر شده است.
