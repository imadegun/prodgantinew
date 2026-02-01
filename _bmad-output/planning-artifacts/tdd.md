---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9]
inputDocuments: ["_bmad-output/planning-artifacts/prd.md"]
workflowType: 'tdd'
date: '2026-02-01'
author: 'Madegun'
---

# Technical Design Document - ProdGantiNew

**Author:** Madegun  
**Date:** 2026-02-01  
**Version:** 1.0  
**Status:** Draft  
**Based on PRD:** ProdGantiNew Product Requirements Document (2026-01-31)

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-01 | Madegun | Initial TDD creation |

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [Database Design](#database-design)
4. [API Design](#api-design)
5. [Frontend Architecture](#frontend-architecture)
6. [Security Architecture](#security-architecture)
7. [Integration Design](#integration-design)
8. [Deployment Architecture](#deployment-architecture)
9. [Development Standards](#development-standards)
10. [Risk Assessment](#risk-assessment)

---

## Executive Summary

This Technical Design Document (TDD) provides the comprehensive technical blueprint for implementing the ProdGantiNew production tracking system. Based on the Product Requirements Document (PRD), this document outlines the system architecture, database schema, API design, frontend architecture, security measures, and deployment strategy.

**Key Technical Decisions:**

- **Backend Framework:** Node.js with Express.js for RESTful API development
- **Frontend Framework:** React.js with TypeScript for type-safe component development
- **Database:** PostgreSQL for production tracking data, MySQL for legacy gayafusionall integration
- **Authentication:** JWT-based authentication with role-based access control
- **Deployment:** Docker containerization with cloud-based hosting (AWS/Google Cloud/Azure)

**Technology Stack Summary:**

| Layer | Technology | Justification |
|-------|------------|---------------|
| Frontend | React.js + TypeScript | Component-based architecture, strong typing, extensive ecosystem |
| Backend | Node.js + Express.js | Fast I/O, JSON-native, large package ecosystem |
| Database | PostgreSQL | Robust relational database, excellent JSON support, mature |
| ORM | Prisma | Type-safe database access, auto-generated migrations |
| Authentication | JWT + bcrypt | Stateless, secure, widely adopted |
| UI Library | Material-UI (MUI) | Professional design, mobile-responsive, accessible |
| State Management | Redux Toolkit | Predictable state management, devtools support |
| Containerization | Docker | Consistent environments, easy scaling |
| Reverse Proxy | Nginx | High performance, SSL termination, load balancing |

---

## System Architecture

### High-Level Architecture

The ProdGantiNew system follows a modern three-tier architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────────┐
│                        Presentation Layer                        │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    React.js Frontend                         ││
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       ││
│  │  │  Dashboard │ │  POL Mgmt  │ │ Production │ │  Reports  │       ││
│  │  │  Components│ │ Components │ │ Tracking   │ │ Components│       ││
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘       ││
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       ││
│  │  │  Alerts   │ │  Logbook  │ │  Revision │ │  Settings │       ││
│  │  │ Components│ │ Components│ │  Tickets  │ │ Components│       ││
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘       ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Application Layer                        │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                  Node.js + Express.js API                    ││
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       ││
│  │  │ Auth API │ │ POL API  │ │ Production│ │ Alert API │       ││
│  │  │ Service  │ │ Service  │ │  Service  │ │ Service  │       ││
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘       ││
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       ││
│  │  │ Report API│ │Logbook  │ │ Revision  │ │ Product  │       ││
│  │  │ Service  │ │ Service │ │  Service  │ │  Service │       ││
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘       ││
│  └─────────────────────────────────────────────────────────────┘│
│                         Middleware Layer                         │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │ Authentication│ │  Validation │ │    Error     │            │
│  │    Middleware │ │  Middleware │ │  Handling    │            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                          Data Layer                              │
│  ┌──────────────────────┐  ┌──────────────────────────────────┐ │
│  │   PostgreSQL         │  │       MySQL (Read-Only)          │ │
│  │   Production Data    │  │    gayafusionall Database        │ │
│  │  ┌────────────────┐  │  │  ┌────────────────────────────┐  │ │
│  │  │  Main Schema   │  │  │  │    tblcollect_master       │  │ │
│  │  │  - users       │  │  │  │    Material data           │  │ │
│  │  │  - pols        │  │  │  │    Tool data               │  │ │
│  │  │  - production  │  │  │  │    Build notes             │  │ │
│  │  │  - alerts      │  │  │  └────────────────────────────┘  │ │
│  │  └────────────────┘  │  └──────────────────────────────────┘ │
│  └──────────────────────┘                                       │
└─────────────────────────────────────────────────────────────────┘
```

### Component Architecture

#### Backend Services

The backend is organized into modular services following the microservice pattern:

**Core Services:**

```
backend/
├── src/
│   ├── config/                 # Configuration files
│   │   ├── database.ts         # Database configuration
│   │   ├── auth.ts            # Authentication configuration
│   │   └── app.ts             # Application configuration
│   │
│   ├── middleware/            # Express middleware
│   │   ├── auth.middleware.ts # JWT authentication
│   │   ├── validation.middleware.ts # Request validation
│   │   ├── error.middleware.ts     # Error handling
│   │   └── logging.middleware.ts   # Request logging
│   │
│   ├── services/              # Business logic services
│   │   ├── auth.service.ts
│   │   ├── pol.service.ts
│   │   ├── production.service.ts
│   │   ├── alert.service.ts
│   │   ├── report.service.ts
│   │   ├── logbook.service.ts
│   │   ├── revision.service.ts
│   │   └── product.service.ts
│   │
│   ├── controllers/           # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── pol.controller.ts
│   │   ├── production.controller.ts
│   │   ├── alert.controller.ts
│   │   ├── report.controller.ts
│   │   ├── logbook.controller.ts
│   │   ├── revision.controller.ts
│   │   └── product.controller.ts
│   │
│   ├── routes/               # API routes
│   │   ├── auth.routes.ts
│   │   ├── pol.routes.ts
│   │   ├── production.routes.ts
│   │   ├── alert.routes.ts
│   │   ├── report.routes.ts
│   │   ├── logbook.routes.ts
│   │   ├── revision.routes.ts
│   │   └── product.routes.ts
│   │
│   ├── models/               # Data models (Prisma schema)
│   │   └── schema.prisma
│   │
│   ├── utils/                # Utility functions
│   │   ├── validation.ts
│   │   ├── helpers.ts
│   │   └── constants.ts
│   │
│   ├── types/                # TypeScript type definitions
│   │   ├── api.types.ts
│   │   └── domain.types.ts
│   │
│   └── app.ts                # Express application setup
│
├── prisma/                   # Database migrations
│   └── migrations/
│
├── tests/                    # Test files
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── scripts/                  # Utility scripts
│   ├── seed.ts
│   └── migrate.ts
│
├── Dockerfile
├── docker-compose.yml
├── package.json
└── tsconfig.json
```

#### Frontend Components

The frontend follows a component-based architecture with clear separation:

```
frontend/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── common/
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   ├── Select/
│   │   │   ├── Modal/
│   │   │   ├── Card/
│   │   │   ├── Table/
│   │   │   ├── Alert/
│   │   │   ├── Loading/
│   │   │   └── EmptyState/
│   │   │
│   │   ├── layout/
│   │   │   ├── Header/
│   │   │   ├── Sidebar/
│   │   │   ├── Footer/
│   │   │   └── Layout/
│   │   │
│   │   └── forms/
│   │       ├── FormField/
│   │       ├── Validation/
│   │       └── FormWizard/
│   │
│   ├── features/             # Feature-specific components
│   │   ├── auth/
│   │   │   ├── LoginForm/
│   │   │   ├── RegisterForm/
│   │   │   └── PasswordReset/
│   │   │
│   │   ├── dashboard/
│   │   │   ├── DashboardOverview/
│   │   │   ├── POLSummary/
│   │   │   ├── AlertBanner/
│   │   │   └── QuickActions/
│   │   │
│   │   ├── pol/
│   │   │   ├── POLList/
│   │   │   ├── POLDetail/
│   │   │   ├── POLForm/
│   │   │   ├── POLProductSelector/
│   │   │   └── POLStatusBadge/
│   │   │
│   │   ├── production/
│   │   │   ├── ProductionTracker/
│   │   │   ├── StageProgress/
│   │   │   ├── QuantityInput/
│   │   │   ├── DecorationTasks/
│   │   │   └── RemakeTracker/
│   │   │
│   │   ├── alerts/
│   │   │   ├── AlertList/
│   │   │   ├── AlertDetail/
│   │   │   ├── AlertPopup/
│   │   │   └── AlertFilters/
│   │   │
│   │   ├── reports/
│   │   │   ├── ReportGenerator/
│   │   │   ├── ReportPreview/
│   │   │   └── ReportExport/
│   │   │
│   │   ├── logbook/
│   │   │   ├── LogbookEntry/
│   │   │   ├── LogbookList/
│   │   │   └── LogbookFilters/
│   │   │
│   │   └── revision/
│   │       ├── RevisionForm/
│   │       ├── RevisionList/
│   │       └── RevisionWorkflow/
│   │
│   ├── pages/               # Page components
│   │   ├── Dashboard/
│   │   ├── POLManagement/
│   │   ├── ProductionTracking/
│   │   ├── Reports/
│   │   ├── Alerts/
│   │   ├── Logbook/
│   │   ├── Revisions/
│   │   ├── Settings/
│   │   └── AuthPages/
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── usePOL.ts
│   │   ├── useProduction.ts
│   │   ├── useAlerts.ts
│   │   └── useReports.ts
│   │
│   ├── services/            # API client services
│   │   ├── api.ts
│   │   ├── auth.service.ts
│   │   ├── pol.service.ts
│   │   ├── production.service.ts
│   │   ├── alert.service.ts
│   │   ├── report.service.ts
│   │   ├── logbook.service.ts
│   │   └── revision.service.ts
│   │
│   ├── store/               # Redux store
│   │   ├── index.ts
│   │   ├── slices/
│   │   │   ├── authSlice.ts
│   │   │   ├── polSlice.ts
│   │   │   ├── productionSlice.ts
│   │   │   ├── alertSlice.ts
│   │   │   └── uiSlice.ts
│   │   └── middleware/
│   │
│   ├── utils/               # Utility functions
│   │   ├── formatting.ts
│   │   ├── validation.ts
│   │   ├── constants.ts
│   │   └── helpers.ts
│   │
│   ├── types/               # TypeScript types
│   │   ├── api.types.ts
│   │   ├── domain.types.ts
│   │   └── component.types.ts
│   │
│   ├── styles/              # Global styles
│   │   ├── theme.ts
│   │   ├── global.css
│   │   └── variables.css
│   │
│   ├── App.tsx
│   └── index.tsx
│
├── public/
│   ├── index.html
│   ├── manifest.json
│   └── favicon.ico
│
├── Dockerfile
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### System Flow Diagrams

#### User Authentication Flow

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│  User   │     │Frontend │     │ Auth API│     │ Database│     │   JWT   │
└────┬────┘     └────┬────┘     └────┬────┘     └────┬────┘     └────┬────┘
     │               │               │               │               │
     │ 1. Login      │               │               │               │
     │──────────────>│               │               │               │
     │               │ 2. POST       │               │               │
     │               │ /api/auth/login               │               │
     │               │──────────────>│               │               │
     │               │               │ 3. Validate   │               │
     │               │               │ credentials   │               │
     │               │               │──────────────>│               │
     │               │               │               │               │
     │               │               │ 4. Hash comp. │               │
     │               │               │ (bcrypt)      │               │
     │               │               │               │               │
     │               │               │ 5. Generate   │               │
     │               │               │ JWT token     │               │
     │               │               │──────────────>│               │
     │               │               │               │ 6. Store      │
     │               │               │               │ session       │
     │               │               │               │──────────────>│
     │               │               │               │               │
     │               │               │ 7. Return     │               │
     │               │               │ JWT + user    │               │
     │               │<──────────────│               │               │
     │               │               │               │               │
     │ 8. Login      │               │               │               │
     │ success       │               │               │               │
     │<──────────────│               │               │               │
     │               │               │               │               │
```

#### Production Tracking Flow

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│  Admin  │     │Frontend │     │Production│    │ Alert   │     │ Database│
└────┬────┘     └────┬────┘     └────┬────┘     └────┬────┘     └────┬────┘
     │               │               │               │               │
     │ 1. Enter      │               │               │               │
     │ quantity      │               │               │               │
     │──────────────>│               │               │               │
     │               │ 2. POST       │               │               │
     │               │ /api/production/track         │               │
     │               │──────────────>│               │               │
     │               │               │ 3. Validate   │               │
     │               │               │ quantity      │               │
     │               │               │               │               │
     │               │               │ 4. Check      │               │
     │               │               │ discrepancy   │               │
     │               │               │──────────────>│               │
     │               │               │               │               │
     │               │               │ 5. Alert if   │               │
     │               │               │ discrepancy   │               │
     │               │               │<──────────────│               │
     │               │               │               │               │
     │               │               │ 6. Save       │               │
     │               │               │ production    │               │
     │               │               │ record        │               │
     │               │               │──────────────>│               │
     │               │               │               │               │
     │               │ 7. Return     │               │               │
     │               │ result + alert│               │               │
     │<──────────────│               │               │               │
     │               │               │               │               │
     │ 8. Show       │               │               │               │
     │ result        │               │               │               │
     │<──────────────│               │               │               │
     │               │               │               │               │
```

---

## Database Design

### PostgreSQL Schema Design

The PostgreSQL database schema is designed to support the ProdGantiNew production tracking system with proper normalization, indexing, and relationships.

#### Entity Relationship Diagram

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│    users     │         │    pols      │         │  pol_details │
├──────────────┤         ├──────────────┤         ├──────────────┤
│ user_id (PK) │◄────────┤ pol_id (PK)  │────────►│ pol_detail_id│
│ username     │ 1:N     │ po_number    │    N:1  │ (PK)         │
│ email        │         │ client_name  │         │ pol_id (FK)  │
│ password_hash│         │ total_order  │         │ product_code │
│ full_name    │         │ po_date      │         │ product_name │
│ role         │         │ delivery_date│         │ color        │
│ created_at   │         │ status       │         │ texture      │
│ updated_at   │         │ created_by   │────────►│ material     │
│ last_login   │         │ created_at   │         │ size         │
└──────────────┘         │ updated_at   │         │ final_size   │
                         └──────────────┘         │ order_qty    │
                              │                   │ extra_buffer │
                              │                   │ created_at   │
                              │                   │ updated_at   │
                              │                   └──────────────┘
                              │
                              ▼
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│  alerts      │         │   records    │         │ decoration_  │
├──────────────┤         ├──────────────┤         │   tasks      │
│ alert_id (PK)│◄────────┤ record_id (PK)│────────►│ task_id (PK) │
│ pol_detail_id│ 1:N     │ pol_detail_id│    N:1  │ pol_detail_id│
│ alert_type   │         │ stage        │         │ task_name    │
│ alert_msg    │         │ quantity     │         │ task_desc    │
│ priority     │         │ reject_qty   │         │ qty_required │
│ status       │         │ remake_cycle │         │ qty_completed│
│ created_at   │         │ notes        │         │ qty_rejected │
│ updated_at   │         │ created_by   │         │ status       │
└──────────────┘         │ created_at   │         │ notes        │
                         │ updated_at   │         │ created_at   │
                         └──────────────┘         │ updated_at   │
                              │                   └──────────────┘
                              │
                              ▼
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│    logs      │         │  revisions   │         │  activity_   │
├──────────────┤         ├──────────────┤         │    logs      │
│ log_id (PK)  │         │ ticket_id (PK)│        │ log_id (PK)  │
│ entry_id     │         │ ticket_number│         │ user_id (FK) │
│ pol_id       │         │ pol_id (FK)  │         │ action       │
│ pol_detail_id│         │ pol_detail_id│         │ entity_type  │
│ stage        │         │ revision_type│         │ entity_id    │
│ issue_type   │         │ description  │         │ details      │
│ description  │         │ reason       │         │ ip_address   │
│ severity     │         │ impact       │         │ created_at   │
│ resolution   │         │ status       │         └──────────────┘
│ status       │         │ created_by   │
│ created_by   │         │ approved_by  │
│ created_at   │         │ created_at   │
└──────────────┘         └──────────────┘
```

#### Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Enums
enum UserRole {
  MANAGER
  ADMIN
}

enum POLStatus {
  DRAFT
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum ProductionStage {
  // Forming stages
  THROWING
  TRIMMING
  DECORATION
  DRYING
  LOAD_BISQUE
  
  // Firing stages
  OUT_BISQUE
  LOAD_HIGH_FIRING
  OUT_HIGH_FIRING
  LOAD_RAKU_FIRING
  OUT_RAKU_FIRING
  LOAD_LUSTER_FIRING
  OUT_LUSTER_FIRING
  
  // Glazing stages
  SANDING
  WAXING
  DIPPING
  SPRAYING
  COLOR_DECORATION
  
  // QC stages
  QC_GOOD
  QC_REJECT
  QC_RE_FIRING
  QC_SECOND
}

enum AlertPriority {
  CRITICAL
  WARNING
  INFORMATIONAL
}

enum AlertStatus {
  OPEN
  ACKNOWLEDGED
  RESOLVED
}

enum IssueType {
  MATERIAL_ISSUE
  TOOL_ISSUE
  PROCESS_ISSUE
  QUALITY_ISSUE
  OTHER
}

enum Severity {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum LogStatus {
  OPEN
  IN_PROGRESS
  RESOLVED
}

enum RevisionStatus {
  DRAFT
  SUBMITTED
  APPROVED
  REJECTED
  IMPLEMENTED
}

enum RevisionType {
  DESIGN_CHANGE
  MATERIAL_CHANGE
  PROCESS_CHANGE
  OTHER
}

// User table
model User {
  user_id       String    @id @default(uuid())
  username      String    @unique
  email         String    @unique
  password_hash String
  full_name     String
  role          UserRole
  created_at    DateTime  @default(now())
  updated_at    DateTime  @updatedAt
  last_login    DateTime?
  is_active     Boolean   @default(true)
  
  // Relationships
  pols                  POL[]
  production_records    ProductionRecord[]
  logbook_entries       LogbookEntry[]
  revision_tickets      RevisionTicket[]
  activity_logs         ActivityLog[]
  acknowledged_alerts   DiscrepancyAlert[] @relation("AlertAcknowledgedBy")
  resolved_alerts       DiscrepancyAlert[] @relation("AlertResolvedBy")
  
  @@map("users")
}

// POL (Purchase Order List) table
model POL {
  pol_id         String     @id @default(uuid())
  po_number      String     @unique
  client_name    String
  total_order    Int        @default(0)
  po_date        DateTime   @default(now())
  delivery_date  DateTime
  status         POLStatus  @default(DRAFT)
  created_by     String
  created_at     DateTime   @default(now())
  updated_at     DateTime   @updatedAt
  
  // Relationships
  createdByUser         User             @relation(fields: [created_by], references: [user_id])
  pol_details           POLDetail[]
  logbook_entries       LogbookEntry[]
  revision_tickets      RevisionTicket[]
  
  @@map("pols")
}

// POL Detail table (products within a POL)
model POLDetail {
  pol_detail_id  String   @id @default(uuid())
  pol_id         String
  product_code   String
  product_name   String
  color          String?
  texture        String?
  material       String?
  size           String?
  final_size     String?
  order_quantity Int
  extra_buffer   Int      @default(15) // Percentage
  created_at     DateTime @default(now())
  updated_at     DateTime @updatedAt
  
  // Relationships
  pol                   POL                 @relation(fields: [pol_id], references: [pol_id], onDelete: Cascade)
  production_records    ProductionRecord[]
  decoration_tasks      DecorationTask[]
  discrepancy_alerts    DiscrepancyAlert[]
  logbook_entries       LogbookEntry[]
  revision_tickets      RevisionTicket[]
  
  @@map("pol_details")
}

// Production Record table
model ProductionRecord {
  record_id       String          @id @default(uuid())
  pol_detail_id   String
  stage           ProductionStage
  quantity        Int
  reject_quantity Int             @default(0)
  remake_cycle    Int             @default(0)
  notes           String?
  created_by      String
  created_at      DateTime        @default(now())
  updated_at      DateTime        @updatedAt
  
  // Relationships
  pol_detail    POLDetail  @relation(fields: [pol_detail_id], references: [pol_detail_id], onDelete: Cascade)
  createdByUser User       @relation(fields: [created_by], references: [user_id])
  
  @@map("production_records")
}

// Decoration Task table
model DecorationTask {
  task_id          String   @id @default(uuid())
  pol_detail_id    String
  task_name        String
  task_description String?
  quantity_required  Int     @default(0)
  quantity_completed Int    @default(0)
  quantity_rejected  Int     @default(0)
  status           String   @default("PENDING") // PENDING, IN_PROGRESS, COMPLETED, REJECTED
  notes            String?
  created_at       DateTime @default(now())
  updated_at       DateTime @updatedAt
  
  // Relationships
  pol_detail POLDetail @relation(fields: [pol_detail_id], references: [pol_detail_id], onDelete: Cascade)
  
  @@map("decoration_tasks")
}

// Discrepancy Alert table
model DiscrepancyAlert {
  alert_id          String        @id @default(uuid())
  pol_detail_id     String
  alert_type        String
  alert_message     String
  priority          AlertPriority @default(WARNING)
  status            AlertStatus   @default(OPEN)
  acknowledged_by   String?
  acknowledged_at   DateTime?
  resolved_by       String?
  resolved_at       DateTime?
  resolution_notes  String?
  created_at        DateTime      @default(now())
  updated_at        DateTime      @updatedAt
  
  // Relationships
  pol_detail       POLDetail  @relation(fields: [pol_detail_id], references: [pol_detail_id], onDelete: Cascade)
  acknowledgedBy   User?      @relation("AlertAcknowledgedBy", fields: [acknowledged_by], references: [user_id])
  resolvedBy       User?      @relation("AlertResolvedBy", fields: [resolved_by], references: [user_id])
  
  @@map("discrepancy_alerts")
}

// Logbook Entry table
model LogbookEntry {
  entry_id     String      @id @default(uuid())
  pol_id       String?
  pol_detail_id String?
  stage        String?
  issue_type   IssueType
  description  String
  severity     Severity
  resolution   String?
  status       LogStatus   @default(OPEN)
  created_by   String
  created_at   DateTime    @default(now())
  updated_at   DateTime    @updatedAt
  
  // Relationships
  pol        POL?       @relation(fields: [pol_id], references: [pol_id])
  pol_detail POLDetail? @relation(fields: [pol_detail_id], references: [pol_detail_id])
  createdBy  User       @relation(fields: [created_by], references: [user_id])
  
  @@map("logbook_entries")
}

// Revision Ticket table
model RevisionTicket {
  ticket_id        String          @id @default(uuid())
  ticket_number    String          @unique
  pol_id           String
  pol_detail_id    String?
  revision_type    RevisionType
  description      String
  reason           String
  impact_assessment String?
  status           RevisionStatus  @default(DRAFT)
  created_by       String
  approved_by      String?
  approved_at      DateTime?
  created_at       DateTime        @default(now())
  updated_at       DateTime        @updatedAt
  
  // Relationships
  pol        POL       @relation(fields: [pol_id], references: [pol_id])
  pol_detail POLDetail? @relation(fields: [pol_detail_id], references: [pol_detail_id])
  createdBy  User      @relation(fields: [created_by], references: [user_id])
  
  @@map("revision_tickets")
}

// Activity Log table (for audit)
model ActivityLog {
  log_id      String   @id @default(uuid())
  user_id     String
  action      String
  entity_type String
  entity_id   String?
  details     String?
  ip_address  String?
  user_agent  String?
  created_at  DateTime @default(now())
  
  // Relationships
  user User @relation(fields: [user_id], references: [user_id])
  
  @@map("activity_logs")
}
```

### MySQL Integration (gayafusionall)

The system integrates with the existing gayafusionall MySQL database in read-only mode for product catalog data:

```typescript
// src/services/gayafusion.service.ts

import { Prisma } from '@prisma/client';

interface GayafusionProduct {
  id: number;
  product_code: string;
  product_name: string;
  color: string;
  texture: string;
  material: string;
  size: string;
  final_size: string;
  clay_type: string;
  clay_quantity: number;
  glaze: string;
  engobe: string;
  luster: string;
  stains_oxides: string;
  casting_tools: string;
  extruders: string;
  textures: string;
  general_tools: string;
  build_notes: string;
}

class GayafusionService {
  private pool: any;
  
  async connect(): Promise<void> {
    this.pool = await createMySQLPool({
      host: process.env.GAYAFUSION_HOST,
      port: parseInt(process.env.GAYAFUSION_PORT || '3306'),
      user: process.env.GAYAFUSION_USER,
      password: process.env.GAYAFUSION_PASSWORD,
      database: process.env.GAYAFUSION_DATABASE,
      multipleStatements: true,
    });
  }
  
  async getProductByCode(productCode: string): Promise<GayafusionProduct | null> {
    const [rows] = await this.pool.query(
      `SELECT * FROM tblcollect_master WHERE product_code = ? LIMIT 1`,
      [productCode]
    );
    return rows.length > 0 ? this.mapProduct(rows[0]) : null;
  }
  
  async searchProducts(query: string, limit: number = 50): Promise<GayafusionProduct[]> {
    const [rows] = await this.pool.query(
      `SELECT * FROM tblcollect_master 
       WHERE product_code LIKE ? OR product_name LIKE ? 
       ORDER BY product_name ASC 
       LIMIT ?`,
      [`%${query}%`, `%${query}%`, limit]
    );
    return rows.map(this.mapProduct);
  }
  
  async getMaterialRequirements(productCode: string): Promise<{
    clay: { type: string; quantity: number }[];
    glazes: string[];
    engobes: string[];
    lusters: string[];
    stainsOxides: string[];
  }> {
    const product = await this.getProductByCode(productCode);
    if (!product) return null;
    
    return {
      clay: [{ type: product.clay_type, quantity: product.clay_quantity }],
      glazes: product.glaze ? product.glaze.split(',').map(g => g.trim()) : [],
      engobes: product.engobe ? product.engobe.split(',').map(e => e.trim()) : [],
      lusters: product.luster ? product.luster.split(',').map(l => l.trim()) : [],
      stainsOxides: product.stains_oxides ? product.stains_oxides.split(',').map(s => s.trim()) : [],
    };
  }
  
  async getToolRequirements(productCode: string): Promise<{
    castingTools: string[];
    extruders: string[];
    textures: string[];
    generalTools: string[];
  }> {
    const product = await this.getProductByCode(productCode);
    if (!product) return null;
    
    return {
      castingTools: product.casting_tools ? product.casting_tools.split(',').map(t => t.trim()) : [],
      extruders: product.extruders ? product.extruders.split(',').map(e => e.trim()) : [],
      textures: product.textures ? product.textures.split(',').map(t => t.trim()) : [],
      generalTools: product.general_tools ? product.general_tools.split(',').map(t => t.trim()) : [],
    };
  }
  
  async getBuildNotes(productCode: string): Promise<string> {
    const product = await this.getProductByCode(productCode);
    return product?.build_notes || '';
  }
  
  private mapProduct(row: any): GayafusionProduct {
    return {
      id: row.id,
      product_code: row.product_code,
      product_name: row.product_name,
      color: row.color,
      texture: row.texture,
      material: row.material,
      size: row.size,
      final_size: row.final_size,
      clay_type: row.clay_type,
      clay_quantity: row.clay_quantity,
      glaze: row.glaze,
      engobe: row.engobe,
      luster: row.luster,
      stains_oxides: row.stains_oxides,
      casting_tools: row.casting_tools,
      extruders: row.extruders,
      textures: row.textures,
      general_tools: row.general_tools,
      build_notes: row.build_notes,
    };
  }
}

export const gayafusionService = new GayafusionService();
```

### Database Indexes

```sql
-- Indexes for users table
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Indexes for pols table
CREATE INDEX idx_pol_po_number ON pols(po_number);
CREATE INDEX idx_pol_client_name ON pols(client_name);
CREATE INDEX idx_pol_status ON pols(status);
CREATE INDEX idx_pol_delivery_date ON pols(delivery_date);
CREATE INDEX idx_pol_created_at ON pols(created_at);

-- Indexes for pol_details table
CREATE INDEX idx_pol_detail_pol_id ON pol_details(pol_id);
CREATE INDEX idx_pol_detail_product_code ON pol_details(product_code);
CREATE INDEX idx_pol_detail_created_at ON pol_details(created_at);

-- Indexes for production_records table
CREATE INDEX idx_production_record_pol_detail_id ON production_records(pol_detail_id);
CREATE INDEX idx_production_record_stage ON production_records(stage);
CREATE INDEX idx_production_record_created_at ON production_records(created_at);
CREATE INDEX idx_production_record_stage_pol_detail ON production_records(pol_detail_id, stage);

-- Indexes for decoration_tasks table
CREATE INDEX idx_decoration_task_pol_detail_id ON decoration_tasks(pol_detail_id);
CREATE INDEX idx_decoration_task_status ON decoration_tasks(status);

-- Indexes for discrepancy_alerts table
CREATE INDEX idx_alert_pol_detail_id ON discrepancy_alerts(pol_detail_id);
CREATE INDEX idx_alert_status ON discrepancy_alerts(status);
CREATE INDEX idx_alert_priority ON discrepancy_alerts(priority);
CREATE INDEX idx_alert_created_at ON discrepancy_alerts(created_at);

-- Indexes for logbook_entries table
CREATE INDEX idx_logbook_pol_id ON logbook_entries(pol_id);
CREATE INDEX idx_logbook_pol_detail_id ON logbook_entries(pol_detail_id);
CREATE INDEX idx_logbook_status ON logbook_entries(status);
CREATE INDEX idx_logbook_severity ON logbook_entries(severity);
CREATE INDEX idx_logbook_created_at ON logbook_entries(created_at);

-- Indexes for revision_tickets table
CREATE INDEX idx_revision_pol_id ON revision_tickets(pol_id);
CREATE INDEX idx_revision_status ON revision_tickets(status);
CREATE INDEX idx_revision_created_at ON revision_tickets(created_at);

-- Indexes for activity_logs table
CREATE INDEX idx_activity_log_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_log_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_log_created_at ON activity_logs(created_at);
```

### Database Migrations

```typescript
// prisma/migrations/001_initial_schema/migration.sql

-- Create enum types
CREATE TYPE "UserRole" AS ENUM ('MANAGER', 'ADMIN');
CREATE TYPE "POLStatus" AS ENUM ('DRAFT', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE "ProductionStage" AS ENUM (
  'THROWING', 'TRIMMING', 'DECORATION', 'DRYING', 'LOAD_BISQUE',
  'OUT_BISQUE', 'LOAD_HIGH_FIRING', 'OUT_HIGH_FIRING',
  'LOAD_RAKU_FIRING', 'OUT_RAKU_FIRING',
  'LOAD_LUSTER_FIRING', 'OUT_LUSTER_FIRING',
  'SANDING', 'WAXING', 'DIPPING', 'SPRAYING', 'COLOR_DECORATION',
  'QC_GOOD', 'QC_REJECT', 'QC_RE_FIRING', 'QC_SECOND'
);
CREATE TYPE "AlertPriority" AS ENUM ('CRITICAL', 'WARNING', 'INFORMATIONAL');
CREATE TYPE "AlertStatus" AS ENUM ('OPEN', 'ACKNOWLEDGED', 'RESOLVED');
CREATE TYPE "IssueType" AS ENUM ('MATERIAL_ISSUE', 'TOOL_ISSUE', 'PROCESS_ISSUE', 'QUALITY_ISSUE', 'OTHER');
CREATE TYPE "Severity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE "LogStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED');
CREATE TYPE "RevisionStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'IMPLEMENTED');
CREATE TYPE "RevisionType" AS ENUM ('DESIGN_CHANGE', 'MATERIAL_CHANGE', 'PROCESS_CHANGE', 'OTHER');

-- Create users table
CREATE TABLE "users" (
  "user_id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "username" VARCHAR(255) NOT NULL UNIQUE,
  "email" VARCHAR(255) NOT NULL UNIQUE,
  "password_hash" VARCHAR(255) NOT NULL,
  "full_name" VARCHAR(255) NOT NULL,
  "role" "UserRole" NOT NULL DEFAULT 'ADMIN',
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "last_login" TIMESTAMP WITH TIME ZONE,
  "is_active" BOOLEAN DEFAULT TRUE
);

-- Create pols table
CREATE TABLE "pols" (
  "pol_id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "po_number" VARCHAR(255) NOT NULL UNIQUE,
  "client_name" VARCHAR(255) NOT NULL,
  "total_order" INTEGER DEFAULT 0,
  "po_date" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "delivery_date" TIMESTAMP WITH TIME ZONE NOT NULL,
  "status" "POLStatus" DEFAULT 'DRAFT',
  "created_by" UUID NOT NULL REFERENCES "users"("user_id"),
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pol_details table
CREATE TABLE "pol_details" (
  "pol_detail_id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "pol_id" UUID NOT NULL REFERENCES "pols"("pol_id") ON DELETE CASCADE,
  "product_code" VARCHAR(255) NOT NULL,
  "product_name" VARCHAR(255) NOT NULL,
  "color" VARCHAR(255),
  "texture" VARCHAR(255),
  "material" VARCHAR(255),
  "size" VARCHAR(255),
  "final_size" VARCHAR(255),
  "order_quantity" INTEGER NOT NULL,
  "extra_buffer" INTEGER DEFAULT 15,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create production_records table
CREATE TABLE "production_records" (
  "record_id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "pol_detail_id" UUID NOT NULL REFERENCES "pol_details"("pol_detail_id") ON DELETE CASCADE,
  "stage" "ProductionStage" NOT NULL,
  "quantity" INTEGER NOT NULL,
  "reject_quantity" INTEGER DEFAULT 0,
  "remake_cycle" INTEGER DEFAULT 0,
  "notes" TEXT,
  "created_by" UUID NOT NULL REFERENCES "users"("user_id"),
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create decoration_tasks table
CREATE TABLE "decoration_tasks" (
  "task_id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "pol_detail_id" UUID NOT NULL REFERENCES "pol_details"("pol_detail_id") ON DELETE CASCADE,
  "task_name" VARCHAR(255) NOT NULL,
  "task_description" TEXT,
  "quantity_required" INTEGER DEFAULT 0,
  "quantity_completed" INTEGER DEFAULT 0,
  "quantity_rejected" INTEGER DEFAULT 0,
  "status" VARCHAR(50) DEFAULT 'PENDING',
  "notes" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create discrepancy_alerts table
CREATE TABLE "discrepancy_alerts" (
  "alert_id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "pol_detail_id" UUID NOT NULL REFERENCES "pol_details"("pol_detail_id") ON DELETE CASCADE,
  "alert_type" VARCHAR(100) NOT NULL,
  "alert_message" TEXT NOT NULL,
  "priority" "AlertPriority" DEFAULT 'WARNING',
  "status" "AlertStatus" DEFAULT 'OPEN',
  "acknowledged_by" UUID REFERENCES "users"("user_id"),
  "acknowledged_at" TIMESTAMP WITH TIME ZONE,
  "resolved_by" UUID REFERENCES "users"("user_id"),
  "resolved_at" TIMESTAMP WITH TIME ZONE,
  "resolution_notes" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create logbook_entries table
CREATE TABLE "logbook_entries" (
  "entry_id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "pol_id" UUID REFERENCES "pols"("pol_id"),
  "pol_detail_id" UUID REFERENCES "pol_details"("pol_detail_id"),
  "stage" VARCHAR(100),
  "issue_type" "IssueType" NOT NULL,
  "description" TEXT NOT NULL,
  "severity" "Severity" NOT NULL,
  "resolution" TEXT,
  "status" "LogStatus" DEFAULT 'OPEN',
  "created_by" UUID NOT NULL REFERENCES "users"("user_id"),
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create revision_tickets table
CREATE TABLE "revision_tickets" (
  "ticket_id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "ticket_number" VARCHAR(255) NOT NULL UNIQUE,
  "pol_id" UUID NOT NULL REFERENCES "pols"("pol_id"),
  "pol_detail_id" UUID REFERENCES "pol_details"("pol_detail_id"),
  "revision_type" "RevisionType" NOT NULL,
  "description" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "impact_assessment" TEXT,
  "status" "RevisionStatus" DEFAULT 'DRAFT',
  "created_by" UUID NOT NULL REFERENCES "users"("user_id"),
  "approved_by" UUID REFERENCES "users"("user_id"),
  "approved_at" TIMESTAMP WITH TIME ZONE,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activity_logs table
CREATE TABLE "activity_logs" (
  "log_id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("user_id"),
  "action" VARCHAR(255) NOT NULL,
  "entity_type" VARCHAR(100) NOT NULL,
  "entity_id" UUID,
  "details" JSONB,
  "ip_address" VARCHAR(50),
  "user_agent" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comments
COMMENT ON TABLE "users" IS 'User accounts for the application';
COMMENT ON TABLE "pols" IS 'Purchase Order Lists';
COMMENT ON TABLE "pol_details" IS 'Products within a POL';
COMMENT ON TABLE "production_records" IS 'Production quantity records at each stage';
COMMENT ON TABLE "decoration_tasks" IS 'Dynamic decoration tasks for products';
COMMENT ON TABLE "discrepancy_alerts" IS 'Alerts for quantity discrepancies and production issues';
COMMENT ON TABLE "logbook_entries" IS 'Logbook entries for production issues';
COMMENT ON TABLE "revision_tickets" IS 'Product revision tickets';
COMMENT ON TABLE "activity_logs" IS 'Audit log for user activities';
```

---

## API Design

### API Architecture

The API follows RESTful design principles with proper versioning, authentication, and error handling.

#### API Versioning Strategy

All API endpoints are versioned using the URL path pattern: `/api/v1/{resource}`

#### Base URL Structure

```
Production: https://api.prodgantinew.com/api/v1
Development: https://dev-api.prodgantinew.com/api/v1
Local: http://localhost:3000/api/v1
```

#### Common Response Format

```typescript
// Success response
interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

// Error response
interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

// Example responses
// 200 OK
{
  "success": true,
  "data": {
    "pol_id": "uuid",
    "po_number": "PO-2026-001",
    "client_name": "ABC Corp"
  }
}

// 201 Created
{
  "success": true,
  "data": {
    "pol_id": "uuid",
    "po_number": "PO-2026-001",
    "client_name": "ABC Corp"
  },
  "message": "POL created successfully"
}

// 400 Bad Request
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "delivery_date": ["Delivery date is required"],
      "client_name": ["Client name cannot be empty"]
    }
  }
}

// 401 Unauthorized
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}

// 403 Forbidden
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You don't have permission to access this resource"
  }
}

// 404 Not Found
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found"
  }
}
```

### Authentication API

#### POST /api/v1/auth/login

**Description:** Authenticate user and return JWT token

**Request:**
```typescript
interface LoginRequest {
  username: string;
  password: string;
}
```

**Response:**
```typescript
interface LoginResponse {
  user: {
    userId: string;
    username: string;
    email: string;
    fullName: string;
    role: 'MANAGER' | 'ADMIN';
  };
  token: string;
  refreshToken: string;
  expiresIn: number;
}
```

**Example:**
```json
{
  "username": "manager",
  "password": "securePassword123"
}
```

#### POST /api/v1/auth/register

**Description:** Register new user (Manager only)

**Request:**
```typescript
interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
  role: 'MANAGER' | 'ADMIN';
}
```

**Response:** 201 Created with user data

#### POST /api/v1/auth/refresh

**Description:** Refresh access token using refresh token

**Request:**
```typescript
interface RefreshRequest {
  refreshToken: string;
}
```

**Response:** New access token

#### POST /api/v1/auth/logout

**Description:** Logout user and invalidate token

**Response:** 200 OK

#### GET /api/v1/auth/me

**Description:** Get current user profile

**Headers:** Authorization: Bearer {token}

**Response:** User profile data

### POL API

#### GET /api/v1/pols

**Description:** Get list of POLs with filtering and pagination

**Query Parameters:**
```typescript
interface POLListQuery {
  page?: number;
  limit?: number;
  status?: 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  clientName?: string;
  poNumber?: string;
  fromDate?: string; // ISO date
  toDate?: string;   // ISO date
  sortBy?: 'created_at' | 'delivery_date' | 'po_number';
  sortOrder?: 'asc' | 'desc';
}
```

**Response:**
```typescript
interface POLListResponse {
  pols: Array<{
    polId: string;
    poNumber: string;
    clientName: string;
    totalOrder: number;
    poDate: string;
    deliveryDate: string;
    status: POLStatus;
    createdAt: string;
    createdBy: {
      userId: string;
      fullName: string;
    };
  }>;
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

#### GET /api/v1/pols/:id

**Description:** Get POL details with all products

**Response:**
```typescript
interface POLDetailResponse {
  pol: {
    polId: string;
    poNumber: string;
    clientName: string;
    totalOrder: number;
    poDate: string;
    deliveryDate: string;
    status: POLStatus;
    createdAt: string;
    updatedAt: string;
    createdBy: {
      userId: string;
      fullName: string;
    };
  };
  details: Array<{
    polDetailId: string;
    productCode: string;
    productName: string;
    color: string;
    texture: string;
    material: string;
    size: string;
    finalSize: string;
    orderQuantity: number;
    extraBuffer: number;
    currentStage: string;
    productionProgress: number;
    materialRequirements: {
      clay: { type: string; quantity: number }[];
      glazes: string[];
      engobes: string[];
      lusters: string[];
      stainsOxides: string[];
    };
    toolRequirements: {
      castingTools: string[];
      extruders: string[];
      textures: string[];
      generalTools: string[];
    };
    buildNotes: string;
  }>;
  activeAlerts: Array<{
    alertId: string;
    alertType: string;
    alertMessage: string;
    priority: AlertPriority;
    createdAt: string;
  }>;
}
```

#### POST /api/v1/pols

**Description:** Create new POL

**Request:**
```typescript
interface CreatePOLRequest {
  clientName: string;
  deliveryDate: string; // ISO date
  products: Array<{
    productCode: string;
    orderQuantity: number;
    extraBuffer?: number;
  }>;
}
```

**Response:** 201 Created with POL data

#### PUT /api/v1/pols/:id

**Description:** Update POL

**Request:**
```typescript
interface UpdatePOLRequest {
  clientName?: string;
  deliveryDate?: string;
  status?: POLStatus;
}
```

**Response:** Updated POL data

#### DELETE /api/v1/pols/:id

**Description:** Delete POL (only if in DRAFT status)

**Response:** 200 OK

### Production Tracking API

#### GET /api/v1/production/:polDetailId/stages

**Description:** Get all production stages for a product

**Response:**
```typescript
interface ProductionStagesResponse {
  polDetailId: string;
  productCode: string;
  productName: string;
  orderQuantity: number;
  currentStage: string;
  stages: Array<{
    stage: ProductionStage;
    displayName: string;
    quantity: number;
    rejectQuantity: number;
    remakeCycle: number;
    completedAt: string;
    completedBy: {
      userId: string;
      fullName: string;
    };
    notes: string;
    isComplete: boolean;
    canTransition: boolean;
  }>;
}
```

#### POST /api/v1/production/track

**Description:** Record production quantity at a stage

**Request:**
```typescript
interface TrackProductionRequest {
  polDetailId: string;
  stage: ProductionStage;
  quantity: number;
  rejectQuantity?: number;
  remakeCycle?: number;
  notes?: string;
}
```

**Response:**
```typescript
interface TrackProductionResponse {
  recordId: string;
  stage: ProductionStage;
  quantity: number;
  rejectQuantity: number;
  remakeCycle: number;
  createdAt: string;
  discrepancyDetected: boolean;
  alerts?: Array<{
    alertId: string;
    alertType: string;
    alertMessage: string;
    priority: AlertPriority;
  }>;
}
```

#### GET /api/v1/production/active

**Description:** Get active production tasks for current user

**Response:**
```typescript
interface ActiveProductionResponse {
  tasks: Array<{
    polDetailId: string;
    polNumber: string;
    productCode: string;
    productName: string;
    currentStage: ProductionStage;
    displayName: string;
    pendingQuantity: number;
    deliveryDate: string;
    urgency: 'NORMAL' | 'URGENT' | 'CRITICAL';
  }>;
}
```

### Decoration Task API

#### GET /api/v1/decorations/:polDetailId

**Description:** Get decoration tasks for a product

**Response:**
```typescript
interface DecorationTasksResponse {
  polDetailId: string;
  tasks: Array<{
    taskId: string;
    taskName: string;
    taskDescription: string;
    quantityRequired: number;
    quantityCompleted: number;
    quantityRejected: number;
    status: string;
    notes: string;
    createdAt: string;
    updatedAt: string;
  }>;
}
```

#### POST /api/v1/decorations

**Description:** Create decoration task

**Request:**
```typescript
interface CreateDecorationTaskRequest {
  polDetailId: string;
  taskName: string;
  taskDescription?: string;
  quantityRequired: number;
  notes?: string;
}
```

**Response:** 201 Created with task data

#### PUT /api/v1/decorations/:taskId

**Description:** Update decoration task

**Request:**
```typescript
interface UpdateDecorationTaskRequest {
  taskName?: string;
  taskDescription?: string;
  quantityCompleted?: number;
  quantityRejected?: number;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';
  notes?: string;
}
```

#### POST /api/v1/decorations/:taskId/track

**Description:** Track decoration task progress

**Request:**
```typescript
interface TrackDecorationTaskRequest {
  quantityCompleted?: number;
  quantityRejected?: number;
  notes?: string;
}
```

### Alert API

#### GET /api/v1/alerts

**Description:** Get list of alerts with filtering

**Query Parameters:**
```typescript
interface AlertListQuery {
  page?: number;
  limit?: number;
  status?: AlertStatus;
  priority?: AlertPriority;
  polDetailId?: string;
}
```

**Response:**
```typescript
interface AlertListResponse {
  alerts: Array<{
    alertId: string;
    polDetailId: string;
    polNumber: string;
    productCode: string;
    productName: string;
    alertType: string;
    alertMessage: string;
    priority: AlertPriority;
    status: AlertStatus;
    createdAt: string;
    acknowledgedBy?: string;
    acknowledgedAt?: string;
    resolvedBy?: string;
    resolvedAt?: string;
  }>;
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    unreadCount: number;
  };
}
```

#### PUT /api/v1/alerts/:id/acknowledge

**Description:** Acknowledge alert

**Response:** Updated alert data

#### PUT /api/v1/alerts/:id/resolve

**Description:** Resolve alert

**Request:**
```typescript
interface ResolveAlertRequest {
  resolutionNotes?: string;
}
```

### Report API

#### GET /api/v1/reports/pol-summary

**Description:** Generate POL order summary report

**Query Parameters:**
```typescript
interface POLSummaryReportQuery {
  fromDate?: string;
  toDate?: string;
  polId?: string;
  status?: POLStatus;
  format?: 'JSON' | 'PDF' | 'EXCEL' | 'CSV';
}
```

#### GET /api/v1/reports/forming-analysis

**Description:** Generate forming analysis report

**Query Parameters:**
```typescript
interface FormingAnalysisReportQuery {
  fromDate?: string;
  toDate?: string;
  polId?: string;
  format?: 'JSON' | 'PDF' | 'EXCEL' | 'CSV';
}
```

#### GET /api/v1/reports/qc-analysis

**Description:** Generate QC analysis report

**Query Parameters:** Similar to forming analysis

#### GET /api/v1/reports/production-progress

**Description:** Get real-time production progress

**Query Parameters:**
```typescript
interface ProductionProgressQuery {
  polId?: string;
  includeAlerts?: boolean;
}
```

### Logbook API

#### GET /api/v1/logbook

**Description:** Get logbook entries with filtering

**Query Parameters:**
```typescript
interface LogbookQuery {
  page?: number;
  limit?: number;
  status?: LogStatus;
  severity?: Severity;
  issueType?: IssueType;
  polId?: string;
  fromDate?: string;
  toDate?: string;
}
```

#### POST /api/v1/logbook

**Description:** Create logbook entry

**Request:**
```typescript
interface CreateLogbookEntryRequest {
  polId?: string;
  polDetailId?: string;
  stage?: string;
  issueType: IssueType;
  description: string;
  severity: Severity;
  resolution?: string;
}
```

#### PUT /api/v1/logbook/:id

**Description:** Update logbook entry

### Revision Ticket API

#### GET /api/v1/revisions

**Description:** Get revision tickets

**Query Parameters:**
```typescript
interface RevisionQuery {
  page?: number;
  limit?: number;
  status?: RevisionStatus;
  polId?: string;
}
```

#### POST /api/v1/revisions

**Description:** Create revision ticket

**Request:**
```typescript
interface CreateRevisionRequest {
  polId: string;
  polDetailId?: string;
  revisionType: RevisionType;
  description: string;
  reason: string;
  impactAssessment?: string;
}
```

#### PUT /api/v1/revisions/:id/submit

**Description:** Submit revision for approval

#### PUT /api/v1/revisions/:id/approve

**Description:** Approve revision (Manager only)

**Request:**
```typescript
interface ApproveRevisionRequest {
  approved: boolean;
  comments?: string;
}
```

### Product API (gayafusionall Integration)

#### GET /api/v1/products/search

**Description:** Search products from gayafusionall

**Query Parameters:**
```typescript
interface ProductSearchQuery {
  q: string;
  limit?: number;
}
```

**Response:**
```typescript
interface ProductSearchResponse {
  products: Array<{
    productCode: string;
    productName: string;
    color: string;
    texture: string;
    material: string;
    size: string;
    finalSize: string;
  }>;
}
```

#### GET /api/v1/products/:code/materials

**Description:** Get material requirements for a product

**Response:**
```typescript
interface MaterialRequirementsResponse {
  productCode: string;
  materials: {
    clay: { type: string; quantity: number }[];
    glazes: string[];
    engobes: string[];
    lusters: string[];
    stainsOxides: string[];
  };
}
```

#### GET /api/v1/products/:code/tools

**Description:** Get tool requirements for a product

**Response:**
```typescript
interface ToolRequirementsResponse {
  productCode: string;
  tools: {
    castingTools: string[];
    extruders: string[];
    textures: string[];
    generalTools: string[];
  };
}
```

#### GET /api/v1/products/:code/notes

**Description:** Get build notes for a product

**Response:**
```typescript
interface BuildNotesResponse {
  productCode: string;
  buildNotes: string;
}
```

### API Middleware

```typescript
// src/middleware/auth.middleware.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';

interface AuthenticatedRequest extends Request {
  user?: User;
}

export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      },
    });
    return;
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      role: string;
    };
    
    // Add user info to request (will be populated from database in actual implementation)
    req.user = {
      user_id: decoded.userId,
      role: decoded.role as 'MANAGER' | 'ADMIN',
    } as User;
    
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired token',
      },
    });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
      return;
    }
    
    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: "You don't have permission to access this resource",
        },
      });
      return;
    }
    
    next();
  };
};
```

---

## Frontend Architecture

### Technology Stack

| Layer | Technology | Version | Justification |
|-------|------------|---------|---------------|
| Framework | React | 18.x | Component-based, virtual DOM, large ecosystem |
| Language | TypeScript | 5.x | Type safety, better IDE support |
| State Management | Redux Toolkit | 2.x | Predictable state, devtools, async handling |
| UI Library | Material-UI (MUI) | 5.x | Professional design, accessible, mobile-first |
| Forms | React Hook Form | 7.x | Performance, validation, easy to use |
| Charts | Recharts | 2.x | React-native charts, customizable |
| HTTP Client | Axios | 1.x | Promise-based, interceptors, request/response transform |
| Routing | React Router | 6.x | Standard routing, nested routes |
| Build Tool | Vite | 5.x | Fast HMR, optimized builds |
| Testing | Jest + React Testing Library | Latest | Unit and integration testing |

### State Management Architecture

```typescript
// src/store/index.ts

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import polReducer from './slices/polSlice';
import productionReducer from './slices/productionSlice';
import alertReducer from './slices/alertSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    pol: polReducer,
    production: productionReducer,
    alerts: alertReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/setUser'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

```typescript
// src/store/slices/authSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService } from '../../services/auth.service';

interface User {
  userId: string;
  username: string;
  email: string;
  fullName: string;
  role: 'MANAGER' | 'ADMIN';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { username: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      localStorage.setItem('token', response.token);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Login failed');
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  localStorage.removeItem('token');
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
```

### Custom Hooks

```typescript
// src/hooks/useAuth.ts

import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from '../store';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Auth-specific hook
export const useAuth = () => {
  const { user, isAuthenticated, isLoading, error } = useAppSelector(
    (state) => state.auth
  );
  
  const dispatch = useAppDispatch();
  
  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login: (credentials: { username: string; password: string }) =>
      dispatch({ type: 'auth/login', payload: credentials }),
    logout: () => dispatch({ type: 'auth/logout' }),
  };
};
```

```typescript
// src/hooks/usePOL.ts

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from './useAuth';
import { polService } from '../services/pol.service';

export const usePOL = () => {
  const dispatch = useAppDispatch();
  const { pols, currentPOL, isLoading, error } = useAppSelector(
    (state) => state.pol
  );
  
  const fetchPOLs = useCallback(
    async (params?: any) => {
      dispatch({ type: 'pol/fetchPOLs', payload: params });
    },
    [dispatch]
  );
  
  const fetchPOLById = useCallback(
    async (id: string) => {
      dispatch({ type: 'pol/fetchPOLById', payload: id });
    },
    [dispatch]
  );
  
  const createPOL = useCallback(
    async (data: any) => {
      return await polService.create(data);
    },
    []
  );
  
  const updatePOL = useCallback(
    async (id: string, data: any) => {
      return await polService.update(id, data);
    },
    []
  );
  
  return {
    pols,
    currentPOL,
    isLoading,
    error,
    fetchPOLs,
    fetchPOLById,
    createPOL,
    updatePOL,
  };
};
```

### API Service Layer

```typescript
// src/services/api.ts

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

class ApiClient {
  private client: AxiosInstance;
  
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
    
    this.setupInterceptors();
  }
  
  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );
    
    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }
  
  async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.client.get(url, { params });
    return response.data.data;
  }
  
  async post<T>(url: string, data: any): Promise<T> {
    const response = await this.client.post(url, data);
    return response.data.data;
  }
  
  async put<T>(url: string, data: any): Promise<T> {
    const response = await this.client.put(url, data);
    return response.data.data;
  }
  
  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete(url);
    return response.data.data;
  }
}

export const apiClient = new ApiClient();
```

```typescript
// src/services/pol.service.ts

import { apiClient } from './api';

export const polService = {
  async getPOLs(params?: {
    page?: number;
    limit?: number;
    status?: string;
    clientName?: string;
  }) {
    return apiClient.get('/pols', params);
  },
  
  async getPOLById(id: string) {
    return apiClient.get(`/pols/${id}`);
  },
  
  async create(data: {
    clientName: string;
    deliveryDate: string;
    products: Array<{
      productCode: string;
      orderQuantity: number;
      extraBuffer?: number;
    }>;
  }) {
    return apiClient.post('/pols', data);
  },
  
  async update(id: string, data: any) {
    return apiClient.put(`/pols/${id}`, data);
  },
  
  async delete(id: string) {
    return apiClient.delete(`/pols/${id}`);
  },
};
```

### Component Structure Examples

```typescript
// src/components/common/Button/Button.tsx

import React from 'react';
import { Button as MuiButton, ButtonProps } from '@mui/material';

interface CustomButtonProps extends Omit<ButtonProps, 'variant'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  isLoading?: boolean;
}

export const Button: React.FC<CustomButtonProps> = ({
  variant = 'primary',
  isLoading = false,
  children,
  disabled,
  ...props
}) => {
  const getVariant = () => {
    switch (variant) {
      case 'secondary':
        return 'contained';
      case 'outline':
        return 'outlined';
      case 'danger':
        return 'contained';
      default:
        return 'contained';
    }
  };
  
  const getColor = () => {
    switch (variant) {
      case 'danger':
        return 'error';
      default:
        return 'primary';
    }
  };
  
  return (
    <MuiButton
      variant={getVariant()}
      color={getColor()}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? 'Loading...' : children}
    </MuiButton>
  );
};
```

```typescript
// src/features/pol/POLList/POLList.tsx

import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  TextField,
  MenuItem,
  Box,
  Chip,
  IconButton,
  Menu,
} from '@mui/material';
import { usePOL } from '../../../hooks/usePOL';
import { Button } from '../../../components/common/Button';
import { POL } from '../../../types/domain.types';

const statusColors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success'> = {
  DRAFT: 'default',
  IN_PROGRESS: 'info',
  COMPLETED: 'success',
  CANCELLED: 'error',
};

export const POLList: React.FC = () => {
  const { pols, isLoading, fetchPOLs } = usePOL();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  useEffect(() => {
    fetchPOLs({
      page: page + 1,
      limit: rowsPerPage,
      status: statusFilter || undefined,
      clientName: searchQuery || undefined,
    });
  }, [page, rowsPerPage, statusFilter, searchQuery]);
  
  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          label="Search by Client"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <TextField
          select
          label="Status"
          variant="outlined"
          size="small"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">All Statuses</MenuItem>
          <MenuItem value="DRAFT">Draft</MenuItem>
          <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
          <MenuItem value="COMPLETED">Completed</MenuItem>
          <MenuItem value="CANCELLED">Cancelled</MenuItem>
        </TextField>
        <Button variant="primary" onClick={() => window.location.href = '/pols/new'}>
          Create POL
        </Button>
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>PO Number</TableCell>
              <TableCell>Client Name</TableCell>
              <TableCell align="right">Total Order</TableCell>
              <TableCell>Delivery Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pols.map((pol: POL) => (
              <TableRow key={pol.polId}>
                <TableCell>{pol.poNumber}</TableCell>
                <TableCell>{pol.clientName}</TableCell>
                <TableCell align="right">{pol.totalOrder}</TableCell>
                <TableCell>
                  {new Date(pol.deliveryDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Chip
                    label={pol.status.replace('_', ' ')}
                    color={statusColors[pol.status]}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(pol.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={(e) => setAnchorEl(e.currentTarget)}
                  >
                    <MenuIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={100} // Total count from API
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => setAnchorEl(null)}>View Details</MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>Edit</MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>Delete</MenuItem>
      </Menu>
    </Box>
  );
};
```

---

## Security Architecture

### Authentication Security

```typescript
// src/config/auth.ts

export const authConfig = {
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-key-change-in-production',
    expiresIn: '8h', // Session timeout
    refreshExpiresIn: '7d',
  },
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecialChar: true,
    maxAge: 90, // days
  },
  session: {
    timeout: 30 * 60 * 1000, // 30 minutes in milliseconds
    absoluteTimeout: 8 * 60 * 60 * 1000, // 8 hours
  },
};
```

### Password Hashing

```typescript
// src/utils/password.util.ts

import bcrypt from 'bcrypt';
import { authConfig } from '../config/auth';

export const passwordUtil = {
  async hash(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  },
  
  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  },
  
  validate(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < authConfig.password.minLength) {
      errors.push(`Password must be at least ${authConfig.password.minLength} characters`);
    }
    if (authConfig.password.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (authConfig.password.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (authConfig.password.requireNumber && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (authConfig.password.requireSpecialChar && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  },
};
```

### JWT Token Management

```typescript
// src/utils/jwt.util.ts

import jwt from 'jsonwebtoken';
import { authConfig } from '../config/auth';

interface TokenPayload {
  userId: string;
  role: string;
  username: string;
}

export const jwtUtil = {
  generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, authConfig.jwt.secret, {
      expiresIn: authConfig.jwt.expiresIn,
    });
  },
  
  generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, authConfig.jwt.secret, {
      expiresIn: authConfig.jwt.refreshExpiresIn,
    });
  },
  
  verifyToken(token: string): TokenPayload {
    return jwt.verify(token, authConfig.jwt.secret) as TokenPayload;
  },
  
  decodeToken(token: string): TokenPayload | null {
    try {
      return jwt.decode(token) as TokenPayload;
    } catch {
      return null;
    }
  },
};
```

### Role-Based Access Control (RBAC)

```typescript
// src/config/rbac.ts

export enum UserRole {
  MANAGER = 'MANAGER',
  ADMIN = 'ADMIN',
}

export const permissions = {
  [UserRole.MANAGER]: [
    'pol:create',
    'pol:read',
    'pol:update',
    'pol:delete',
    'pol:approve',
    'production:read',
    'production:track',
    'report:read',
    'report:generate',
    'logbook:read',
    'logbook:create',
    'logbook:update',
    'revision:create',
    'revision:approve',
    'user:create',
    'user:read',
    'user:update',
    'user:delete',
    'settings:read',
    'settings:update',
  ],
  [UserRole.ADMIN]: [
    'pol:read',
    'production:read',
    'production:track',
    'report:read',
    'report:generate',
    'logbook:read',
    'logbook:create',
    'logbook:update',
  ],
};

export const hasPermission = (role: UserRole, permission: string): boolean => {
  return permissions[role]?.includes(permission) || false;
};
```

### Input Validation

```typescript
// src/utils/validation.ts

import { z } from 'zod';

// Login validation schema
export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

// POL validation schema
export const createPOLSchema = z.object({
  clientName: z.string().min(1, 'Client name is required').max(255),
  deliveryDate: z.string().refine((date) => new Date(date) > new Date(), {
    message: 'Delivery date must be in the future',
  }),
  products: z.array(
    z.object({
      productCode: z.string().min(1, 'Product code is required'),
      orderQuantity: z.number().int().positive('Quantity must be positive'),
      extraBuffer: z.number().int().min(0).max(100).optional(),
    })
  ).min(1, 'At least one product is required'),
});

// Production tracking validation schema
export const trackProductionSchema = z.object({
  polDetailId: z.string().uuid('Invalid POL detail ID'),
  stage: z.enum([
    'THROWING', 'TRIMMING', 'DECORATION', 'DRYING', 'LOAD_BISQUE',
    'OUT_BISQUE', 'LOAD_HIGH_FIRING', 'OUT_HIGH_FIRING',
    'LOAD_RAKU_FIRING', 'OUT_RAKU_FIRING',
    'LOAD_LUSTER_FIRING', 'OUT_LUSTER_FIRING',
    'SANDING', 'WAXING', 'DIPPING', 'SPRAYING', 'COLOR_DECORATION',
    'QC_GOOD', 'QC_REJECT', 'QC_RE_FIRING', 'QC_SECOND',
  ]),
  quantity: z.number().int().nonnegative('Quantity cannot be negative'),
  rejectQuantity: z.number().int().nonnegative().optional(),
  remakeCycle: z.number().int().min(0).optional(),
  notes: z.string().max(1000).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CreatePOLInput = z.infer<typeof createPOLSchema>;
export type TrackProductionInput = z.infer<typeof trackProductionSchema>;
```

### Security Headers

```typescript
// src/middleware/security.middleware.ts

import helmet from 'helmet';
import cors from 'cors';
import { Request, Response, NextFunction } from 'express';

export const securityMiddleware = [
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    crossOriginEmbedderPolicy: false,
  }),
  
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
  
  (req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
  },
];
```

### Rate Limiting

```typescript
// src/middleware/rateLimit.middleware.ts

import rateLimit from 'express-rate-limit';

export const rateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit login attempts to 10 per windowMs
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_LOGIN_ATTEMPTS',
      message: 'Too many login attempts, please try again later',
    },
  },
});
```

---

## Integration Design

### gayafusionall Database Integration

```typescript
// src/services/gayafusion.service.ts

import mysql from 'mysql2/promise';
import { GayafusionProduct, MaterialRequirements, ToolRequirements } from '../types/gayafusion.types';

class GayafusionService {
  private pool: mysql.Pool | null = null;
  
  async initialize(): Promise<void> {
    this.pool = mysql.createPool({
      host: process.env.GAYAFUSION_HOST || 'localhost',
      port: parseInt(process.env.GAYAFUSION_PORT || '3306'),
      user: process.env.GAYAFUSION_USER,
      password: process.env.GAYAFUSION_PASSWORD,
      database: process.env.GAYAFUSION_DATABASE,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  
  async searchProducts(query: string, limit: number = 50): Promise<GayafusionProduct[]> {
    if (!this.pool) await this.initialize();
    
    const [rows] = await this.pool!.execute(
      `SELECT 
        id, product_code, product_name, color, texture, material, 
        size, final_size, clay_type, clay_quantity, glaze, engobe,
        luster, stains_oxides, casting_tools, extruders, textures,
        general_tools, build_notes
       FROM tblcollect_master 
       WHERE product_code LIKE ? OR product_name LIKE ? 
       ORDER BY product_name ASC 
       LIMIT ?`,
      [`%${query}%`, `%${query}%`, limit]
    );
    
    return (rows as any[]).map(this.mapRowToProduct);
  }
  
  async getProductByCode(productCode: string): Promise<GayafusionProduct | null> {
    if (!this.pool) await this.initialize();
    
    const [rows] = await this.pool!.execute(
      `SELECT * FROM tblcollect_master WHERE product_code = ?`,
      [productCode]
    );
    
    if (rows.length === 0) return null;
    return this.mapRowToProduct(rows[0]);
  }
  
  async getMaterialRequirements(productCode: string): Promise<MaterialRequirements | null> {
    const product = await this.getProductByCode(productCode);
    if (!product) return null;
    
    return {
      clay: product.clay_quantity > 0 
        ? [{ type: product.clay_type, quantity: product.clay_quantity }]
        : [],
      glazes: this.splitAndTrim(product.glaze),
      engobes: this.splitAndTrim(product.engobe),
      lusters: this.splitAndTrim(product.luster),
      stainsOxides: this.splitAndTrim(product.stains_oxides),
    };
  }
  
  async getToolRequirements(productCode: string): Promise<ToolRequirements | null> {
    const product = await this.getProductByCode(productCode);
    if (!product) return null;
    
    return {
      castingTools: this.splitAndTrim(product.casting_tools),
      extruders: this.splitAndTrim(product.extruders),
      textures: this.splitAndTrim(product.textures),
      generalTools: this.splitAndTrim(product.general_tools),
    };
  }
  
  async getBuildNotes(productCode: string): Promise<string> {
    const product = await this.getProductByCode(productCode);
    return product?.build_notes || '';
  }
  
  private mapRowToProduct(row: any): GayafusionProduct {
    return {
      id: row.id,
      product_code: row.product_code,
      product_name: row.product_name,
      color: row.color,
      texture: row.texture,
      material: row.material,
      size: row.size,
      final_size: row.final_size,
      clay_type: row.clay_type,
      clay_quantity: row.clay_quantity,
      glaze: row.glaze,
      engobe: row.engobe,
      luster: row.luster,
      stains_oxides: row.stains_oxides,
      casting_tools: row.casting_tools,
      extruders: row.extruders,
      textures: row.textures,
      general_tools: row.general_tools,
      build_notes: row.build_notes,
    };
  }
  
  private splitAndTrim(value: string | null): string[] {
    if (!value) return [];
    return value.split(',').map(s => s.trim()).filter(s => s.length > 0);
  }
}

export const gayafusionService = new GayafusionService();
```

---

## Deployment Architecture

### Docker Configuration

```dockerfile
# backend/Dockerfile

FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS production

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "dist/main.js"]
```

```dockerfile
# frontend/Dockerfile

FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine AS production

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

```nginx
# nginx.conf

server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # API proxy
    location /api {
        proxy_pass http://backend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```yaml
# docker-compose.yml

version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: prodganti_postgres
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-prodganti}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-prodganti_secret}
      POSTGRES_DB: ${POSTGRES_DB:-prodganti}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - prodganti_network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-prodganti}"]
      interval: 10s
      timeout: 5s
      retries: 5

  # MySQL (gayafusionall)
  mysql:
    image: mysql:8.0
    container_name: prodganti_mysql
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD:-mysql_secret}
      MYSQL_DATABASE: ${MYSQL_DATABASE:-gayafusionall}
    volumes:
      - mysql_data:/var/lib/mysql
      - ./gayafusionall.sql:/docker-entrypoint-initdb.d/gayafusionall.sql
    ports:
      - "3306:3306"
    networks:
      - prodganti_network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: prodganti_backend
    environment:
      NODE_ENV: production
      PORT: 3000
      DATABASE_URL: postgresql://${POSTGRES_USER:-prodganti}:${POSTGRES_PASSWORD:-prodganti_secret}@postgres:5432/${POSTGRES_DB:-prodganti}
      JWT_SECRET: ${JWT_SECRET:-your-super-secret-key}
      GAYAFUSION_HOST: mysql
      GAYAFUSION_PORT: 3306
      GAYAFUSION_USER: root
      GAYAFUSION_PASSWORD: ${MYSQL_ROOT_PASSWORD:-mysql_secret}
      GAYAFUSION_DATABASE: ${MYSQL_DATABASE:-gayafusionall}
      CORS_ORIGIN: ${CORS_ORIGIN:-http://localhost:3000}
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
      mysql:
        condition: service_healthy
    networks:
      - prodganti_network
    restart: unless-stopped

  # Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: prodganti_frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - prodganti_network
    restart: unless-stopped

  # Redis (for caching and sessions)
  redis:
    image: redis:7-alpine
    container_name: prodganti_redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - prodganti_network
    restart: unless-stopped

volumes:
  postgres_data:
  mysql_data:
  redis_data:

networks:
  prodganti_network:
    driver: bridge
```

### Cloud Deployment (AWS Example)

```yaml
# aws/terraform/main.tf

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  backend "s3" {
    bucket = "prodganti-terraform-state"
    key    = "prodganti/main.tfstate"
    region = "ap-southeast-1"
  }
}

provider "aws" {
  region = "ap-southeast-1"
}

# VPC
resource "aws_vpc" "prodganti_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = {
    Name = "prodganti-vpc"
  }
}

# Subnets
resource "aws_subnet" "public_subnet_1" {
  vpc_id                  = aws_vpc.prodganti_vpc.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "ap-southeast-1a"
  map_public_ip_on_launch = true
  
  tags = {
    Name = "prodganti-public-1"
  }
}

resource "aws_subnet" "private_subnet_1" {
  vpc_id                  = aws_vpc.prodganti_vpc.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = "ap-southeast-1a"
  
  tags = {
    Name = "prodganti-private-1"
  }
}

# RDS PostgreSQL
resource "aws_db_instance" "prodganti_postgres" {
  identifier        = "prodganti-postgres"
  engine            = "postgres"
  engine_version    = "15.4"
  instance_class    = "db.t3.micro"
  allocated_storage = 20
  storage_encrypted = true
  
  db_name  = "prodganti"
  username = "prodganti_admin"
  password = random_password.db_password.result
  
  vpc_security_group_ids = [aws_security_group.db.id]
  db_subnet_group_name   = aws_db_subnet_group.prodganti.name
  
  backup_retention_period = 7
  skip_final_snapshot     = false
  
  tags = {
    Name = "prodganti-postgres"
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "prodganti_cluster" {
  name = "prodganti-cluster"
  
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# ECS Task Definition (Backend)
resource "aws_ecs_task_definition" "backend" {
  family                   = "prodganti-backend"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "512"
  memory                   = "1024"
  
  execution_role_arn = aws_iam_role.ecs_execution_role.arn
  task_role_arn      = aws_iam_role.ecs_task_role.arn
  
  container_definitions = jsonencode([
    {
      name  = "backend"
      image = "${aws_ecr_repository.backend.repository_url}:latest"
      portMappings = [
        {
          containerPort = 3000
          protocol      = "tcp"
        }
      ]
      environment = [
        { name = "NODE_ENV", value = "production" },
        { name = "DATABASE_URL", value = "postgresql://..." },
        { name = "JWT_SECRET", value = "your-secret" }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.backend.name
          "awslogs-region"        = "ap-southeast-1"
          "awslogs-stream-prefix" = "backend"
        }
      }
    }
  ])
}

# ECS Service
resource "aws_ecs_service" "backend" {
  name            = "prodganti-backend"
  cluster         = aws_ecs_cluster.prodganti_cluster.id
  task_definition = aws_ecs_task_definition.backend.arn
  desired_count   = 2
  launch_type     = "FARGATE"
  
  network_configuration {
    subnets          = [aws_subnet.private_subnet_1.id]
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = false
  }
  
  load_balancer {
    target_group_arn = aws_alb_target_group.backend.id
    container_name   = "backend"
    container_port   = 3000
  }
}

# Application Load Balancer
resource "aws_alb" "prodganti" {
  name               = "prodganti-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = [aws_subnet.public_subnet_1.id]
  
  enable_deletion_protection = true
}

resource "aws_alb_target_group" "backend" {
  name        = "prodganti-backend-tg"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = aws_vpc.prodganti_vpc.id
  target_type = "ip"
  
  health_check {
    path                = "/api/health"
    healthy_threshold_count = 2
    unhealthy_threshold_count = 3
    timeout             = 30
    interval            = 60
  }
}

resource "aws_alb_listener" "frontend" {
  load_balancer_arn = aws_alb.prodganti.arn
  port              = 80
  protocol          = "HTTP"
  
  default_action {
    type = "forward"
    target_group_arn = aws_alb_target_group.frontend.id
  }
}

# CloudWatch Logs
resource "aws_cloudwatch_log_group" "backend" {
  name              = "/ecs/prodganti-backend"
  retention_in_days = 30
}

# ECR Repositories
resource "aws_ecr_repository" "backend" {
  name                 = "prodganti-backend"
  image_tag_mutability = "MUTABLE"
  
  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_repository" "frontend" {
  name                 = "prodganti-frontend"
  image_tag_mutability = "MUTABLE"
  
  image_scanning_configuration {
    scan_on_push = true
  }
}
```

---

## Development Standards

### Code Style Guidelines

```json
// backend/.eslintrc.json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint", "prettier"],
  "rules": {
    "prettier/prettier": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "no-console": "warn"
  }
}
```

```json
// frontend/.eslintrc.json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint", "prettier", "react"],
  "rules": {
    "prettier/prettier": "error",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off"
  }
}
```

### Testing Standards

```typescript
// backend/jest.config.js

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
  ],
  coverageDirectory: 'coverage',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
};
```

```typescript
// backend/tests/production.service.test.ts

import { productionService } from '../src/services/production.service';
import { prisma } from '../src/config/database';

jest.mock('../src/config/database');

describe('ProductionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('trackProduction', () => {
    it('should create production record and check for discrepancies', async () => {
      const mockRecord = {
        record_id: 'test-uuid',
        pol_detail_id: 'pol-detail-uuid',
        stage: 'THROWING',
        quantity: 50,
        reject_quantity: 0,
        remake_cycle: 0,
        created_at: new Date(),
      };
      
      (prisma.productionRecord.create as jest.Mock).mockResolvedValue(mockRecord);
      (prisma.productionRecord.findFirst as jest.Mock).mockResolvedValue(null);
      
      const result = await productionService.trackProduction({
        polDetailId: 'pol-detail-uuid',
        stage: 'THROWING',
        quantity: 50,
      });
      
      expect(result).toHaveProperty('recordId');
      expect(result.quantity).toBe(50);
      expect(prisma.productionRecord.create).toHaveBeenCalledTimes(1);
    });
    
    it('should detect quantity discrepancy', async () => {
      const previousRecord = {
        record_id: 'prev-uuid',
        quantity: 50,
      };
      
      (prisma.productionRecord.findFirst as jest.Mock).mockResolvedValue(previousRecord);
      
      const result = await productionService.trackProduction({
        polDetailId: 'pol-detail-uuid',
        stage: 'TRIMMING',
        quantity: 55, // More than previous stage
      });
      
      expect(result.discrepancyDetected).toBe(true);
      expect(result.alerts).toBeDefined();
    });
  });
});
```

```typescript
// frontend/src/features/pol/__tests__/POLList.test.tsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { POLList } from '../POLList';
import { store } from '../../../store';

jest.mock('../../../services/pol.service', () => ({
  polService: {
    getPOLs: jest.fn(),
  },
}));

describe('POLList', () => {
  const renderComponent = () => {
    render(
      <Provider store={store}>
        <POLList />
      </Provider>
    );
  };
  
  it('should render loading state initially', () => {
    renderComponent();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
  
  it('should display POLs after loading', async () => {
    // Mock API response
    jest.spyOn(require('../../../services/pol.service'), 'getPOLs')
      .mockResolvedValue({
        pols: [
          {
            polId: 'test-uuid',
            poNumber: 'PO-2026-001',
            clientName: 'Test Client',
            totalOrder: 100,
            deliveryDate: '2026-02-15',
            status: 'IN_PROGRESS',
            createdAt: '2026-01-15',
          },
        ],
      });
    
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('PO-2026-001')).toBeInTheDocument();
      expect(screen.getByText('Test Client')).toBeInTheDocument();
    });
  });
});
```

### Git Workflow

```bash
# Branch naming convention
# feature/TICKET-ID-description
# bugfix/TICKET-ID-description
# hotfix/description
# release/version

# Example branches
feature/PROD-001-pol-management
bugfix/PROD-002-login-issue
hotfix/security-patch
release/v1.0.0

# Commit message format
# TYPE(TICKET-ID): Description
# 
# Examples:
# feat(PROD-001): Add POL creation form
# fix(PROD-002): Resolve authentication timeout issue
# docs(PROD-003): Update API documentation
# refactor(PROD-004): Improve database query performance
```

### Code Review Checklist

- [ ] Code follows style guidelines
- [ ] Tests added/updated for new functionality
- [ ] No console.log statements left in code
- [ ] API endpoints documented
- [ ] Security considerations addressed
- [ ] Performance impact evaluated
- [ ] Error handling implemented
- [ ] Comments added for complex logic
- [ ] No hardcoded values (use environment variables)
- [ ] Access control properly implemented

---

## Risk Assessment

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| gayafusionall schema incompatibility | Medium | High | Thorough schema review, flexible data mapping |
| Performance issues with large datasets | Medium | Medium | Pagination, indexing, caching strategy |
| Security vulnerabilities | Low | Critical | Regular security audits, penetration testing |
| Integration failures | Medium | High | Robust error handling, retry mechanisms |
| Data migration issues | Low | High | Backup before migration, rollback plan |

### Mitigation Strategies

1. **gayafusionall Integration:**
   - Create data mapping layer
   - Implement validation for data consistency
   - Use read-only access pattern
   - Maintain local cache for frequently accessed data

2. **Performance:**
   - Implement database indexing strategy
   - Use Redis for caching
   - Implement pagination for large lists
   - Optimize database queries

3. **Security:**
   - Implement JWT with short expiration
   - Use bcrypt for password hashing
   - Regular security audits
   - Implement rate limiting
   - Use HTTPS/TLS

4. **Reliability:**
   - Automated backups
   - Disaster recovery plan
   - Health checks and monitoring
   - Graceful error handling

---

## Appendix

### A. Environment Variables

```env
# Backend (.env)
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/prodganti
JWT_SECRET=your-super-secret-key
GAYAFUSION_HOST=localhost
GAYAFUSION_PORT=3306
GAYAFUSION_USER=root
GAYAFUSION_PASSWORD=root
GAYAFUSION_DATABASE=gayafusionall
CORS_ORIGIN=http://localhost:3000

# Frontend (.env)
VITE_API_URL=http://localhost:3000/api/v1
VITE_APP_NAME=ProdGantiNew
```

### B. API Endpoint Summary

| Module | Endpoint | Method | Description |
|--------|----------|--------|-------------|
| Auth | /api/v1/auth/login | POST | User login |
| Auth | /api/v1/auth/register | POST | Register user |
| Auth | /api/v1/auth/logout | POST | User logout |
| POL | /api/v1/pols | GET | List POLs |
| POL | /api/v1/pols/:id | GET | Get POL details |
| POL | /api/v1/pols | POST | Create POL |
| POL | /api/v1/pols/:id | PUT | Update POL |
| Production | /api/v1/production/:id/stages | GET | Get production stages |
| Production | /api/v1/production/track | POST | Track production |
| Alerts | /api/v1/alerts | GET | List alerts |
| Alerts | /api/v1/alerts/:id/acknowledge | PUT | Acknowledge alert |
| Reports | /api/v1/reports/pol-summary | GET | POL summary report |
| Logbook | /api/v1/logbook | GET | List logbook entries |
| Logbook | /api/v1/logbook | POST | Create logbook entry |
| Revisions | /api/v1/revisions | GET | List revision tickets |
| Revisions | /api/v1/revisions | POST | Create revision ticket |
| Products | /api/v1/products/search | GET | Search products |

### C. Glossary

- **POL:** Purchase Order List
- **JWT:** JSON Web Token
- **RBAC:** Role-Based Access Control
- **Prisma:** ORM for Node.js and TypeScript
- **MUI:** Material-UI React component library
- **ECS:** Amazon Elastic Container Service
- **RDS:** Amazon Relational Database Service
- **ALB:** Application Load Balancer

---

**Document Status:** Draft  
**Next Review Date:** TBD  
**Approved By:** TBD  
**Approval Date:** TBD
