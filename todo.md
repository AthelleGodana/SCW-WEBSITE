# SCW E-Commerce Refactor - Implementation Checklist

## Phase 1: Database Schema & Setup
- [x] Define Drizzle schema for products table (name, description, price, image, stock, category, tag, featured)
- [x] Define Drizzle schema for orders table (userId, totalPrice, status, items, addresses, payment info)
- [x] Define Drizzle schema for order_items table (orderId, productId, quantity, price, customization)
- [x] Define Drizzle schema for cart_items table (userId, productId, quantity, customization)
- [x] Generate and apply database migrations
- [x] Create database query helpers in server/db.ts

## Phase 2: Backend API (tRPC Procedures)
- [x] Create products router (list, get by id, create, update, delete)
- [x] Create orders router (list, get by id, create, update status)
- [x] Create cart router (get, add item, remove item, update quantity, clear)
- [x] Create M-Pesa service with fixed timestamp and phone normalization
- [x] Create checkout router (initiate payment, handle callback, query status)
- [x] Implement admin-only procedures with role-based access control
- [x] Add proper error handling and validation

## Phase 3: M-Pesa Integration Fix
- [x] Fix timestamp format (YYYYMMDDHHmmss instead of milliseconds)
- [x] Fix phone number normalization (handle +254, 0254, 254, 0 prefixes)
- [x] Implement proper callback URL handling
- [x] Add transaction status polling mechanism
- [x] Add callback validation and order status updates

## Phase 4: Public Storefront UI
- [x] Build responsive navbar with navigation links and cart icon
- [x] Create product listing page with grid layout and filtering
- [x] Create product detail page with images, description, and add to cart
- [x] Build shopping cart view with item management and checkout button
- [x] Implement cart persistence (localStorage + server sync)
- [x] Add loading states and error handling

## Phase 5: Checkout & Payment Flow
- [x] Build checkout form (shipping address, billing address, payment method)
- [x] Integrate M-Pesa payment initiation (STK Push)
- [x] Create order confirmation page with receipt
- [x] Build order history page for logged-in users
- [x] Implement payment status polling
- [x] Add success/failure handling

## Phase 6: Admin Panel - Product Management
- [x] Create admin dashboard layout with sidebar navigation
- [x] Build product management page with table view
- [x] Implement add product modal with form validation
- [x] Implement edit product modal with pre-filled data
- [x] Implement delete product with confirmation dialog
- [x] Add image upload handling
- [x] Implement search and filtering for products

## Phase 7: Admin Panel - Order Management
- [x] Build order management page with table view
- [x] Implement order detail view with full information
- [x] Implement order status update functionality
- [x] Add order filtering and search
- [x] Display payment status and M-Pesa receipt numbers

## Phase 8: Authentication & Authorization
- [x] Ensure Manus OAuth integration works correctly
- [x] Implement role-based access control (admin vs user)
- [x] Protect admin routes and procedures
- [x] Add logout functionality
- [x] Display user info in navbar

## Phase 9: Testing & Bug Fixes
- [ ] Write vitest tests for M-Pesa service
- [ ] Write vitest tests for product procedures
- [ ] Write vitest tests for order procedures
- [ ] Write vitest tests for cart procedures
- [ ] Test full checkout flow end-to-end
- [ ] Test admin product management
- [ ] Test admin order management
- [ ] Fix any bugs found during testing

## Phase 10: Final Review & Deployment
- [ ] Review code quality and TypeScript types
- [ ] Ensure all features are implemented as specified
- [ ] Create final checkpoint
- [ ] Push to GitHub repository
- [ ] Document setup and deployment instructions
