# 🌾 Village Connect

> Connecting Villages to the World — Fresh produce, handmade products and local services directly from rural communities.

A full-stack e-commerce platform built with **Next.js 14**, **React**, **TypeScript**, **Tailwind CSS**, and **Supabase**.

---

## 🗂 Project Structure

```
village-connect/
├── app/                         # Next.js App Router pages
│   ├── page.tsx                 # Home page
│   ├── layout.tsx               # Root layout (Header, Footer, CartDrawer)
│   ├── globals.css              # Global Tailwind CSS
│   ├── loading.tsx              # Global loading state
│   ├── error.tsx                # Global error boundary
│   ├── not-found.tsx            # 404 page
│   ├── about/page.tsx           # About us
│   ├── products/
│   │   ├── page.tsx             # Products listing with filters
│   │   └── [slug]/page.tsx      # Product detail
│   ├── categories/
│   │   ├── page.tsx             # All categories
│   │   └── [slug]/page.tsx      # Category with products
│   ├── farmers/
│   │   ├── page.tsx             # Farmers listing
│   │   └── [id]/page.tsx        # Farmer profile + products
│   ├── cart/page.tsx            # Shopping cart
│   ├── checkout/page.tsx        # Multi-step checkout
│   ├── orders/
│   │   ├── page.tsx             # Order history
│   │   └── [id]/page.tsx        # Order detail + tracking
│   ├── profile/page.tsx         # User profile
│   ├── addresses/page.tsx       # Saved addresses
│   ├── wishlist/page.tsx        # Wishlist
│   ├── support/page.tsx         # Help & FAQ
│   └── auth/
│       ├── login/page.tsx
│       ├── register/page.tsx
│       ├── forgot-password/page.tsx
│       ├── reset-password/page.tsx
│       └── callback/route.ts    # OAuth callback
│
├── components/
│   ├── layout/
│   │   ├── Header.tsx           # Sticky header with search & auth
│   │   ├── Footer.tsx           # Full footer with links
│   │   └── CartDrawer.tsx       # Slide-out cart
│   ├── home/
│   │   ├── HeroSection.tsx      # Animated hero with search
│   │   ├── CategoriesSection.tsx
│   │   ├── FeaturedProducts.tsx
│   │   ├── WhyChooseUs.tsx
│   │   ├── FarmerStories.tsx
│   │   ├── OfferBanner.tsx      # Live countdown timer
│   │   └── Newsletter.tsx
│   └── products/
│       └── ProductCard.tsx      # Reusable product card
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts            # Browser Supabase client
│   │   ├── server.ts            # Server-side Supabase client
│   │   └── middleware.ts        # Session refresh middleware
│   ├── store/
│   │   └── cart.ts              # Zustand cart store (persisted)
│   └── utils.ts                 # formatPrice, slugify, etc.
│
├── types/
│   └── database.ts              # Full Supabase TypeScript types
│
├── supabase-schema.sql          # Complete DB schema + seed data
├── middleware.ts                # Next.js middleware for auth
└── .env.local.example           # Environment variables template
```

---

## 🚀 Quick Start

### 1. Clone and install

```bash
git clone <your-repo>
cd village-connect
npm install
```

### 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In the SQL editor, paste and run the entire **`supabase-schema.sql`** file
3. Enable **Authentication → Providers → Email** (already on by default)
4. Optionally enable **Google OAuth** under Authentication → Providers → Google

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Find your keys at: **Supabase Dashboard → Settings → API**

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 🗄️ Database Schema

### Tables

| Table | Description |
|-------|-------------|
| `profiles` | User accounts (customer / farmer / admin) |
| `categories` | Product categories (Vegetables, Fruits, etc.) |
| `farmers` | Farmer profiles linked to user accounts |
| `products` | Product listings with images, pricing, stock |
| `cart_items` | Per-user shopping cart |
| `wishlists` | Saved products |
| `orders` | Order records with delivery & payment info |
| `order_items` | Individual items within each order |
| `reviews` | Product ratings and comments |
| `addresses` | Saved delivery addresses |

### Row Level Security
All tables have RLS enabled. Users can only read/write their own data. Products and categories are publicly readable.

---

## ✨ Features

### Customer Features
- 🛒 **Cart** — Persistent cart with Zustand (survives page refresh)
- 💳 **Checkout** — 3-step: Address → Payment → Review
- 📦 **Orders** — Full order history with status tracking
- ❤️ **Wishlist** — Save favourite products
- 📍 **Addresses** — Manage multiple delivery addresses
- 👤 **Profile** — Update name, phone, avatar
- 🔍 **Search** — Search products by name
- 🏷️ **Filters** — Filter by category, organic, sort by price/rating

### Farmer Features
- 🌾 **Farmer profiles** — Verified badges, ratings, bio
- 📦 **Product listings** — Manage inventory
- 📊 **Dashboard** (extendable)

### UI/UX
- 📱 Fully responsive (mobile-first)
- 🎨 Green earthy design matching the original mockup
- ⏱️ Live countdown timer for offers
- 🔔 Toast notifications for all actions
- 🔒 Auth: Email/Password + Google OAuth
- 🛡️ Protected routes via middleware

---

## 🔧 Key Tech Choices

| Tech | Purpose |
|------|---------|
| Next.js 14 (App Router) | SSR, SSG, file-based routing |
| Supabase | Auth, PostgreSQL DB, RLS, Storage |
| Tailwind CSS | Utility-first styling |
| Zustand | Lightweight cart state (with persistence) |
| TypeScript | Full type safety from DB to UI |
| react-hot-toast | Beautiful notifications |
| lucide-react | Consistent icon set |

---

## 🌐 Deployment

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Add your environment variables in the Vercel dashboard under **Settings → Environment Variables**.

Update your Supabase project's **Site URL** and **Redirect URLs** in:
**Authentication → URL Configuration**
```
Site URL: https://your-app.vercel.app
Redirect URLs: https://your-app.vercel.app/auth/callback
```

---

## 📋 TODO / Extendable Features

- [ ] Admin dashboard (manage orders, products, farmers)
- [ ] Product image upload to Supabase Storage
- [ ] Razorpay / Stripe payment integration
- [ ] Push notifications
- [ ] SMS OTP login
- [ ] Farmer dashboard to add/edit products
- [ ] Product reviews UI
- [ ] Advanced search with Supabase full-text search
- [ ] Analytics dashboard

---

## 📄 License

MIT — Free for personal and commercial use.
