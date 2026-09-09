# KisanSetu Frontend

Client web application for the KisanSetu direct farm-to-buyer marketplace and decision intelligence platform. Built with React, Vite, TailwindCSS, and React Router.

## Features

- **Role-Based Portals**: Tailored interfaces and navigation for Farmers, FPOs, Buyers, and Admins.
- **Dynamic Marketplace**: Browse listings, create lots, search with filters, and view real-time intelligence.
- **Automated Matching Engine**: Match buyer demand with farmer lots based on distance, quantity, and grade.
- **Negotiations & Counter-Offers**: Interactive offer flows with automated net realization calculation.
- **SMS Simulation Console**: Two-way interactive SMS simulation for offline farmer communication workflows.
- **Optimized Performance**: Route-level code splitting using `React.lazy` and `Suspense` for minimal initial page loads.

## Development

```bash
# Install dependencies
npm install

# Start local Vite development server
npm run dev

# Build production bundle with code-splitting
npm run build

# Preview production build locally
npm run preview
```

## Environment Configuration

Create a `.env` file in this directory with the following variables:

```ini
VITE_API_URL=http://localhost:5000/api
```

For production deployment on Vercel:
- **Root Directory**: `Frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variable**: `VITE_API_URL=https://kisansetu-backend-xvcw.onrender.com/api`
