# PLANNING.MD - Woodwise Quote Builder

**Version:** 1.0
**Date:** 2025-04-16

## 1. Purpose & Vision

**Purpose:** To provide a robust, user-friendly web application (`Woodwise Quote Builder`) enabling customers to easily configure and request quotes for timber products, and allowing administrators to efficiently manage products, categories, pricing, and incoming quotes.

**High-Level Vision:** To streamline the timber quoting process for both customers and the business owner, reducing manual effort, improving accuracy, and providing a modern digital interface. The system integrates seamlessly with Supabase for backend operations.

## 2. Target Audience

* **Customers:** Individuals or businesses seeking quotes for specific timber requirements (dimensions, material, processing).
* **Administrators:** Business owner(s) or staff responsible for managing product inventory, pricing, categories, and processing customer quote requests.

## 3. Core Modules & Functionality

* **Customer Panel:**
    * User Authentication (Login, Registration, Password Reset)
    * Product Catalog Browse (Categories, Subcategories, Search, Filtering)
    * Product Configuration (Length, Material, Planed/Not Planed, Quantity)
    * Quote Building (Add/Edit/Remove items, View Running Total)
    * Quote Submission
    * Quote History & Status Tracking
    * Quote Output (Generate PDF/Link)
    * (Future/Integration) Quote Sending via Email (n8n or alternative)
* **Administrator Panel:**
    * User Authentication (Admin Role)
    * Product Management (CRUD)
    * Category Management (CRUD, including Subcategories)
    * Pricing Management (Based on Length, Material, Processing)
    * Customer Quote Review (View list, Filter by Status)
    * Quote Status Management (Update status: New, Processing, Sent, Rejected etc.)

## 4. Architecture

* **Frontend:** Single Page Application (SPA) built with React and TypeScript.
* **Backend:** Backend-as-a-Service (BaaS) provided by Supabase.
    * **Database:** Supabase PostgreSQL for storing all application data.
    * **Authentication:** Supabase Auth for user management and JWT handling.
    * **API:** Supabase auto-generated RESTful API (or direct client library interaction) for data operations. Row Level Security (RLS) enforced.
    * **Storage:** (Optional) Supabase Storage if product images or generated PDFs are stored.
    * **Edge Functions:** (Potential) For server-side logic like complex calculations, PDF generation, or email sending.
* **Styling:** Tailwind CSS utility-first framework with shadcn-ui component library.
* **State Management:** React Query for server state caching and synchronization. React Context for global UI state (e.g., Auth status).

## 5. Technology Stack

* **Frontend Framework:** React 18+
* **Language:** TypeScript
* **Build Tool:** Vite
* **Styling:** Tailwind CSS
* **UI Components:** shadcn-ui, Radix UI (headless components used by shadcn-ui)
* **Icons:** Lucide Icons
* **State Management (Server):** React Query (TanStack Query)
* **State Management (Client):** React Context
* **Routing:** React Router DOM (Assumed, common choice - confirm if different)
* **Backend Platform:** Supabase (Database, Auth, API, potentially Storage/Edge Functions)
* **Utility Libraries:** `date-fns` (Date formatting), `uuid` (Unique IDs)
* **Testing:** Playwright (End-to-End Testing)

## 6. Key Decisions & Constraints

* **Supabase as Primary Backend:** Leverages Supabase features heavily, reducing the need for a custom backend server for core CRUD and Auth.
* **React + TypeScript:** Standard choice for modern, type-safe frontend development.
* **Tailwind CSS + shadcn-ui:** Provides rapid UI development with a consistent design system and utility classes. Avoid custom CSS where possible.
* **React Query:** Standardizes data fetching, caching, and server state management.
* **RLS is Crucial:** Supabase Row Level Security policies MUST be implemented correctly to ensure data privacy and security.
* **Responsiveness:** The UI must be fully responsive across common device sizes (Mobile, Tablet, Desktop).
* **Modularity:** Components should be reusable and maintainable. Follow the existing project structure (`src/pages`, `src/components`, etc.).
* **PDF/Link Generation:** Needs a defined strategy (client-side library like `jspdf`, server-side generation via Edge Function, or a third-party service).
* **Email Sending:** Requires integration (n8n webhook, Supabase Edge Function with email service like Resend/SendGrid, or other).

## 7. Data Model (Supabase Schema Overview)

* **`profiles`:** Stores user information, including authentication ID (`id` linked to `auth.users`), first name, last name, email, and `role` (e.g., 'user', 'admin').
* **`categories`:** Stores product categories, potentially with `parent_id` for subcategories.
* **`products`:** Stores timber product details (name, description, base price, category ID, available materials, processing options, etc.).
* **`pricing_rules`:** (Suggestion/Refinement) A dedicated table might be better for complex pricing based on length, material, processing, linked to `products`. Alternatively, pricing logic might be embedded within product data or handled via views/functions.
* **`quotes`:** Header information for each quote (user ID, submission date, status, total estimate).
* **`quote_items`:** Line items within a quote (quote ID, product ID, configured length, material, processing, quantity, calculated price).
* **`quote_history`:** (Potentially redundant if `quotes` table tracks status changes effectively, or could be used for detailed audit logs).

## 8. Tools

* **Development Environment:** Node.js, npm/yarn
* **IDE:** VS Code / Cursor
* **Version Control:** Git, GitHub (https://github.com/RealAutomationAid/woodwise-quote-builder.git)
* **Backend Management:** Supabase Studio (Dashboard)
* **Testing Framework:** Vitest
