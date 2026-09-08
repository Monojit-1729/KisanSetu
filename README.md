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
├── Assets/                                            # Master specifications & project assets
│   └── KisanSetu_SIH26132_Final_Consolidated_Project_Documentation.docx
├── Frontend/                                          # Frontend application (React + Vite + Tailwind CSS)
│   ├── public/
│   └── src/
│       ├── api/                                       # API client bindings
│       ├── assets/                                    # UI assets (images, icons, illustrations)
│       │   ├── images/
│       │   ├── icons/
│       │   └── illustrations/
│       ├── components/                                # Reusable UI components
│       │   ├── common/
│       │   ├── layout/
│       │   ├── farmer/
│       │   ├── fpo/
│       │   ├── buyer/
│       │   ├── marketplace/
│       │   ├── recommendations/
│       │   ├── orders/
│       │   ├── logistics/
│       │   ├── sms/
│       │   └── charts/
│       ├── layouts/                                   # Role-based shell layouts
│       ├── pages/                                     # View pages
│       │   ├── auth/
│       │   ├── farmer/
│       │   ├── fpo/
│       │   ├── buyer/
│       │   ├── marketplace/
│       │   ├── orders/
│       │   ├── admin/
│       │   └── sms/
│       ├── routes/                                    # Frontend routing definitions
│       ├── services/                                  # Frontend service modules
│       ├── hooks/                                     # Custom React hooks
│       ├── context/                                   # Global client state (Auth, Notification)
│       ├── utils/                                     # UI formatters and helpers
│       ├── data/                                      # Static datasets and mocks
│       ├── App.jsx                                    # Root component
│       ├── main.jsx                                   # Vite DOM entry
│       └── index.css                                  # Tailwind CSS tokens
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
│   └── package.json
├── docs/                                              # Project research, architecture & presentations
│   ├── research/
│   ├── architecture/
│   ├── product/
│   └── presentations/
├── scripts/                                           # Utility and automation scripts
├── .env                                               # Local environment variables (git-ignored)
├── .env.example                                       # Template environment variables
├── .gitignore                                         # Version control ignore rules
├── package.json                                       # Root workspace manager & concurrent scripts
├── package-lock.json                                  # Workspace dependency tree lockfile
└── README.md
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

### Installation

Clone the repository and install all dependencies from the root:

```bash
# Install root, Frontend, and Backend dependencies in one command
npm install
```

Configure your environment variables:

```bash
# Copy template to .env
cp .env.example .env
```

---

## 💻 Available Scripts

Run scripts from the repository root:

| Command | Action |
| :--- | :--- |
| `npm run dev` | Runs **both** Express backend (`localhost:5000`) and Vite frontend (`localhost:5173`) concurrently |
| `npm run dev:frontend` | Starts Vite frontend dev server (`http://localhost:5173`) |
| `npm run dev:backend` | Starts Express backend server with nodemon auto-restart (`http://localhost:5000`) |
| `npm run dev:client` | Alias for `npm run dev:frontend` (preserved backward compatibility) |
| `npm run dev:server` | Alias for `npm run dev:backend` (preserved backward compatibility) |
| `npm run build` | Builds the frontend production bundle into `Frontend/dist/` |
| `npm run start` | Starts the production server using Node.js |
| `npm run install:all` | Runs `npm install` across root and workspaces |

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
npm run seed
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

## 🗺️ Incremental Implementation Roadmap

- **Phase 1 (Foundation)**: Project shell, Auth foundation, Profile management, Crop/Lot foundation, Market-price data foundation.
- **Phase 2 (Marketplace)**: Buyer procurement demand, supply listings, lot filtering, negotiation offers.
- **Phase 3 (Decision Engine)**: Transport estimation, APMC cess, Gross vs. Net Realisation calculator, explainable recommendation ranking.
- **Phase 4 (Accessibility)**: Keypad-phone SMS/IVR command parser and simulator.
- **Phase 5 (Analytics)**: Price trends, seasonal arrival patterns, predictive indicators.
- **Phase 6 (Logistics & Governance)**: Order state machine, simulated payments, dispute/grievance tracking, verification audit.
