# 🍔 TasteBite — Restaurant Food Ordering App

A full-stack, production-ready restaurant food ordering web app built with **Next.js 14**, **Supabase**, **TypeScript**, and **Tailwind CSS**.

---

## ✨ Features

### Customer Side
- 🏠 **Home page** — Hero, featured dishes, category browsing
- 🍽️ **Menu page** — Browse all items, filter by category, search by name
- 🛒 **Cart** — Persistent cart with quantity controls (stored in localStorage)
- 📦 **Checkout** — Place orders with delivery address
- 🔍 **Order tracking** — Real-time order status with visual progress tracker
- 📋 **Order history** — View all past orders
- 👤 **Account** — Sign up, sign in, update profile & default address

### Admin Side (/admin — admin users only)
- 📊 **Dashboard** — Total orders, revenue, user count, recent activity
- 🍴 **Menu management** — Add, edit, delete items; toggle availability & featured status
- 📬 **Orders management** — View all orders, update status (pending → confirmed → preparing → ready → delivered)

### Technical
- 🔐 **Auth** — Email/password via Supabase Auth
- 🛡️ **Row Level Security** — Users only see their own data; admins see everything
- 🔒 **Server-side price validation** — Prices verified from DB on checkout (not trusted from client)
- 📡 **REST API routes** — Clean API at `/api/menu`, `/api/orders`, `/api/admin/*`
- 🚀 **Ready to deploy** — Vercel + Supabase in minutes

---

## 🏗️ Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Framework  | Next.js 14 (App Router)           |
| Language   | TypeScript                        |
| Styling    | Tailwind CSS                      |
| Database   | Supabase (PostgreSQL)             |
| Auth       | Supabase Auth                     |
| State      | Zustand (cart)                    |
| Toasts     | Sonner                            |
| Icons      | Lucide React                      |
| Deployment | Vercel + Supabase                 |

---

## 🚀 Deployment Guide (Step by Step)

### Step 1 — Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and click **Start your project**
2. Sign up / log in and click **New project**
3. Choose a name (e.g. `tastebite`) and a strong database password — **save this password**
4. Select the region closest to your users
5. Wait ~2 minutes for the project to spin up

### Step 2 — Set up the database

1. In your Supabase project, click **SQL Editor** in the left sidebar
2. Click **New query**
3. Open the file `supabase/schema.sql` from this project
4. Copy the entire contents and paste into the SQL editor
5. Click **Run** — this creates all tables, policies, and seeds sample data
6. You should see "Success. No rows returned"

### Step 3 — Get your API keys

1. In Supabase, go to **Settings → API**
2. Copy:
   - **Project URL** (looks like `https://xxxx.supabase.co`)
   - **anon public** key (long JWT string)
   - **service_role** key (keep this secret — server only)

### Step 4 — Configure environment variables

1. In the project root, copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Open `.env.local` and fill in your values:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

### Step 5 — Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the app is running!

### Step 6 — Make yourself an admin

1. Sign up for an account on your running app
2. In Supabase, go to **Table Editor → profiles**
3. Find your row and set `is_admin` to `true`
4. Refresh the app — you'll see the **Admin** link in the navbar

### Step 7 — Deploy to Vercel

1. Push your code to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   gh repo create tastebite --public --push
   ```
2. Go to [vercel.com](https://vercel.com) and click **New Project**
3. Import your GitHub repo
4. In the **Environment Variables** section, add the same 4 variables from your `.env.local`
5. Change `NEXT_PUBLIC_APP_URL` to your Vercel URL (e.g. `https://tastebite.vercel.app`)
6. Click **Deploy** — done in ~2 minutes! 🎉

### Step 8 — Configure Supabase for production

1. In Supabase, go to **Authentication → URL Configuration**
2. Add your Vercel URL to **Site URL**: `https://tastebite.vercel.app`
3. Add to **Redirect URLs**: `https://tastebite.vercel.app/account`

---

## 📁 Project Structure

```
tastebite/
├── app/
│   ├── page.tsx              # Home
│   ├── menu/
│   │   ├── page.tsx          # Menu listing
│   │   └── MenuFilters.tsx   # Search + category filter
│   ├── cart/
│   │   └── page.tsx          # Checkout page
│   ├── orders/
│   │   ├── page.tsx          # Order history
│   │   └── [id]/page.tsx     # Order tracking
│   ├── account/
│   │   └── page.tsx          # Auth + profile
│   ├── admin/
│   │   ├── layout.tsx        # Admin sidebar layout
│   │   ├── page.tsx          # Admin dashboard
│   │   ├── menu/             # Menu CRUD
│   │   └── orders/           # Order management
│   └── api/
│       ├── menu/route.ts     # GET menu items
│       ├── orders/route.ts   # GET/POST orders
│       └── admin/            # Admin-only routes
├── components/
│   ├── layout/Navbar.tsx
│   ├── cart/CartDrawer.tsx
│   ├── menu/MenuItemCard.tsx
│   └── orders/OrderStatusTracker.tsx
├── lib/
│   ├── utils.ts              # Helpers, formatters
│   └── cart-store.ts         # Zustand cart
├── supabase/
│   ├── client.ts             # Browser Supabase client
│   ├── server.ts             # Server Supabase client
│   └── schema.sql            # Full DB schema + seed data
├── types/index.ts            # TypeScript types
└── middleware.ts             # Auth session refresh
```

---

## 🔧 Customisation

### Change restaurant name/branding
- Find and replace `TasteBite` in `app/layout.tsx`, `app/page.tsx`, `components/layout/Navbar.tsx`
- Change `brand` colors in `tailwind.config.ts`

### Add new menu categories
- Run in Supabase SQL Editor:
  ```sql
  INSERT INTO categories (name, slug, description, sort_order)
  VALUES ('Wraps', 'wraps', 'Fresh handmade wraps', 8);
  ```

### Enable email confirmation
- In Supabase → Authentication → Settings, enable **Confirm email**

---

## 🐛 Troubleshooting

**"relation does not exist" error** → Run `supabase/schema.sql` in your SQL editor

**Images not loading** → Check `next.config.mjs` has the correct `remotePatterns`

**Admin link not showing** → Make sure `is_admin = true` in your profiles row

**Orders not saving** → Check RLS policies are applied (schema.sql must have run fully)
