# Pravora Frontend README

This document defines the frontend scope for Pravora.

The frontend is responsible for the customer experience, onboarding experience, restaurant workspace, and all visible dashboard interactions. It should feel fast, premium, mobile-friendly, and easy to understand for both restaurant staff and customers.

## 1. Frontend Mission

- Present the restaurant brand clearly.
- Guide restaurant owners through a short onboarding flow.
- Let customers discover a restaurant, scan a table QR, order, and pay inside the website.
- Give staff and managers a live operations view.
- Make live pricing, availability, reservations, and membership feel real-time.

## 2. Suggested Frontend Stack

- React with JavaScript
- Next.js if we want route handling, server rendering, and built-in deployment support
- Vercel for hosting
- Component library or custom UI kit for fast iteration
- CSS modules, Tailwind, or another lightweight styling approach
- React Query or a similar client-state helper if needed
- QR scanner library for browser-based scanning

## 3. Frontend Responsibilities

### Public Experience

- Landing page
- Sign up / sign in page
- Brand explanation page
- Optional pricing or plan page

### Restaurant Onboarding

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

### Customer Experience

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

### Restaurant Workspace

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

## 4. What the Frontend Must Handle

### Identity and Branding

- restaurant logo,
- cover images,
- colors,
- descriptions,
- branch/location presentation.

### Live Operations UI

- live availability states,
- live price updates,
- today's specials,
- table-level order progress,
- reservation state,
- queue state,
- payment state.

### QR and Scanner Flow

- in-browser QR scanning,
- table QR recognition,
- session start from QR,
- direct table session routing,
- fallback when camera access is not available.

### Billing and Exit Flow

- bill display,
- payment action,
- paid confirmation,
- exit confirmation screen,
- smooth end-of-visit experience.

### Loyalty and Recommendations

- sign-in for repeat customers,
- favorites,
- visit history,
- recommendation hints,
- membership offers.

## 5. Expected Frontend Behavior

- Responsive on mobile and desktop.
- Works well on a restaurant phone, tablet, and staff screen.
- Makes restaurant type and service style obvious right away.
- Lets customers understand what is available, what is pending, and what is paid.
- Gives staff a clear operational timeline instead of a cluttered static panel.
- Feels like a live restaurant control surface, not a generic food delivery clone.

## 6. Screen Flow

### Restaurant Owner Flow

1. Sign up.
2. Create restaurant profile.
3. Select restaurant type.
4. Select service model.
5. Configure menu, billing, reservations, loyalty, and QR setup.
6. Review AI suggestions.
7. Publish restaurant workspace.

### Customer Flow

1. Open restaurant landing or discovery page.
2. See restaurant status and menu preview.
3. Open scanner or enter the session directly.
4. Scan table QR inside the browser.
5. Open table session.
6. Browse live menu and pricing.
7. Order items.
8. Review cart.
9. Track order progress.
10. View bill.
11. Pay.
12. See exit confirmation.

### Staff Flow

1. Open operations dashboard.
2. See orders, tables, reservations, queue, and alerts.
3. Update availability and prices.
4. Route orders to kitchen.
5. Monitor payment state.
6. Close table sessions.

## 7. Frontend Features by Priority

### Must Have

- public landing page,
- sign in / sign up,
- onboarding wizard,
- restaurant landing page,
- in-browser scanner,
- customer menu and table session,
- cart and order review,
- bill and payment confirmation,
- restaurant dashboard,
- orders board,
- tables board,
- menu management,
- live pricing and specials,
- reservations board,
- analytics dashboard.

### Should Have

- membership and loyalty screens,
- queue board,
- inventory and availability board,
- staff management page,
- settings page,
- exit confirmation screen,
- polished empty/loading/error states.

### Nice to Have

- advanced animations,
- personalized recommendations UI,
- richer insight cards,
- more elaborate restaurant branding effects.

## 8. Frontend Prompt for UI Generation

Use this prompt if you want a fast UI generator or design assistant to create the frontend shell:

```text
Build a premium restaurant SaaS frontend for a multi-tenant operations platform.

The product should feel like a live restaurant control system, not a food delivery app.

Frontend stack:
- React with JavaScript
- Next.js preferred if route handling helps
- Vercel deployment

Core pages:
- landing page
- sign up / sign in
- onboarding wizard
- restaurant landing page with menu preview and live status
- in-browser QR scanner page or modal
- customer menu browsing page
- table session page
- cart / order review page
- reservation page
- bill page
- payment confirmation page
- exit / thank-you page
- restaurant dashboard
- orders board
- tables board
- menu management
- pricing and specials management
- reservations board
- queue board
- billing and payments board
- customers and membership board
- analytics dashboard
- staff management page
- settings page

Design goals:
- modern and high-trust
- clean but energetic
- works on mobile and tablet first
- strong restaurant branding support
- live operational states should be obvious
- scanner should work inside the browser
- table sessions should feel active and real-time

Important product behavior:
- restaurant type comes first in onboarding
- users can choose service style: assisted, hybrid, or fully self-service
- pricing and availability can change immediately from the dashboard
- reservation support is part of version one
- split payment is not part of version one
- the system supports both single-branch and multi-branch restaurants
- customers can start from location-based discovery or restaurant landing
- AI should guide onboarding and recommendations, not block basic operation
```

## 9. Frontend Output Expectation

The frontend should produce a polished, demo-ready experience with a clear story:

- “This restaurant is live.”
- “This table is active.”
- “This item is available now.”
- “Your bill is ready.”
- “Payment is complete.”

That story is what makes the platform feel differentiated.
