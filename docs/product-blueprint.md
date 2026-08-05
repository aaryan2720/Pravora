# Pravora Product Blueprint

## 1. Product Thesis

Build Pravora, a restaurant operating system that reduces manual work and improves the dining experience from the moment a guest discovers the menu to the moment the restaurant closes the day’s books.

This is not a delivery clone. The platform should solve operational problems:

- guests do not know what is available right now,
- staff communicate slowly across floor, kitchen, and billing,
- reservations and queues are poorly managed,
- inventory is disconnected from menu availability,
- managers lack real-time visibility into sales and operations.

## 2. Winning Product Strategy

The platform wins by being a restaurant control center with a strong customer experience layer. The core idea is:

- guests see accurate live availability,
- staff manage operations from one dashboard,
- management gets analytics and alerts,
- the system learns from activity and suggests improvements.

The experience should feel modern, fast, and operationally useful, not like a generic ordering app.

## 3. Product Identity

Suggested positioning:

"A smart restaurant operations platform that connects guests, staff, kitchen, and management in real time."

Primary users:

- Restaurant owner
- Manager
- Front desk staff
- Waiter / floor staff
- Kitchen staff
- Customer / diner

## 3.1 Confirmed Direction

The current direction is to keep onboarding short, AI-guided, and operationally useful.

Confirmed decisions so far:

- Use Gemini for onboarding analysis, recommendations, and operational insights.
- Keep the onboarding questionnaire short and high-signal so restaurants do not drop off.
- Generate a unique QR identity for each table so customer orders are tied to a specific table instantly.
- Show table-level order progress so staff and kitchen can see what table placed what item and what is still pending.
- Build the platform as a multi-tenant SaaS system with strict tenant separation.
- Design orchestration so one failed module does not collapse the full system.
- Support restaurant profile setup with logo, photos, and basic branding before the questionnaire starts.
- Use email for notifications in version one.
- Include billing in the first release.
- Use three simple availability states for menu items: available, unavailable, and will be soon available.
- Allow a today's special section for featured items.
- Keep the system scalable for both single-branch and multi-branch restaurant setups.
- Allow live menu price updates from the dashboard.
- Include reservations and customer membership or loyalty support.
- Do not include split payment in version one.

## 3.2 Recommended Tech Stack

Recommended stack for speed, clarity, and deployment simplicity:

- Frontend: Next.js with React and TypeScript
- Backend API: Node.js with Express or a minimal service layer in TypeScript
- Database: MongoDB Atlas
- Authentication: Email and password, OTP or equivalent verification, Google OAuth
- File storage: Cloudinary for logos, photos, and menu assets
- AI: Gemini API for onboarding analysis, recommendations, and assistant responses
- Deployment: Vercel for frontend, Render for backend API, MongoDB Atlas for data

If we want the simplest delivery path, we should keep the whole product in one language: TypeScript.

## 3.3 Core Architecture Principles

The platform should behave like a resilient SaaS control system:

- each tenant owns its own data and configuration,
- onboarding produces a recommended workflow plan,
- QR tables map to a table-specific order stream,
- the kitchen and staff views should update independently,
- AI should assist decisions, not block basic operations,
- every major workflow needs a fallback if AI or one service is unavailable.

## 4. Lock-First Rule

Before implementation, the team should freeze the following:

- target restaurant type for the first version,
- core workflows included in the MVP,
- the onboarding questionnaire,
- the minimum data model,
- the AI features that are truly worth building.

Anything outside the locked scope becomes a stretch goal or a later release.

## 5. Onboarding Flow

The onboarding should feel like a guided setup for restaurant operators. It should answer two questions quickly:

1. What type of restaurant is this?
2. What operational problem should the platform solve first?

The ideal onboarding flow is short, conversational, and adaptive. It should ask only the minimum questions required to recommend a workflow and then let Gemini help normalize the restaurant profile.

The first question must always be the restaurant type because it drives the rest of the setup.

### Stage A: Restaurant Type and Service Model

Collect:

- restaurant category: cafe, quick service, casual dining, or premium dining,
- desired service style: old school assisted service, hybrid service, or fully self-service,
- whether waiters only deliver kitchen orders to tables,
- whether the restaurant wants staff-assisted ordering,
- whether the guest should scan a table QR code to start the experience.

### Stage B: Basic Business Profile

Collect:

- restaurant name,
- branch count,
- location,
- cuisine type,
- service model,
- operating hours,
- contact details,
- branding preferences.

Optional but recommended at this stage:

- logo upload,
- cover photos,
- brand color,
- restaurant description.

### Stage C: Size and Capacity

Collect:

- number of tables,
- average seats per table,
- estimated peak visitors per hour,
- average daily footfall,
- number of staff by role,
- number of kitchen stations,
- dine-in vs takeaway vs reservations mix.

### Stage D: Operational Pain Points

Ask which issues matter most:

- dish availability confusion,
- long queue times,
- table allocation inefficiency,
- slow order communication,
- billing delays,
- inventory wastage,
- staff coordination,
- poor sales visibility.

### Stage E: Billing and Payment Setup

Collect:

- bill generation flow,
- pay-at-table flow,
- payment completion confirmation,
- exit scan or paid receipt confirmation after payment,
- whether the customer should see a fun paid-and-ready-to-leave screen.

### Stage F: Menu and Service Setup

Collect:

- menu categories,
- item count,
- item variants,
- customizations,
- allergens,
- prep time by category,
- item availability rules,
- time-based menu restrictions,
- out-of-stock handling,
- price updates,
- today's special items,
- manual availability flagging for available, unavailable, and will be soon available.

### Stage G: Workflow Preferences

Collect:

- QR menu only or QR + staff ordering,
- reservation support,
- queue management,
- pay-at-table,
- kitchen display integration,
- customer notifications.

### Stage H: Membership and Loyalty Setup

Collect:

- whether the restaurant wants repeat customer membership,
- whether guests should sign in to track visit history and favorites,
- whether loyalty perks or visit-based offers should be shown,
- whether customer recommendations should use past orders or popular items.

### Stage I: Intelligence Readiness

Collect:

- willingness to use AI suggestions,
- historical data available,
- expected forecasting use cases,
- notification automation preferences,
- manager alert thresholds.

### Stage J: Table and QR Setup

Collect:

- number of tables,
- table naming scheme,
- QR generation preference,
- whether each table gets a fixed QR code,
- whether QR should open a guest menu, live order screen, or both,
- whether staff should be able to reassign a table QR session.

## 6. Decision Questions Still Open

These are now locked for version one:

- Reservations stay in the first release.
- Split payment is out of scope for version one.
- QR flows can open menu browsing and live ordering.
- The system is designed to support both single-branch and multi-branch expansion.

Remaining design choices are only implementation details, not scope decisions.

## 7. Onboarding Questionnaire

Use these as the first quick QA flow.

### Restaurant Profile

- What type of restaurant is this?
- What is the restaurant name?
- How many branches or physical locations do you have?
- What cuisine do you serve?
- What are your opening hours?
- Do you support dine-in, takeaway, or both?

### Capacity and Operations

- How many tables do you have?
- How many seats do you serve in total?
- What is your average peak crowd size?
- How many staff members work per shift?
- How many kitchen stations do you operate?
- What is your biggest bottleneck today?

### Menu Setup

- How many menu categories do you have?
- How many items are on the menu?
- Do items change availability during the day?
- Do you allow customizations or add-ons?
- Do you track prep time per item?
- Do you need allergen or dietary labels?

### Guest Experience

- Do you want QR menu browsing?
- Do you want live availability shown to customers?
- Do you need table reservation and queue support?
- Do you want order tracking for guests?
- Do you want notifications by email?

### Loyalty and Membership

- Do you want a membership-style experience for repeat customers?
- Do you want sign-in to unlock favorites, visit history, or offers?
- Do you want recommendations based on past orders?

### Management Needs

- Do you need sales analytics?
- Do you need inventory tracking?
- Do you need staff management?
- Do you need real-time order monitoring?
- Do you need daily business summaries?

### AI and Automation

- Would you like menu suggestions based on time of day or demand?
- Should the system forecast item demand and inventory needs?
- Should managers receive smart alerts for low stock or slow service?
- Do you want AI-generated insights and recommendations?

## 7. Core Workflows

The first version should focus on the following workflows because they solve the competition problem directly.

### Customer Workflow

1. Open menu.
2. See live availability.
3. Reserve a table or join a queue.
4. Place an order.
5. Track order status.
6. Receive notifications.
7. Pay and leave feedback.

### Staff Workflow

1. View live incoming orders.
2. Confirm availability or substitutions.
3. Route orders to kitchen.
4. Update table status.
5. Manage queue and reservation check-ins.
6. Record payment and closing status.

### Manager Workflow

1. Monitor live operations.
2. View sales and rush periods.
3. Check low inventory alerts.
4. Update prices and today's special items instantly.
5. Track staff load and table turnover.
6. Review daily analytics.
7. Act on operational insights.

## 8. Suggested Feature Modules

### Bronze Foundation

- Modern landing and dashboard experience,
- restaurant onboarding,
- role-based layouts,
- intuitive guest and staff UI.

### Silver Operations

- Email and password auth with OTP or equivalent verification,
- Google OAuth,
- digital menu,
- live item availability,
- reservations and queue basics,
- order request flow,
- notifications.

### Gold Management

- staff dashboard,
- table management,
- order lifecycle control,
- inventory visibility,
- customer records,
- sales summaries,
- analytics dashboard.

### Platinum Intelligence

- demand forecasting,
- inventory prediction,
- personalized recommendations,
- operational alerts,
- AI assistant for managers,
- insight summaries.

## 9. Recommended Differentiators

These are the ideas that can make the platform feel competition-worthy:

- Live table session map with a full timeline for each QR session.
- Availability confidence states so customers and staff can distinguish live availability, temporary unavailability, and soon-available items.
- Restaurant pulse dashboard with rush level, delayed tables, low-stock warnings, turnover, top items, and daily specials performance.
- Guest membership and smart recommendations based on favorites, visit history, and past orders.
- Live pricing and promo control from the dashboard so item prices and specials can change immediately.
- End-of-visit confirmation screen that makes payment completion feel clear and polished.

Priority ranking:

1. Live table session map.
2. Restaurant pulse dashboard.
3. Live pricing and promo control.
4. Availability confidence states.
5. Guest membership and smart recommendations.
6. End-of-visit confirmation screen.

## 10. AI Decision

AI should be used only where it creates measurable value.

Best AI use cases:

- item demand prediction,
- low-stock prediction,
- smart recommendations,
- rush-hour forecasting,
- manager summaries,
- support assistant for operational questions.

Avoid using AI as decoration. If a rule-based feature is enough, keep it simple.

## 11. Data Model Sketch

Key entities:

- Restaurant
- Branch
- User
- Role
- Table
- MenuCategory
- MenuItem
- InventoryItem
- Order
- OrderItem
- Reservation
- QueueEntry
- Payment
- Notification
- AnalyticsSnapshot
- AIInsight

## 12. 3-Day Delivery Plan

### Day 1: Product Freeze and UX Definition

- finalize onboarding questions,
- lock the target restaurant type,
- define user roles,
- define the MVP feature set,
- sketch the dashboard and customer journey.

### Day 2: System Design and Data Model

- define the data model,
- define main screens,
- define workflow states,
- define analytics and alert logic,
- define AI feature boundaries.

### Day 3: Build Readiness

- finalize architecture,
- prepare implementation tasks,
- create submission narrative,
- prepare deployment plan,
- confirm demo story.

## 13. What We Should Not Build First

- full delivery marketplace,
- complex multi-vendor logistics,
- overly broad AI features,
- advanced accounting,
- enterprise POS replacement,
- unnecessary social features.

## 14. Competition Story

The story we should present is:

"Restaurants waste time and money because operations are disconnected. We built a unified SaaS platform that gives guests real-time clarity, staff operational control, and managers actionable intelligence."

## 15. Next Locked Decisions

Before coding, we still need to lock:

- first target restaurant format,
- exact MVP workflows,
- preferred stack,
- deployment target,
- whether AI is mandatory for the final demo,
- whether the first version is single-branch or multi-branch.
