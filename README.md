# Surya Multicuisine Restaurant & Cafe — Website

A modern, responsive, production-ready static web application for **Surya Multicuisine Restaurant & Cafe**, located in Ambattur, Chennai. Built with React, TypeScript, and Vite, with custom design aesthetics derived from the restaurant's authentic brand identity, physical interior, and verified menu.

---

## 🌟 Features

* **Authentic Branding:** Palette and typography derived from real menu cards (warm orange `#E8722A`, slate navy `#12121E`, gold accents `#F4B942`, and teal interior accents `#26A69A`).
* **Verified Menu Data:** Over 200 item prices directly verified from official menu cards across 10 categories.
* **Interactive Digital Menu:** Real-time search, category filter tabs, dietary indicators (Veg / Non-Veg / Egg), and popular tags.
* **Filterable Gallery & Lightbox:** High-resolution photography with category filtering, full-screen lightbox modal, and keyboard navigation (`Esc`, `←`, `→`).
* **Direct WhatsApp Table Reservations:** Client-side form with input validation that generates pre-formatted WhatsApp booking messages.
* **Mobile-First UX:** Sticky navigation, animated hamburger menu, and a bottom quick-action bar (Call, WhatsApp, Directions, Order).
* **SEO & Local Search Optimized:** LocalBusiness / Restaurant Schema.org JSON-LD structured data, OpenGraph, Twitter Cards, and canonical tags for Ambattur / Chennai local search.
* **Netlify-Ready:** Configured with `netlify.toml` for seamless client-side SPA routing and zero-downtime deployment.

---

## 🛠️ Tech Stack

* **Framework:** React 19 + Vite 6
* **Language:** TypeScript
* **Routing:** React Router v7 (`react-router-dom`)
* **Styling:** Vanilla CSS with Custom Properties (CSS variables), glassmorphism, responsive grid layouts, and hardware-accelerated animations
* **Fonts:** Playfair Display (editorial headings) & Inter (clean UI typography) via Google Fonts
* **Deployment:** Netlify (SPA rewrite configuration included)

---

## 🚀 Getting Started

### Prerequisites

* Node.js (v18 or newer recommended)
* npm (v9 or newer)

### Installation

```bash
# Clone or navigate to the project directory
cd "d:/Projects/JS/React JS/Suriya"

# Install dependencies
npm install
```

### Local Development

To start the Vite development server with Hot Module Replacement (HMR):

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:5173`.

### Production Build

To type-check and generate an optimized static bundle in `dist/`:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

---

## 🌐 Netlify Deployment

This project is configured out-of-the-box for Netlify via [`netlify.toml`](./netlify.toml):

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build]
  publish = "dist"
  command = "npm run build"
```

### Deploying via Netlify CLI:

```bash
# Install Netlify CLI if needed
npm install -g netlify-cli

# Login and deploy
netlify deploy --prod
```

### Deploying via Git (GitHub / GitLab):
1. Push this repository to GitHub.
2. Link the repository in Netlify dashboard.
3. Build command: `npm run build`
4. Publish directory: `dist`

---

## 📁 Project Structure

```text
surya-restaurant/
├── docs/
│   ├── assets.md              # Registry of all media assets and origins
│   └── research.md            # Verified restaurant research details and sources
├── public/
│   ├── favicon.svg            # Surya sun vector favicon
│   └── images/
│       ├── branding/          # Restaurant emblem (logo.svg)
│       ├── menu/              # Dish photographs (biryani, tandoori, seafood, etc.)
│       └── restaurant/        # Interior and hero dining spreads
├── src/
│   ├── components/
│   │   ├── common/            # Reusable UI primitives (Button, SectionHeading)
│   │   └── layout/            # Layout shells (Header, Footer, MobileActionBar)
│   ├── data/
│   │   ├── gallery.ts         # Gallery image entries and categories
│   │   ├── menu.ts            # Complete categorized menu with verified prices
│   │   └── restaurant.ts      # Core restaurant profile, contacts, links, coordinates
│   ├── hooks/
│   │   └── useInView.ts       # IntersectionObserver hook for viewport animations
│   ├── pages/
│   │   ├── About.tsx          # About page & dining experience
│   │   ├── Contact.tsx        # Contact cards, hours, embed map
│   │   ├── Gallery.tsx        # Responsive photo gallery with modal lightbox
│   │   ├── Home.tsx           # Hero, highlights, cuisine cards, popular dishes
│   │   ├── Menu.tsx           # Category tabs, search filtering, menu cards
│   │   └── Reservations.tsx   # Form validating table requests to WhatsApp
│   ├── App.tsx                # Client-side router configuration
│   ├── index.css              # Global design tokens, resets, utility classes
│   └── main.tsx               # Application root
├── index.html                 # SEO metadata, Google Fonts, JSON-LD Schema
├── netlify.toml               # Netlify SPA redirect rules
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## ✏️ Maintenance & Updates Guide

### 1. Updating Restaurant Information (Phone, Address, Hours)
All core business details are centralized in [`src/data/restaurant.ts`](./src/data/restaurant.ts).
Update fields such as:
* `restaurant.address`
* `restaurant.contact.phone`
* `restaurant.hours.display`
* `restaurant.links` (Swiggy, Zomato, Google Reviews)

### 2. Updating Menu Items & Pricing
All categories and items are structured in [`src/data/menu.ts`](./src/data/menu.ts).
To edit or add a dish:
```typescript
{
  id: 'unique-id',
  name: 'Dish Name',
  price: 199,
  diet: 'veg' | 'non-veg' | 'egg',
  popular: true, // optional badge
}
```

### 3. Updating External Delivery or Map Links
Edit `restaurant.links` in [`src/data/restaurant.ts`](./src/data/restaurant.ts):
```typescript
links: {
  swiggy: 'https://www.swiggy.com/...',
  district: 'https://www.district.in/...',
  googleMaps: '...',
}
```

### 4. Replacing or Adding Photos
1. Place new JPG or WebP images in `public/images/menu/` or `public/images/restaurant/`.
2. Update the image paths in [`src/data/menu.ts`](./src/data/menu.ts) or [`src/data/gallery.ts`](./src/data/gallery.ts).
3. Document any new assets in [`docs/assets.md`](./docs/assets.md).

---

## 📄 License & Credits

© 2026 Surya Multicuisine Restaurant & Cafe. All rights reserved.
Information and pricing verified via public restaurant listings on Swiggy and District by Zomato.
