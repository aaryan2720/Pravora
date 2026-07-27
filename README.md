<p align="center">
  <img src="Frontend/public/favicon.svg" width="96" height="96" alt="ServeLoop Logo" />
  <h1 align="center" style="font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 38px; border: none; margin-bottom: 0;">ServeLoop</h1>
  <p align="center" style="font-size: 16px; color: #94a3b8; margin-top: 4px;">
    Next-Generation Multi-Tenant Restaurant SaaS Platform
  </p>
</p>

<p align="center">
  <a href="https://pa-serveloop.vercel.app">
    <img src="https://img.shields.io/badge/Live_Diner_Hub-pa--serveloop.vercel.app-f59e0b?style=for-the-badge&logo=vercel" alt="Live Diner Hub" />
  </a>
  <a href="https://serve-loop-pi.vercel.app/api/health">
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

## 🍽️ The Aurangabad Dining Demo (Try It Live!)

We have configured a fully active dining tenant for **Sora Café**, located in downtown Chhatrapati Sambhajinagar (Aurangabad). You can test the end-to-end customer, manager, and SaaS administrator workflow right now:

### 🔑 Active Testing Credentials

Sign in to verify various operational and super-admin dashboards:

| User Role | Login URL | Email Address | Password | Access Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Sora Café Manager** | `/auth/signin` | `hello@soracafe.in` | `123456789` | Full operational control of Sora Café (Tables, Menu, Orders, Complaints) |
| **ServeLoop SaaS Super-Admin** | `/auth/signin` | `admin@serveloop.in` | `admin123456` | Platform-wide administrative console (System Health, Global Feeds, Tickets) |
| **Diner Customer (QR Scan)** | *Direct Access* | *No Credentials Required* | *No Password* | Scan table QR code to browse menus, order food, and file help requests |

---

### 1. Scan Table T1 QR Code (Guest Journey)

Guests sit at a table and scan the paired QR code to open their dynamic dining session. Scan this QR code using your phone's camera or Google Lens to immediately open Table T1's live session at Sora Café:

<p align="center">
  <img src="Frontend/public/Sora Café_Table_T1_QR.png" width="220" alt="Sora Cafe Table T1 QR" style="border: 2px solid rgba(255,255,255,0.1); border-radius: 16px;" />
</p>

#### Guest Experience Checklist:
- **Browse the Cloud Menu**: Check out the live category slider and see item availability synced with real kitchen stock.
- **Enforced Authenticated Checkout**: Add items to your cart. Placing orders or requesting the bill routes you to sign in/up to protect checkouts, allocate loyalty points, and send automated email receipts.
- **Track Order Status**: Once placed, watch your orders transition through the kitchen pipeline (`placed` ➔ `preparing` ➔ `ready` ➔ `served`) on the live diner timeline.
- **Food-First Checkout Policy**: If you attempt to checkout while items are preparing, the system blocks the payment action: *"Let's finish your food first! 🍽️ Once all your items are served, you can request the bill."*
- **Settle the Bill**: Once served, select your payment method (UPI, Card, Cash) to request check-out, which immediately frees the table on the manager's dashboard.

---

### 2. Live Platform Customer Care Desk (Help Tickets)

If a customer faces any issues (e.g., cold food, slow service, billing errors) during their dining session:

- **Guest Submission**: Click the **Care Desk** shortcut on the table session timeline (`/r/sora-cafe/help`) and file a complaint.
- **Staff Ticketing Dashboard**: Log in as the **Sora Café Manager** (`hello@soracafe.in`) and navigate to the **Complaints Desk** in the sidebar. 
- **Real-Time Refresher**: The ticket pops up immediately (polling every 3 seconds) without page reloads! You can assign the ticket to a waiter, append resolution notes, and mark it resolved.

---

### 3. ServeLoop Global Super-Admin Console (Platform Oversight)

Log in as the **ServeLoop SaaS Super-Admin** (`admin@serveloop.in`) to monitor platform operations:

- **Live Platform Health**: View real-time ping latency and server uptime queries executing live against the `/api/health` diagnostics endpoint.
- **Branded Cafes Cards**: Inspect onboarded tenant cafe cards, displaying logos, cover banners, cuisine tags, and active table statistics.
- **Platform-Wide Feeds**: Monitor all recent guest orders and customer complaints filed across all restaurants from a unified administrative timeline.

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

---

## 🛠️ Local Installation & Development

### 1. Prerequisites
- **Node.js** >= 18.0.0
- **MongoDB** Local instance or Atlas Connection string

### 2. Backend Setup
1. Navigate to `/Backend` and run:
   ```bash
   npm install
   ```
2. Create a `.env` file based on `.env.example`:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=your_secret
   EMAIL_HOST=smtp.gmail.com
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Navigate to `/Frontend` and run:
   ```bash
   npm install
   ```
2. Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```
3. Launch the Next.js development server:
   ```bash
   npm run dev
   ```
4. Access the web app at `http://localhost:3000`.

### 🌐 Mobile Testing over Local Wifi
The frontend includes a dynamic API router. If you access the frontend using your computer's local IP address (e.g., `http://192.168.1.15:3000`), it automatically maps the API endpoints to port `5000` on the same host, enabling seamless mobile testing without hardcoding!
