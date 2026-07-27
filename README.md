# <p align="center"><img src="Frontend/public/favicon.svg" width="48" height="48" alt="ServeLoop Logo" /> <br/><b>ServeLoop</b></p>

<p align="center">
  <a href="https://pa-serveloop.vercel.app"><b>Live Diner Hub Web App</b></a> · 
  <a href="https://serve-loop-pi.vercel.app/api/health"><b>Live API Health</b></a>
</p>

<p align="center" style="font-family: 'Outfit', sans-serif; font-size: 16px; color: #94a3b8;">
  A next-generation, multi-tenant restaurant SaaS platform that streamlines table operations, queue systems, real-time kitchen tracking, inventory management, and diner loyalty circles.
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

We have configured a fully active dining tenant for **Sora Café**, located in downtown Chhatrapati Sambhajinagar (Aurangabad). You can test the end-to-end customer and staff workflow right now:

### 1. Scan Table T1 QR Code
Scan this QR code using your phone's camera or Google Lens to immediately open Table T1's live session at Sora Café:

<p align="center">
  <img src="Frontend/public/Sora Café_Table_T1_QR.png" width="220" alt="Sora Cafe Table T1 QR" style="border: 2px solid rgba(255,255,255,0.1); border-radius: 16px;" />
</p>

### 2. Experience the Diner Journey
- **Browse the Cloud Menu**: Check out the live category slider and see item availability synced with real kitchen stock.
- **Enforced Authenticated Checkout**: Add items to your cart. Placing orders or requesting the bill routes you to sign in/up to protect checkouts, allocate loyalty points, and send automated email receipts.
- **Track Order Status**: Once placed, watch your orders transition through the kitchen pipeline (`placed` ➔ `preparing` ➔ `ready` ➔ `served`) on the live diner timeline.
- **Food-First Checkout Policy**: If you attempt to checkout while items are preparing, the system blocks the payment action: *"Let's finish your food first! 🍽️ Once all your items are served, you can request the bill."*
- **Settle the Bill**: Once served, select your payment method (UPI, Card, Cash) to request check-out, which immediately frees the table on the manager's dashboard.

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
- **Future Table Bookings**: Submit reservations on the diner app. The manager dashboard retrieves all upcoming reservations from today onwards in real-time (polling every 3 seconds) and confirmation emails are dispatched automatically.

### 📦 4. Smart Inventory & Bulk Importer
- **Single Form Stocking**: Add individual kitchen ingredients.
- **Bulk CSV Drag-and-Drop**: Drag and drop stock CSV files directly into the dash. Features error-tolerant client-side parsing, dynamic templates, progress indicators, and instant list updates.

---

## 🚀 Upcoming Milestones (Roadmap)

### 📢 1. Restaurant & Customer Complaint Center
- A dedicated ticket tracking interface allowing diners to report issues (e.g. missing items, cold food, slow service) directly from their active table session.
- Staff can prioritize complaints, assign waiter tasks, and mark issues resolved in real-time.

### 👑 2. Global SaaS Super-Admin Dashboard
- An executive command center to monitor all active partner cafes, review total transacted SaaS revenues, check system health metrics, manage global billing subscriptions, and approve onboarding requests.

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
