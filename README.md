<p align="center">
  <img src="Frontend/public/favicon.svg" width="96" height="96" alt="Pravora Logo" />
  <h1 align="center" style="font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 38px; border: none; margin-bottom: 0;">Pravora</h1>
  <p align="center" style="font-size: 16px; color: #94a3b8; margin-top: 4px;">
    Next-Generation Multi-Tenant Restaurant SaaS Platform
  </p>
</p>

<p align="center">
  <a href="https://pravora-20.vercel.app">
    <img src="https://img.shields.io/badge/Live_Diner_Hub-pravora--20.vercel.app-E96A0A?style=for-the-badge&logo=vercel" alt="Live Diner Hub" />
  </a>
  <a href="https://pravora-backend.vercel.app/api/health">
    <img src="https://img.shields.io/badge/Live_API_Status-LIVE-emerald?style=for-the-badge&logo=mongodb" alt="Live API Status" />
  </a>
</p>

---

## 📖 Architectural Blueprints & Project History

To review the original design specifications, build timelines, and proof of development logs, navigate to the documents below:

- **[Product Blueprint](docs/product-blueprint.md)**: Original thesis, operational pain points, and MVP service definitions.
- **[Technical Architecture Plan](docs/technical-plan.md)**: Database schemas, page mappings, and technology stack definitions.
- **[Backend Operations Guide](docs/backend-readme.md)**: API route architecture, models layout, and server configurations.
- **[Frontend Architecture Guide](docs/frontend-readme.md)**: Next.js folder hierarchies, context states, and public styling setups.
- **[Proof of Documentation & Commit History](docs/proof-of-documentation.md)**: Verified commit ledger mapping development from first repository creation to target milestones.

---

## ⚡ Main Core Features

### 🏢 1. Step-by-Step Onboarding Wizard
- Collects restaurant type, dining capacity, service models (Fine Dining, QSR), and menu parameters.
- Dynamically configures the tenant workspace and initializes a custom database collection layout in seconds.

### 📊 2. Operations Pulse Dashboard
- **Kanban Order Board**: Drag, drop, or click status markers to update order status (`Pending` ➔ `Preparing` ➔ `Ready` ➔ `Served`) in real-time.
- **Metrics Widget**: Shows real-time rush levels, active order counts, revenue targets, and wait times.
- **Interactive Tables Board**: Monitor status updates (Occupied, Reserved, Paying, Dirty, Free) and generate/download live table QR code sheets.

### 📋 3. Live Queue & Booking Desk
- **Queue Tokens**: Automatically issue numbered queue tokens (e.g. `Q01`, `Q02`) with guest counts and ETA.
- **Future Table Bookings**: Submit reservations on the diner app. The manager dashboard retrieves all upcoming reservations in real-time (polling every 3 seconds) and confirmation emails are dispatched automatically.

### 📦 4. Smart Inventory & Bulk Importer
- **Single Form Stocking**: Add individual kitchen ingredients.
- **Bulk CSV Drag-and-Drop**: Drag and drop stock CSV files directly into the dash. Features error-tolerant client-side parsing, dynamic templates, progress indicators, and instant list updates.

### 👤 5. Guest Portal & Loyalty Program
- **Google OAuth Auth**: Instant Diner account creation to track favorites and checkouts.
- **Dietary & Allergy AI Filtering**: Diners set preferences (Vegetarian, Vegan, Gluten-Free) and allergies (Peanuts, Dairy, Seafood) which the Gemini engine automatically uses to filter menu recommendations.
- **Loyalty Progression Tiers**: Real-time points tracking with progress gauges indicating thresholds for Bronze, Silver, Gold, and Platinum Elite memberships.
- **Timeline & Transaction Hub**: Real-time kitchen status progression tracking for live table sessions, combined with digital receipt emails and favorites lists.

### 🛡️ 6. Super-Admin Platform Oversight & Complaint Ticket Desk
- **Super-Admin Unified Console**: SaaS KPIs dashboard (aggregate cafes, active tables, platform revenue counters) with global active order feeds.
- **Real-Time Customer Care Desk**: Guest-filed complaints on the diner table session automatically propagate to the manager panel for rapid tracking, staff delegation, and resolution.
