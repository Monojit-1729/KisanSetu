# KisanSetu

> **Smart India Hackathon 2026 — Problem Statement 26132**  
> *"Strengthening market linkages and price discovery for farmers"*

---

## 🌾 Overview

**KisanSetu** is an agricultural market-intelligence, matching, and coordination platform designed to transform fragmented mandi prices and buyer demand into explainable, cost-aware selling decisions for farmers and FPOs.

Rather than acting merely as another passive listing board, KisanSetu introduces an explainable **decision engine** that calculates realistic **Net Realisation**:
$$\text{Net Realisation} = \text{Gross Offer/Price} - (\text{Transport Cost} + \text{Mandi Cess} + \text{Packaging/Handling} + \text{Grade Discount})$$

---

## 🏛️ System Architecture

The platform is organized as a full-stack workspace with clean separation between the frontend interface and backend service domain:

```
KisanSetu/
├── Assets/                                            # Project-level supporting material, orchestration & tooling
│   ├── docs/                                          # Architecture notes, consolidated documentation & guides
│   │   ├── architecture/
│   │   ├── product/
│   │   ├── KisanSetu_SIH26132_Final_Consolidated_Project_Documentation.docx
│   │   └── README.md                                  # Centralized project documentation
│   ├── research/                                      # Domain research, references & pilot data
│   ├── presentations/                                 # PPTs & presentation assets
│   ├── scripts/                                       # Development helpers & non-runtime scripts
│   ├── config/                                        # Shared project-level configurations
│   ├── .gitignore                                     # Assets-level ignore rules
│   ├── package.json                                   # Centralized path-based npm orchestration
│   └── package-lock.json
├── Backend/                                           # Backend REST API (Node.js + Express + Mongoose)
│   ├── src/
│   │   ├── config/                                    # Database & environment configurations
│   │   ├── database/                                  # Database seeders and migrations
│   │   │   └── seeders/
│   │   ├── middleware/                                # Auth, validation, error handling
│   │   ├── modules/                                   # Domain business modules
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── farmers/
│   │   │   ├── fpos/
│   │   │   ├── buyers/
│   │   │   ├── markets/
│   │   │   ├── lots/
│   │   │   ├── demand/
│   │   │   ├── matching/
│   │   │   ├── realization/
│   │   │   ├── recommendations/
│   │   │   ├── offers/
│   │   │   ├── orders/
│   │   │   ├── logistics/
│   │   │   ├── payments/
│   │   │   ├── sms/
│   │   │   ├── analytics/
│   │   │   ├── grievances/
│   │   │   └── admin/
│   │   ├── services/                                  # Cross-cutting intelligence and integrations
│   │   │   ├── intelligence/
│   │   │   ├── data/
│   │   │   └── integrations/
│   │   ├── routes/                                    # Express endpoint definitions
│   │   ├── utils/                                     # Math, formatting, logger
│   │   ├── app.js                                     # Express application setup
│   │   └── server.js                                  # HTTP listener & process lifecycle
│   ├── .env                                           # Local environment variables (git-ignored)
│   ├── .env.example                                   # Template environment variables
│   ├── .gitignore                                     # Backend ignore rules
│   ├── render.yaml                                    # Render deployment blueprint
│   ├── package.json                                   # Backend dependencies & lifecycle scripts
│   └── package-lock.json
└── Frontend/                                          # Modern Single Page Application (React 19 + Vite 8 + Tailwind CSS 4)
    ├── public/
    ├── src/
    │   ├── api/                                       # API client bindings
    │   ├── assets/                                    # UI assets (images, icons, illustrations)
    │   │   ├── images/
    │   │   ├── icons/
    │   │   └── illustrations/
    │   ├── components/                                # Reusable UI components
    │   │   ├── common/
    │   │   ├── layout/
    │   │   ├── farmer/
    │   │   ├── fpo/
    │   │   ├── buyer/
    │   │   ├── marketplace/
    │   │   ├── recommendations/
    │   │   ├── orders/
    │   │   ├── logistics/
    │   │   ├── sms/
    │   │   └── charts/
    │   ├── layouts/                                   # Role-based shell layouts
    │   ├── pages/                                     # View pages
    │   │   ├── auth/
    │   │   ├── farmer/
    │   │   ├── fpo/
    │   │   ├── buyer/
    │   │   ├── marketplace/
    │   │   ├── orders/
    │   │   ├── admin/
    │   │   └── sms/
    │   ├── routes/                                    # Frontend routing definitions
    │   ├── services/                                  # Frontend service modules
    │   ├── hooks/                                     # Custom React hooks
    │   ├── context/                                   # Global client state (Auth, Notification)
    │   ├── utils/                                     # UI formatters and helpers
    │   ├── data/                                      # Static datasets and mocks
    │   ├── App.jsx                                    # Root component
    │   ├── main.jsx                                   # Vite DOM entry
    │   └── index.css                                  # Tailwind CSS tokens
    ├── .env.example                                   # Template environment variables
    ├── .gitignore                                     # Frontend ignore rules
    ├── vercel.json                                    # Vercel deployment rewrites
    ├── vite.config.js                                 # Vite configuration & dev proxy
    ├── package.json
    └── package-lock.json
```

---

## 🛠️ Technology Stack

| Layer | Technology | Role |
| :--- | :--- | :--- |
| **Frontend** | React 19 + Vite 8 | Fast, modern Single Page Application |
| **Styling** | Tailwind CSS 4 | Utility-first, responsive design tokens |
| **Backend** | Node.js + Express.js | Modular, asynchronous REST API |
| **Database** | MongoDB / Mongoose | Document-oriented schema with relational indexing |
| **Authentication** | JWT (JSON Web Tokens) | Role-aware stateless session tokens |
| **Decision Logic** | Pure JavaScript Engine | Deterministic, explainable net-realisation scoring |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v20.x` or later (tested on Node `v24.x`)
- **npm**: `v10.x` or later

### Installation & Setup

Clone the repository and install all dependencies across Backend, Frontend, and Assets tooling:

```bash
# Install dependencies across Backend, Frontend, and Assets orchestration tooling
npm --prefix Assets run install:all
```

Configure your local backend environment variables:

```bash
# Copy backend template to local .env
cp Backend/.env.example Backend/.env
```

---

## 💻 Available Scripts

Run orchestration scripts via Assets:

| Command | Action |
| :--- | :--- |
| `npm --prefix Assets run dev` | Runs **both** Express backend (`localhost:5000`) and Vite frontend (`localhost:5173`) concurrently |
| `npm --prefix Assets run dev:frontend` | Starts Vite frontend dev server (`http://localhost:5173`) |
| `npm --prefix Assets run dev:backend` | Starts Express backend server with nodemon auto-restart (`http://localhost:5000`) |
| `npm --prefix Assets run dev:client` | Alias for `npm --prefix Assets run dev:frontend` |
| `npm --prefix Assets run dev:server` | Alias for `npm --prefix Assets run dev:backend` |
| `npm --prefix Assets run build` | Builds the frontend production bundle into `Frontend/dist/` |
| `npm --prefix Assets run start` | Starts the production backend server using Node.js |
| `npm --prefix Assets run seed` | Seeds core demo accounts into MongoDB |
| `npm --prefix Assets run seed:demo` | Seeds full demo ecosystem (users, lots, demand, benchmarks) |
| `npm --prefix Assets run install:all` | Installs dependencies across Backend, Frontend, and Assets tooling |

> **Direct Service Execution**:
> You can also run commands directly within each service directory:
> - Backend: `npm --prefix Backend run dev` (or `cd Backend && npm run dev`)
> - Frontend: `npm --prefix Frontend run dev` (or `cd Frontend && npm run dev`)

### 🩺 Health Check Endpoint

Once the backend is started, you can verify API health at:
```
GET http://localhost:5000/api/health
```
Expected Response:
```json
{
  "status": "ok",
  "service": "KisanSetu API",
  "message": "KisanSetu backend architecture foundation initialized",
  "timestamp": "2026-09-08T..."
}
```

---

## 🔐 Phase 1.1 — Authentication & Role System

KisanSetu provides role-aware authentication with JWT sessions and strict backend and frontend access controls across four participant roles:

### Supported Roles
1. **Farmer** (`farmer`): Producer selling produce, viewing transparent market rates and receiving direct buyer demand.
2. **FPO** (`fpo`): Farmer Producer Company aggregating member supply for institutional scale.
3. **Buyer** (`buyer`): Commercial retail/processor posting procurement demand.
4. **Admin** (`admin`): Governance and platform oversight (restricted: barred from public registration).

### Authentication Endpoints
| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new account as Farmer, FPO, or Buyer (Admin blocked) |
| `POST` | `/api/auth/login` | Public | Authenticate with credentials and receive JWT |
| `GET` | `/api/auth/me` | Authenticated | Retrieve authenticated user profile for session persistence |
| `POST` | `/api/auth/logout` | Authenticated | Invalidate session |
| `GET` | `/api/auth/role-check/:role` | Authenticated | Verification endpoint for role-based authorization testing |

### Local Demo Accounts
Seed local demo accounts with pre-hashed credentials:
```bash
# Seed all 4 demo accounts into MongoDB
npm --prefix Assets run seed
```

| Role | Email | Password | Assigned Dashboard |
| :--- | :--- | :--- | :--- |
| **Farmer** | `farmer@kisansetu.in` | `Farmer@123` | `/farmer/dashboard` |
| **FPO** | `fpo@kisansetu.in` | `Fpo@123` | `/fpo/dashboard` |
| **Buyer** | `buyer@kisansetu.in` | `Buyer@123` | `/buyer/dashboard` |
| **Admin** | `admin@kisansetu.in` | `Admin@123` | `/admin/dashboard` |

### How Role-Based Access Control Works
- **Backend**: `authenticate` middleware decodes the JWT and attaches `req.user`. The `requireRole('farmer', 'fpo', ...)` middleware verifies the user's role against permitted values, responding with `403 Forbidden` if unauthorized.
- **Frontend**: The `AuthContext` restores JWT tokens from `localStorage` on page load. Route guards (`ProtectedRoute` and `RoleRoute`) prevent unauthorized URL traversal and redirect users directly to their designated role workspaces without screen flicker.

---

## 👤 Phase 1.2 — User Profiles & Role Dashboards

KisanSetu implements role-specific profile management, profile completion scoring, and rich actionable dashboards for each platform participant.

### Profile Models & Endpoints

| Participant | Profile Endpoint | Edit Endpoint | Key Profile Fields |
| :--- | :--- | :--- | :--- |
| **Farmer** | `GET /api/farmers/me` | `PATCH /api/farmers/profile` | Location (State, District, Taluka, Village, Pincode), Farm Size (Acres), Soil Type, Irrigation Source, Primary Crops, FPO Affiliation |
| **FPO** | `GET /api/fpos/me` | `PATCH /api/fpos/profile` | FPO Name, Registration Number, Head Office, Contact Person/Phone/Email, Member Farmer Count, Aggregated Crops, About Description |
| **Buyer** | `GET /api/buyers/me` | `PATCH /api/buyers/profile` | Business Name, Buyer Type (`wholesaler`, `processor`, `retailer`, `institutional`, `aggregator`, `trader`), Procurement Address, Contact Details, Interested Crops |
| **Admin** | `GET /api/admin/overview` | N/A | System-wide statistics: total users, verified counts, breakdown by role (Farmers, FPOs, Buyers, Admins), and profile count |

### Profile Completion Algorithm

Profiles feature a deterministic 0–100% completion calculator that evaluates presence of critical operational fields:
- **Farmer Profile**: Evaluates `fullName`, `phone`, `village`, `district`, `pincode`, `totalLandAcres` (> 0), `irrigationSource`, and at least 1 `cropInterests`.
- **FPO Profile**: Evaluates `fpoName`, `registrationNumber`, `district`, `pincode`, `contactPerson`, `contactPhone`, `memberCount` (> 0), and at least 1 `majorCrops`.
- **Buyer Profile**: Evaluates `businessName`, `buyerType`, `district`, `facilityAddress`, `contactPerson`, `contactPhone`, and at least 1 `interestedCrops`.

### Role Dashboards & Navigation

Each role lands on a tailored dashboard with live completion meters, contextual onboarding alerts, and modular feature quick-actions:
- **Farmer Workspace**:
  - Dashboard: `/farmer/dashboard` (Shows completion alert, registered farm stats, active produce lot cards placeholder, and direct quick links)
  - Edit Profile: `/farmer/profile` (Multi-card interface: Personal & Location, Land & Soil, Crop Selection, and FPO Association)
- **FPO Workspace**:
  - Dashboard: `/fpo/dashboard` (Shows aggregation capacity, member counts, primary commodities, and member lot pooling readiness)
  - Edit Profile: `/fpo/profile` (Multi-card interface: Organization Details, Head Office, Procurement Contact, and Aggregated Crops)
- **Buyer Workspace**:
  - Dashboard: `/buyer/dashboard` (Shows business categorization, active procurement needs placeholder, verified status badge)
  - Edit Profile: `/buyer/profile` (Multi-card interface: Business Entity, Facility & Logistics Location, Point of Contact, and Commodities)
- **Admin Workspace**:
  - Dashboard: `/admin/dashboard` (Live MongoDB overview metrics, user distribution across roles, profile completion health, and system status)

---

## 🚀 Production Deployment & Cloud Architecture

KisanSetu is architected for zero-configuration modern cloud deployment:

```
[ Frontend: Vercel ]  ----( HTTPS / REST / JWT )---->  [ Backend: Render ]
      │                                                        │
      │ (SPA Rewrites via vercel.json)                         │ (Mongoose ODM)
      ▼                                                        ▼
[ Client Browser (Responsive) ]                         [ MongoDB Atlas ]
```

### 1. Frontend on Vercel
- **Root Directory**: `Frontend`
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **SPA Routing Rewrite**: Handled automatically via [`Frontend/vercel.json`](file:///d:/My%20codes/Projects/SIH26132/KisanSetu/Frontend/vercel.json) to ensure direct route refreshes (`/farmer/dashboard`, `/buyer/demand`, `/orders/...`) resolve cleanly to `index.html`.
- **Environment Variables**:
  | Variable | Value Example | Description |
  |---|---|---|
  | `VITE_API_URL` | `https://kisansetu-backend.onrender.com/api` | Public HTTPS base URL of the deployed backend API |

### 2. Backend on Render
- **Root Directory**: `Backend`
- **Environment**: Node.js
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Blueprint**: Included via [`Backend/render.yaml`](file:///d:/My%20codes/Projects/SIH26132/KisanSetu/Backend/render.yaml)
- **Health Check Path**: `GET /api/health`
- **Environment Variables**:
  | Variable | Production Value Example | Description |
  |---|---|---|
  | `NODE_ENV` | `production` | Enables production optimizations and strict error hygiene |
  | `PORT` | `10000` | Injected automatically by Render container |
  | `CLIENT_URL` | `https://kisansetu.vercel.app` | Allowed CORS frontend origin(s) |
  | `MONGODB_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/kisansetu` | MongoDB Atlas cluster connection URI |
  | `JWT_SECRET` | `secure_random_production_secret_key` | Secret key for signing authentication JWT tokens |
  | `PILOT_STATE` | `Maharashtra` | Target agricultural pilot state |

### 3. Database on MongoDB Atlas
- Compatible with MongoDB Atlas M0 (Free) or dedicated tiers.
- Connects securely using standard TLS/SRV connection strings (`MONGODB_URI`).

---

## 🧪 Demo Seeding & Deterministic Testing

KisanSetu includes an idempotent, deterministic demo seeder that populates all required accounts, market benchmarks, produce supply, buyer demand, and operational orders:

```bash
# Seed all demo users, 30-day APMC prices, lots, demands, and baseline order:
npm --prefix Assets run seed:demo
```

### Verified Demo Accounts

| Role | Email | Password | Assigned Portal | Purpose |
|---|---|---|---|---|
| **Farmer** | `farmer@kisansetu.in` | `Farmer@123` | `/farmer/dashboard` | Produce listing, net-realization, offers, delivery |
| **Buyer** | `buyer@kisansetu.in` | `Buyer@123` | `/buyer/dashboard` | Procurement demand, lot matching, bidding, settlement |
| **FPO** | `fpo@kisansetu.in` | `Fpo@123` | `/fpo/dashboard` | Member aggregation, bulk supply, dispatch |
| **Admin** | `admin@kisansetu.in` | `Admin@123` | `/admin/dashboard` | System metrics, user verification, platform health |

---

## 🌾 End-to-End Demo Journey

The application supports a complete, multi-turn commercial transaction lifecycle:

1. **Farmer Authentication & Produce Lot**:
   - Login as `farmer@kisansetu.in`.
   - Inspect active produce lots (e.g. **Tomato**, Grade B or **Onion**, Grade A).
2. **Market Intelligence & Price Discovery**:
   - Benchmark against prevailing Maharashtra APMC mandi prices (Nashik, Pune, Solapur, etc.).
   - Review 30-day historical price trends and short-horizon forecasts ($T+1$, $T+2$).
3. **Buyer Matching & Net Realisation**:
   - Evaluate multi-channel opportunities ranked by net realization:
     $$\text{Net Realisation} = \text{Offer Price} - (\text{Transport} + \text{Mandi Cess} + \text{Handling})$$
4. **Negotiation & Deal Closure**:
   - Buyer (`buyer@kisansetu.in`) posts demand or submits commercial offer.
   - Farmer counters or accepts. Order is automatically created with quality snapshots.
5. **Logistics & Settlement Operations**:
   - Trace milestone dispatch progression (`scheduled` $\rightarrow$ `picked_up` $\rightarrow$ `in_transit` $\rightarrow$ `delivered`).
   - Execute simulated escrow release (`pending` $\rightarrow$ `processing` $\rightarrow$ `completed`).
6. **2G SMS Channel Coherence**:
   - Test low-bandwidth feature phone channel on `/sms-demo`:
   - Send `SELL 2000 TOMATO` from registered phone `+91 98230 11223` and receive instant structured intelligence.

---

## ⚖️ Data Provenance: Real vs. Prototype Components

| Component | Provenance Classification | Explanation |
|---|---|---|
| **APMC Mandi Rates** | Benchmark Data | Modeled on actual historical Agmarknet/MSAMB modal prices across Maharashtra mandis. |
| **Price Forecasting** | Prototype Estimate | Short-horizon $T+1$/$T+2$ moving-average estimate with uncertainty intervals ($\pm ₹\text{XX}$). Strictly decision-support. |
| **Supply-Demand Matching** | Algorithmic Engine | Deterministic 6-dimension scoring engine evaluating crop, quality, location, quantity, timing, and trust. |
| **Logistics Tracking** | Deterministic Model | Distance and freight calculated using Maharashtra inter-district route metrics and standard tariffs (₹15/q + ₹0.40/q/km). |
| **Payment Settlement** | Simulated Escrow | State machine tracking commercial escrow milestones. No live banking debits occur. |
| **SMS Channel** | Browser Simulator | Full 2G keypad phone simulation of GSM AT-command/SMS gateway parsing without requiring paid telecom hardware. |

---

## 🔒 Branch & Git Strategy

- **Development Branch**: `diganta-solo`
- Work is isolated from `main` to ensure non-destructive iteration during the hackathon evaluation period.

