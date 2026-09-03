# Surya Multicuisine Restaurant & Cafe — Dynamic Web App & Admin Console

A production-ready, dynamic full-stack web application for **Surya Multicuisine Restaurant & Cafe**, located on Vanagaram High Road in Ambattur, Chennai.

Built with **React 19, Vite, TypeScript, and Supabase** (PostgreSQL, Authentication, Row Level Security, and Storage), targeting **₹0/month** on free-tier infrastructure (Netlify Free + Supabase Free).

---

## 🌟 Dynamic Application Architecture

```
                             CUSTOMER / DINER
                                    │
                                    ▼
    ┌──────────────────────────────────────────────────────────────┐
    │                      React 19 + Vite                         │
    │   Public Routes: /, /menu, /reservations, /contact, etc.    │
    │   Admin Routes:  /admin/login, /admin (Console)              │
    └───────────────┬──────────────────────────────┬───────────────┘
                    │                              │
                    │ Public Read & Submission     │ Authenticated Admin Session
                    ▼                              ▼
    ┌──────────────────────────────────────────────────────────────┐
    │                        Supabase                              │
    ├──────────────────────────────────────────────────────────────┤
    │  PostgreSQL (RLS Protected)   │  Auth                        │
    │  - categories                 │  - Admin user sessions       │
    │  - menu_items                 │  Storage                     │
    │  - offers                     │  - restaurant-images bucket  │
    │  - bookings                   │  Security                    │
    │  - contact_messages           │  - Row Level Security (RLS)  │
    │  - admin_users (RBAC)         │  - No service_role key leak  │
    └──────────────────────────────────────────────────────────────┘
```

---

## 📋 Features

### Customer-Facing Website
* **Dynamic Menu (`/menu`):** Real-time categories, dishes, prices, descriptions, and dietary indicators (Veg/Non-Veg/Egg) fetched from Supabase, with client-side search and category filtering.
* **Special Offers & Promotions:** Dynamic festive deals, combo promotions, and discounts displayed on the Home page.
* **Table Reservations (`/reservations`):** Customers submit reservation requests (Name, Phone, Date, Time, Guests, Special requests). Requests are safely stored in Supabase with `pending` status, and customers receive a confirmation modal with an optional instant WhatsApp button.
* **Interactive Contact Form (`/contact`):** Allows customers to send inquiries directly to the management team.
* **Authentic Aesthetics:** Preserves the dark restaurant ambiance (`#0B0B14`, `#12121E`), orange headers (`#E8722A`), gold accents (`#F4B942`), and responsive mobile bottom action bar.

### Admin Dashboard (`/admin`)
* **Overview:** High-level metrics for Menu Items, Active Categories, Pending Bookings, Unread Inquiries, and Active Promotions.
* **Categories Management:** Add new categories, edit names/slugs, reorder display order, and activate/deactivate.
* **Menu Items Management:** Full CRUD (add, edit price, edit description, toggle availability, toggle popular status, toggle active status, upload photo to Supabase Storage `restaurant-images`).
* **Offers Management:** Create and update special promotions with discount badges and date ranges.
* **Bookings Management:** Filter reservations by status (`Pending`, `Confirmed`, `Cancelled`) and date. Direct **Confirm**, **Cancel**, **Call**, and **WhatsApp** action buttons.
* **Customer Inquiries:** Review messages submitted from the contact form, mark as `Read` or `Resolved`.
* **Security & Auth:** Protected via Supabase Authentication + Role-Based Access Control (`admin_users` table). Unauthenticated visitors are redirected to `/admin/login`.

---

## 🛠️ Tech Stack

* **Frontend:** React 19, TypeScript, Vite
* **Routing:** React Router v7 (`react-router-dom`) with code-splitting for admin bundles
* **Database & Auth:** Supabase Free (PostgreSQL, Supabase Auth, Row Level Security)
* **Storage:** Supabase Storage (`restaurant-images` bucket)
* **Styling:** Vanilla CSS Custom Properties (Theme tokens, glassmorphism, responsive grids)
* **Hosting:** Netlify Free (with SPA redirects configured in `netlify.toml`)

---

## 🚀 Supabase Setup Guide

### Step 1: Create a Supabase Project (Free Tier)
1. Sign up or log in at [supabase.com](https://supabase.com/).
2. Click **New Project** and name it `surya-restaurant`.
3. Choose a strong database password and select your nearest region (e.g. `ap-south-1` Mumbai).

### Step 2: Run Database Migration
1. In your Supabase Dashboard, go to the **SQL Editor** on the left menu.
2. Open [`supabase/migrations/20260903000000_initial_schema.sql`](./supabase/migrations/20260903000000_initial_schema.sql) in this repository.
3. Paste the entire SQL script into the SQL Editor and click **Run**.
4. This will automatically create:
   * Tables: `categories`, `menu_items`, `offers`, `bookings`, `contact_messages`, `admin_users`
   * Indexes and `updated_at` auto-triggers
   * Row Level Security (RLS) policies
   * Storage bucket `restaurant-images` with access policies
   * Pre-populated seed data for all 10 verified categories and 100+ menu items with exact prices.

### Step 3: Create Your Admin Account
1. In your Supabase Dashboard, go to **Authentication** > **Users** and click **Add User** > **Create User** (or sign up via the app).
   * Email: `admin@surya.com` (or your email)
   * Password: your chosen admin password
   * Ensure **Auto Confirm User** is checked.
2. Copy the **User UID** of the created user.
3. In the **SQL Editor**, run this query to grant admin permissions:
   ```sql
   INSERT INTO public.admin_users (id, role)
   VALUES ('YOUR_USER_UID_HERE', 'superadmin')
   ON CONFLICT (id) DO NOTHING;
   ```

### Step 4: Obtain API Credentials
1. Go to **Project Settings** > **API**.
2. Copy the **Project URL** and the **anon / public** API key.
   *(Never use or expose the `service_role` secret in frontend code!)*

---

## 🔐 Environment Variables

### Local Development (`.env`)
Create a `.env` file in the project root (based on `.env.example`):
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-publishable-key-here
```

### Netlify Deployment Environment Variables
When deploying to Netlify:
1. Log in to [app.netlify.com](https://app.netlify.com/).
2. Go to your site > **Site configuration** > **Environment variables**.
3. Add the following variables:
   * `VITE_SUPABASE_URL`: `https://your-project-id.supabase.co`
   * `VITE_SUPABASE_ANON_KEY`: `your-anon-publishable-key-here`
4. Trigger a new deployment. Netlify will build the site with live Supabase connectivity!

---

## 💻 Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Start Vite development server
npm run dev

# 3. Production build check
npm run build

# 4. Preview production build locally
npm run preview
```

Open `http://localhost:5173` to explore the website.
Visit `http://localhost:5173/admin` to access the Admin Console.

---

## 🛡️ Database Security & RLS Summary

| Table | Public Access | Admin Access |
| :--- | :--- | :--- |
| `categories` | `SELECT` (active only) | Full CRUD |
| `menu_items` | `SELECT` (active only) | Full CRUD |
| `offers` | `SELECT` (active only) | Full CRUD |
| `bookings` | `INSERT` only (cannot read other bookings) | Full CRUD |
| `contact_messages` | `INSERT` only (cannot read other messages) | Full CRUD |
| `admin_users` | `SELECT` own record | Full CRUD |
| Storage `restaurant-images` | `SELECT` (public view) | Upload / Delete |

---

## 📬 Free-Tier Email Notifications Architecture

To remain **₹0/month**, table bookings are stored directly in the `bookings` table, and the customer is presented with an optional instant WhatsApp button.

If automated email notifications to restaurant management are required:
* Configure a **Supabase Database Webhook** or **Netlify Serverless Function** triggered on `bookings` INSERT.
* Connect with **Resend** (3,000 free emails/month) or **SendGrid Free Tier** (100 emails/day).
* The booking system is completely decoupled so customer submissions succeed 100% reliably even if email quotas are exceeded.

---

## 📄 License & Credits

© 2026 Surya Multicuisine Restaurant & Cafe. All rights reserved.
Information and pricing verified via public restaurant listings on Swiggy and District by Zomato.
