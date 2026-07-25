# ServeLoop Backend README

This document defines the backend scope for ServeLoop.

The backend is responsible for authentication, tenant separation, restaurant data, orders, reservations, QR sessions, billing, memberships, analytics, AI orchestration, and all operational state changes.

## 1. Backend Mission

- Keep restaurant data isolated per tenant.
- Support both single-branch and multi-branch restaurant setups.
- Power live menu updates, availability changes, and pricing changes.
- Handle QR session creation and table identity.
- Support orders, reservations, billing, loyalty, and analytics.
- Orchestrate Gemini calls without making AI a hard dependency.

## 2. Suggested Backend Stack

- Node.js with JavaScript
- REST API first
- Vercel serverless functions if we keep the API on the same platform
- MongoDB Atlas
- Cloudinary for images and media metadata
- Gemini API for onboarding analysis and recommendations
- JWT or secure session-based auth
- Email delivery integration for notifications

## 3. Backend Responsibilities

### Authentication and Identity

- email and password auth,
- OTP or equivalent verification,
- Google OAuth,
- role-based access,
- session and token handling,
- guest versus staff versus manager separation.

### Tenant and Branch Management

- create restaurant tenant,
- store branches or physical locations,
- isolate restaurant data,
- support future expansion from single branch to multi-branch,
- store brand and workspace configuration.

### Restaurant Setup and Onboarding

- receive onboarding answers,
- store restaurant type and service model,
- store operating profile,
- store capacity and table setup,
- store reservation and loyalty settings,
- call Gemini to summarize the workflow recommendation.

### Menu and Pricing

- create and update menu categories,
- create and update items,
- handle prices,
- support live price changes,
- support today's specials,
- support item availability states,
- support recommended substitutes,
- support manual availability toggles.

### QR and Table Sessions

- generate QR identity per table,
- map QR to restaurant and table,
- create table session,
- track active session state,
- support session reset or reassignment,
- keep table-to-order mapping clear.

### Orders and Kitchen Flow

- create order,
- update order status,
- link orders to table session,
- support multiple items per order,
- separate pending and completed items,
- send kitchen-ready payloads,
- support order history.

### Reservations and Queue

- create reservations,
- manage reservations by branch and table,
- track queue entries,
- assign wait estimates,
- accept or decline reservation requests,
- keep reservation and queue records auditable.

### Billing and Payments

- generate bill,
- calculate tax and service charges,
- confirm payment state,
- return paid status,
- produce receipt data,
- support exit confirmation flow,
- do not handle split payment in version one.

### Membership and Loyalty

- store guest profiles,
- track visit history,
- track favorites,
- manage recommendation inputs,
- store loyalty flags or offers.

### Analytics and Reporting

- sales totals,
- top items,
- rush period tracking,
- inventory risk,
- delayed table tracking,
- reservation utilization,
- membership activity,
- daily summary data.

### AI Orchestration

- call Gemini for onboarding analysis,
- generate workflow suggestion,
- generate restaurant summary,
- generate smart recommendations,
- generate customer suggestion hints,
- generate operational insights,
- continue core operations if AI is unavailable.

## 4. Backend Data Objects

Core entities should include:

- Restaurant
- Branch
- User
- Role
- Guest
- Table
- TableSession
- MenuCategory
- MenuItem
- MenuPriceHistory
- MenuAvailabilityState
- SpecialItem
- Order
- OrderItem
- Reservation
- QueueEntry
- Bill
- Payment
- Receipt
- Membership
- Favorite
- AnalyticsSnapshot
- AIInsight
- Notification

## 5. Backend Rules

- Multi-tenant isolation is mandatory.
- Restaurant operations must continue even if AI fails.
- Live pricing must overwrite visible menu data immediately.
- Availability should be simple and understandable.
- Table sessions must always map back to a branch and table.
- Reservations, billing, and loyalty are first-release features.
- Split payment is not in scope for version one.

## 6. Backend Flow

### Onboarding Flow

1. Receive restaurant type and service model.
2. Receive profile, capacity, and menu data.
3. Receive table and QR setup.
4. Store tenant configuration.
5. Call Gemini for recommendation.
6. Return setup summary and recommended operating mode.

### Customer Session Flow

1. Receive restaurant or table entry.
2. Resolve branch and table.
3. Open menu and availability state.
4. Create or resume table session.
5. Store order items.
6. Generate bill.
7. Update payment status.
8. Close session.

### Staff Flow

1. Fetch live operations data.
2. Update menu prices or specials.
3. Update item availability.
4. Update order status.
5. Update reservation and queue state.
6. Close paid tables.

## 7. Backend API Surface

Suggested endpoint groups:

- `/auth`
- `/tenants`
- `/restaurants`
- `/branches`
- `/onboarding`
- `/menu`
- `/pricing`
- `/availability`
- `/tables`
- `/sessions`
- `/orders`
- `/reservations`
- `/queue`
- `/billing`
- `/payments`
- `/memberships`
- `/analytics`
- `/ai`
- `/notifications`

## 8. Expected Backend Output

The backend should be able to answer these product promises:

- Is this table active?
- What items are available now?
- What is the current price?
- Is the reservation confirmed?
- Is the bill paid?
- What is the restaurant recommendation from Gemini?
- What branch is this customer in?

## 9. Backend Prompt for API Design

Use this prompt if you want a backend generator or assistant to design the service layer:

```text
Build the backend for a multi-tenant restaurant SaaS platform.

Backend stack:
- Node.js with JavaScript
- REST API first
- Vercel serverless functions or equivalent deployment
- MongoDB Atlas
- Cloudinary for assets
- Gemini API for onboarding analysis and recommendation output

Core responsibilities:
- tenant isolation
- restaurant and branch setup
- onboarding data capture
- menu and live pricing
- availability states
- QR table sessions
- customer order flow
- reservations and queue handling
- billing and payment confirmation
- membership and loyalty
- analytics snapshots
- AI orchestration

Business rules:
- restaurant type comes first in onboarding
- reservations are included in version one
- billing is included in version one
- split payment is not included in version one
- QR should map to a specific table session
- pricing changes must be reflected immediately
- availability states should be simple: available, unavailable, will be soon available
- the system must support both single-branch and multi-branch setups
- AI should guide setup and recommendations but never block operations
```

## 10. Backend Output Expectation

The backend should be boring in the best way possible:

- predictable,
- fast,
- tenant-safe,
- observable,
- easy to extend,
- resilient when AI or a downstream service fails.
