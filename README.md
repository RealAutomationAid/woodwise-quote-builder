# Woodwise Quote Builder

A modern web application for configuring and requesting quotes for timber products, designed for both customers and administrators. Built with React, TypeScript, and Supabase, it streamlines the timber quoting process, reduces manual effort, and provides a robust digital interface for product and quote management.

## 🚀 Project Overview

**Woodwise Quote Builder** enables customers to:
- Browse a catalog of timber products
- Configure products (dimensions, material, processing)
- Build and submit quotes
- Track quote history and status
- Generate PDFs or shareable links for quotes

Administrators can:
- Manage products, categories, and pricing
- Review and update quote statuses
- Oversee customer requests efficiently

The system leverages Supabase for backend (database, authentication, API) and is fully responsive for all device sizes.

## ✨ Features

### Customer Panel
- User authentication (login, register, password reset)
- Product catalog with categories, search, and filtering
- Product configuration (length, material, planed/not planed, quantity)
- Quote builder (add/edit/remove items, running total)
- Quote submission and history tracking
- Quote output (PDF generation, shareable link)
- (Planned) Email quote delivery

### Recent Improvements
- Advanced Filters popup is now desktop responsive, wider, and has sticky action buttons for improved usability.
- Ongoing bugfixes for registration (email field) and quote page reliability.

> All UI/UX improvements and bugfixes are tracked in `TASKS.md`.

### Admin Panel
- Admin authentication
- Product management (CRUD)
- Category management (CRUD, subcategories)
- Pricing management (by length, material, processing)
- Customer quote review and status management

### General
- Responsive UI (Tailwind CSS, shadcn-ui)
- Secure authentication (Supabase Auth, RLS)
- Modular, maintainable codebase

## 🛠️ Technology Stack
- **Frontend:** React 18+, TypeScript, Vite
- **Styling:** Tailwind CSS, shadcn-ui, Radix UI, Lucide Icons
- **State Management:** React Query, React Context
- **Routing:** React Router DOM
- **Backend:** Supabase (PostgreSQL, Auth, API, Edge Functions)
- **Utilities:** date-fns, uuid


## 📁 Project Structure
```
├── src/
│   ├── pages/         # Main app pages (catalog, quote, quotes, admin)
│   ├── components/    # Reusable UI components (catalog, quote, admin, ui)
│   ├── contexts/      # React context providers
│   ├── hooks/         # Custom React hooks
│   └── lib/           # Utility functions
├── supabase/
│   ├── functions/     # Edge functions (setup-admins, notify-quote-submitted, search-products)
│   └── config.toml    # Supabase project config
├── public/            # Static assets
├── tests/             # Playwright E2E tests
├── package.json       # Project dependencies and scripts
├── tailwind.config.ts # Tailwind CSS config
└── ...
```

## ⚡ Setup & Installation
1. **Clone the repo:**
   ```bash
   git clone https://github.com/RealAutomationAid/woodwise-quote-builder.git
   cd woodwise-quote-builder
   ```
2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```
3. **Configure environment:**
   - Copy `.env.example` to `.env` and fill in Supabase credentials (URL, anon key).
   - Ensure Supabase project is set up (see `supabase/config.toml`).
4. **Run the development server:**
   ```bash
   npm run dev
   ```
5. **Supabase Edge Functions:**
   - Deploy functions in `supabase/functions/` as needed for admin setup, notifications, and product search.

## 🧑‍💻 Usage
- **Customers:** Register/login, browse products, configure and add to quote, submit quote, track status, generate PDF/link.
- **Admins:** Login, manage products/categories/pricing, review and update quotes.

## 🧪 Testing & Contribution
- **Testing:**
  - Run E2E tests with Playwright (`tests/` directory).
  - Lint code with `npm run lint`.
- **Contributions:**
  - PRs welcome! Please follow code style and modularity guidelines.
  - Add new tasks or TODOs to `TASKS.md` as you work.

## 📄 License & Contact
- [Add license info here if available]
- Contact: info@woodwise.com

---

*For more details, see `PLANNING.md` and `TASKS.md`.* 