# ProdGantiNew Frontend

Production Tracking System Frontend - React + TypeScript + Material-UI

## Overview

This is the frontend application for ProdGantiNew, a production tracking system for handcrafted ceramic art manufacturing. Built with React 18, TypeScript, and Material-UI following the UI/UX wireframes from the PRD.

## Tech Stack

- **Framework:** React 18 with TypeScript
- **UI Library:** Material-UI (MUI) v5
- **State Management:** Redux Toolkit
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **Build Tool:** Vite
- **Charts:** Recharts
- **Date Handling:** date-fns

## Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page components
│   ├── store/          # Redux store and slices
│   ├── services/       # API services
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   ├── routes/         # Route definitions
│   ├── App.tsx         # Main app component
│   ├── main.tsx        # Entry point
│   ├── theme.ts        # MUI theme configuration
│   └── App.css         # Global styles
├── public/             # Static assets
├── index.html          # HTML entry point
├── package.json        # Dependencies
├── tsconfig.json       # TypeScript configuration
├── vite.config.ts      # Vite configuration
└── .env.example        # Environment variables template
```

## Features

### Authentication
- Login/logout with JWT tokens
- Role-based access control (Manager, Admin)
- Session management

### POL Management
- Create, view, edit, delete Purchase Order Lists
- Search and filter by status, date, client
- Product lookup from gayafusionall database

### Production Tracking
- Multi-stage production tracking (Forming, Firing, Glazing, QC)
- Quantity entry with validation
- Decoration task management
- Reject and remake tracking

### Alert System
- Real-time discrepancy alerts
- Delivery risk notifications
- Alert acknowledgment and resolution

### Reporting
- POL order summary reports
- Forming and QC analysis
- Production progress tracking
- Export to PDF, Excel, CSV

### Logbook
- Issue logging and tracking
- Severity-based categorization
- Resolution tracking

### Revision Tickets
- Design/material/process change tracking
- Approval workflow
- Impact assessment

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create environment file:
   ```bash
   cp .env.example .env
   ```

5. Configure environment variables in `.env`

6. Start development server:
   ```bash
   npm run dev
   ```

7. Open http://localhost:3000 in your browser

### Demo Credentials
- **Manager:** manager / manager123
- **Admin:** admin / admin123

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking

## API Integration

The frontend connects to the backend API at `http://localhost:5000/api`. Configure the API URL in `.env`:

```
VITE_API_URL=http://localhost:5000/api
```

### Available API Services

- `authService` - Authentication endpoints
- `polService` - POL management
- `productService` - Product lookup from gayafusionall
- `productionService` - Production tracking
- `alertService` - Alert management
- `dashboardService` - Dashboard statistics
- `logbookService` - Logbook entries
- `revisionService` - Revision tickets
- `reportService` - Report generation

## Responsive Design

The application is fully responsive with breakpoints:
- **xs:** < 600px (Mobile phones)
- **sm:** 600px - 959px (Large phones, small tablets)
- **md:** 960px - 1279px (Tablets, small laptops)
- **lg:** 1280px - 1919px (Laptops, desktops)
- **xl:** ≥ 1920px (Large desktops)

## Accessibility

- WCAG 2.1 Level AA compliant
- Keyboard navigation support
- Screen reader compatible
- Color contrast ratios ≥ 4.5:1
- ARIA labels and roles

## License

Proprietary - All rights reserved
