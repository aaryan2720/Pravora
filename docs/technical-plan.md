# ServeLoop Technical Plan

This document translates the product blueprint into a rough build plan.

It is intentionally implementation-oriented but still high level. The goal is to lock the pages, adjustable areas, and system boundaries before any code generation.

## 1. Technical Goal

Build ServeLoop as a multi-tenant restaurant SaaS with:

- a public-facing customer experience,
- a restaurant onboarding flow,
- a live operations dashboard for staff and managers,
- table-level QR sessions,
- live pricing and availability updates,
- reservations,
- billing and payment confirmation,
- membership and loyalty support,
- AI-assisted onboarding and recommendations.

## 2. Recommended Stack

Use a simple JavaScript-first stack for speed and fast generation:

- Frontend: React + JavaScript, ideally with Next.js if we want built-in serverless routes
- Backend/API: Node.js + JavaScript
- API style: REST first, with room for events later
- Database: MongoDB Atlas
- Auth: email/password, OTP or equivalent, Google OAuth
- Media: Cloudinary
- AI: Gemini API
- Frontend hosting: Vercel
- API hosting: Vercel

If we want maximum safety and larger-team maintainability later, TypeScript can still be layered in after the MVP. For the first competition build, JavaScript is a perfectly valid choice.

## 3. Frontend Page Map

These are the core pages the frontend should have.

### Public Pages

- Landing page
- Sign up / sign in page
- Marketing / product explanation page
- Pricing or plan page if needed later

### Restaurant Onboarding Pages

- Restaurant type step
- Service model step
- Basic business profile step
- Capacity step
- Menu and item setup step
- Billing setup step
- Reservation and queue setup step
- Membership and loyalty setup step
- AI readiness step
- Table and QR setup step
- Review and publish step

### Restaurant Workspace Pages

- Main dashboard
- Orders board
- Tables board
- Menu management
- Pricing and specials management
- Reservations board
- Queue board
- Inventory and availability board
- Billing and payments board
- Customers and membership board
- Analytics dashboard
- Staff management page
- Settings page

### Customer Pages

- Location-based restaurant discovery page
- Restaurant landing page with menu preview and status
- In-website scanner page or modal
- QR entry page
- Menu browsing page
- Table session page
- Cart / order review page
- Reservation page
- Bill page
- Payment confirmation page
- Exit / thank-you page

## 4. Core Adjustable Areas

These are the parts that should be configurable from the dashboard instead of hardcoded.

### Restaurant Setup

- restaurant name,
- logo,
- cover images,
- brand colors,
- description,
- operating hours,
- branch count,
- physical locations.

### Menu Controls

- add / edit / remove items,
- price updates,
- category management,
- item tags,
- item images,
- item availability states,
- today's special items,
- recommended substitutes,
- prep time.

### Table and QR Controls

- number of tables,
- table labels,
- QR generation,
- QR regeneration,
- QR assignment to table,
- session reset,
- table status.

### Reservation Controls

- time slots,
- table assignment rules,
- guest capacity,
- acceptance rules,
- waitlist handling,
- reservation notes.

### Billing Controls

- bill generation,
- tax and service charge rules,
- payment status,
- paid confirmation,
- receipt view,
- exit confirmation screen.

### Membership and Loyalty Controls

- guest sign-in requirement,
- favorites,
- visit history,
- recommendation rules,
- offer visibility.

### AI Controls

- enable or disable AI suggestions,
- workflow recommendation output,
- menu insight output,
- smart recommendations,
- low-stock insights,
- demand insights.

## 5. Screen Flow

### A. Restaurant Setup Flow

1. User lands on sign up.
2. User creates an account.
3. User selects restaurant type.
4. User selects service model.
5. User enters business profile.
6. User configures menu, pricing, tables, billing, reservations, and loyalty.
7. Gemini analyzes inputs and suggests the best workflow mix.
8. User reviews and publishes the restaurant workspace.

### B. Customer Flow

1. Customer opens the restaurant discovery or landing page.
2. Customer sees the restaurant status, menu preview, and service options.
3. Customer opens the in-website scanner or enters the table session directly.
4. Customer scans the table QR inside the browser.
5. Customer lands in the table session.
6. Customer sees live menu, pricing, and availability.
7. Customer adds items to the order.
8. Customer reviews the order.
9. Customer places the order.
10. Customer tracks status.
11. Customer views the bill.
12. Customer pays.
13. Customer sees exit confirmation.

### C. Staff Flow

1. Staff opens the operations dashboard.
2. Staff sees active tables, orders, reservations, and queue.
3. Staff updates availability and prices.
4. Staff routes orders to kitchen.
5. Staff manages table status.
6. Staff confirms payment and closes the table session.

### D. Manager Flow

1. Manager opens the pulse dashboard.
2. Manager sees rush level, delays, and low-stock alerts.
3. Manager checks sales, specials, and top items.
4. Manager adjusts pricing and featured items.
5. Manager reviews analytics and membership activity.

## 6. System Architecture

The system should be split into a few clear modules.

### Frontend Layer

- Customer experience app,
- restaurant onboarding wizard,
- staff and manager dashboard,
- shared UI components,
- route guards by role.

### API Layer

- authentication service,
- tenant management service,
- restaurant setup service,
- menu and pricing service,
- table and QR service,
- reservation service,
- order service,
- billing service,
- membership service,
- analytics service,
- AI orchestration service.

### Data Layer

- restaurants,
- branches,
- users,
- roles,
- tables,
- menu items,
- orders,
- reservations,
- payments,
- memberships,
- analytics snapshots,
- AI insights.

### AI Layer

- Gemini onboarding summary,
- workflow recommendation,
- menu insight generation,
- smart recommendation generation,
- operational summary output.

### Resilience Rules

- AI must be optional, not a hard dependency for core operations.
- Customer ordering must keep working if recommendation services fail.
- Pricing updates and availability updates must work without waiting for AI.
- Each tenant must be isolated so one restaurant never affects another.

## 7. Suggested Module Boundaries

These are the areas that should stay separate in code.

- auth and onboarding,
- customer session and QR flow,
- restaurant dashboard,
- menu and pricing,
- reservations and queue,
- orders and billing,
- membership and loyalty,
- analytics and AI.

## 8. Build Order

This is the safest order for a 3-day start.

### Phase 1: Foundation

- project scaffold,
- auth,
- tenant model,
- restaurant setup,
- base layout system.

### Phase 2: Customer Experience

- QR entry,
- live menu,
- live pricing,
- availability states,
- table session,
- cart and order submission.

### Phase 3: Staff Operations

- orders board,
- table board,
- menu changes,
- pricing changes,
- today's special controls,
- order status updates.

### Phase 4: Billing and Reservations

- reservation booking,
- queue handling,
- bill generation,
- payment confirmation,
- exit screen.

### Phase 5: Intelligence

- Gemini onboarding analysis,
- workflow recommendations,
- menu suggestions,
- operational insights,
- customer membership recommendations.

### Phase 6: Polish and Demo Readiness

- analytics dashboard,
- pulse dashboard,
- responsive UI,
- error states,
- loading states,
- demo narrative.

## 9. Pages That Can Be Generated Quickly

These are the pages that are ideal for rapid UI generation tools like Lovable or Emergent.

- landing page,
- sign in / sign up page,
- onboarding wizard,
- menu browsing page,
- table session page,
- orders dashboard,
- tables dashboard,
- analytics dashboard,
- pricing and specials page,
- settings page,
- payment confirmation page.

## 10. Pages That Need Careful Custom Design

These should be designed more intentionally because they define the product identity.

- restaurant pulse dashboard,
- onboarding wizard,
- table session timeline,
- exit confirmation screen,
- live pricing and specials manager,
- membership and loyalty screen.

## 11. Open Technical Questions

The product scope is mostly locked, but a few implementation decisions still need to be finalized later:

- exact database schema,
- role model depth,
- whether the API should be REST only or REST plus events,
- how pricing history should be stored,
- whether analytics should be precomputed or derived live,
- whether the customer session should be fully anonymous or always linked to sign-in.

## 12. Immediate Next Step

Turn this technical plan into a screen-by-screen flow and a minimal component inventory, then generate the initial implementation tasks.