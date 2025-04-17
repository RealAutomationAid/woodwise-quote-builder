# TASKS.MD - Woodwise Quote Builder

**Last Updated:** 2025-04-16

## Milestones

1.  **[✔️] Core Setup & Authentication:** Project init, Supabase setup, basic login/register.
2.  **[✔️] Product Catalog & Display:** Basic category/product display, filtering foundations.
3.  **[✔️] Basic Quote Building:** Add items to a temporary quote state, basic submission.
4.  **[✔️] Basic Quote History:** Logged-in users can see their submitted quotes.
5.  **[✔️] Admin Panel - Core CRUD:** Basic interfaces for managing Products & Categories.
6.  **[✔️] Admin Panel - Basic Quote Review:** View submitted quotes, basic status update.
7.  **[ ] Feature Refinement & Implementation:** Implement advanced features (PDF, Email, Pricing), improve UI/UX.
8.  **[ ] Comprehensive Testing:** Implement E2E tests with Playwright.
9.  **[ ] Deployment & Finalization:** Prepare for production deployment.

## Current Tasks (In Progress / To Do Next)

* **[ ] Feature: Implement PDF Generation for Quotes (Client Panel)**
    * Sub-task: Decide on generation method (client-side lib vs. server-side/Edge Function).
    * Sub-task: Design PDF layout/content.
    * Sub-task: Add "Generate PDF" button to the `Current Quote` view.
    * Sub-task: Implement logic to fetch quote data and generate the PDF.
* **[ ] Feature: Implement Link Generation for Quotes (Client Panel)**
    * Sub-task: Determine link structure (e.g., unique URL pointing to a read-only quote view).
    * Sub-task: Add "Generate Link" button.
    * Sub-task: Implement backend logic (if needed) or client-side routing for the shared view.
* **[ ] Feature: Integrate Quote Email Sending (Client Panel Submission)**
    * Sub-task: Choose integration method (n8n webhook, Supabase Edge Function + Email provider).
    * Sub-task: Configure the chosen service/function.
    * Sub-task: Trigger the email sending upon successful quote submission.
    * Sub-task: Include relevant quote details (or PDF/Link) in the email.
* **[ ] UI/UX: Refine Admin Panel Pricing Management**
    * Sub-task: Design UI for setting prices based on combinations of length, material, and processing per product.
    * Sub-task: Update Supabase schema/logic if needed (`pricing_rules` table?).
    * Sub-task: Implement the CRUD interface for these pricing rules in the Admin Panel.
* **[ ] Testing: Implement Core E2E Tests with Playwright**
    * Sub-task: Write test script for User Registration & Login flow.
    * Sub-task: Write test script for Product Browse & Filtering.
    * Sub-task: Write test script for Creating and Submitting a Quote.
    * Sub-task: Write test script for Viewing Quote History (Client).
    * Sub-task: Write test script for Admin Login & Viewing Quotes.

## Backlog (Future Work / Nice-to-Haves)

* **[✓] Feature: Advanced Product Filtering/Search:** More granular filters, sorting options.
* **[✓] Feature: User Profile Management:** Allow users to update their name, password.
* **[ ] Feature: In-App Notifications:** Notify users/admins about quote status changes.
* **[ ] Feature: Admin Dashboard Analytics:** Basic stats (quotes per period, common products).
* **[ ] UI/UX: Improve Password Reset Flow:** Enhance UI/UX for password recovery.
* **[ ] Refactor: Explore Supabase Edge Functions:** Evaluate moving logic like PDF generation or complex calculations to Edge Functions.
* **[ ] UI/UX: Add Product Images:** Implement image upload (Admin) and display (Client). Requires Supabase Storage integration.
* **[ ] Feature: Quote Editing (Client):** Allow editing *before* admin processing (as per original spec).
* **[ ] Feature: Quote Deletion (Client):** Allow deletion *before* admin processing (as per original spec).
* **[ ] Testing: Expand Playwright test coverage.**

## Completed (Recent)

* **[✓] Implemented Account Management Page** with profile editing, password changing, and recent quotes overview.
* **[✓] Implemented Advanced Product Filtering/Search** with advanced filters, sorting, and optimized backend.
* **[✓] Implemented Basic Authentication** (Login, Register - Supabase Auth).
* **[✓] Implemented Product Catalog Display** with Category/Subcategory filtering.
* **[✓] Implemented Basic Quote Creation** (Adding items to quote state).
* **[✓] Implemented Quote Submission** to Supabase backend.
* **[✓] Implemented Basic Quote History View** for logged-in users.
* **[✓] Implemented Admin CRUD for Products**.
* **[✓] Implemented Admin CRUD for Categories**.
* **[✓] Implemented Admin Quote List View**.
* **[✓] Implemented Admin Quote Status Change** functionality.
* **[✓] Set up Core Project Structure** (Vite, React, TS, Tailwind, shadcn-ui).
* **[✓] Integrated Supabase Client** for basic operations.
* **[ ] Refactor: ProductsTab, ProductForm, and CategoryTab** (2024-06-16)
    * Sub-task: Break down large components into smaller, maintainable subcomponents.
    * Sub-task: Fix issues with /admin/products page.
    * Sub-task: Optimize select.item usage and address related UI/UX bugs.
    * Sub-task: Update Supabase schema if required.
    * Sub-task: Update documentation and mark completed when done.
* **[✓] Advanced Filters Popup Redesign (Desktop Responsive, Sticky Buttons)** (2024-06-17)
    * Popup is now wider, responsive, and buttons are always visible on desktop.

## Discovered During Work

* **[ ] Bug: Registration email field not editable** (2024-06-17)
    * Investigate and fix why the email field cannot be modified during registration.
* **[ ] Bug: /quote page is broken** (2024-06-17)
    * Investigate and fix the root cause of the /quote page not loading or functioning properly.