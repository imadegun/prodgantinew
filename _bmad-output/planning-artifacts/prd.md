---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments: ["_bmad-output/planning-artifacts/product-brief-ProdGantiNew-2026-01-31.md"]
workflowType: 'prd'
date: '2026-01-31'
author: 'Madegun'
---

# Product Requirements Document - ProdGantiNew

**Author:** Madegun
**Date:** 2026-01-31
**Version:** 1.0
**Status:** Draft

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-31 | Madegun | Initial PRD creation |

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Product Overview](#product-overview)
3. [User Personas](#user-personas)
4. [Functional Requirements](#functional-requirements)
5. [Non-Functional Requirements](#non-functional-requirements)
6. [Technical Requirements](#technical-requirements)
7. [User Interface Requirements](#user-interface-requirements)
8. [Data Requirements](#data-requirements)
9. [Integration Requirements](#integration-requirements)
10. [Security Requirements](#security-requirements)
11. [Performance Requirements](#performance-requirements)
12. [Testing Requirements](#testing-requirements)
13. [Deployment Requirements](#deployment-requirements)
14. [MVP Scope](#mvp-scope)
15. [Future Roadmap](#future-roadmap)
16. [Success Metrics](#success-metrics)

---

## Executive Summary

ProdGantiNew is a web-based production tracking system designed for handcrafted ceramic art production. The system addresses critical operational challenges in ceramic manufacturing: material and tool availability management, multi-stage production tracking, and delivery target assurance through intelligent alerts.

The solution integrates with the existing gayafusionall MySQL database (20+ years of product data) while leveraging PostgreSQL for new production tracking functionality. Key differentiators include dynamic decoration task management, multi-stage quantity tracking with discrepancy alerts, and ceramic-specific workflow understanding.

**Key Business Value:**
- Reduce manual tracking time by 40%+
- Improve on-time delivery rate by 20%+
- Achieve <5% data discrepancy rate
- Eliminate field verification requirements
- Provide real-time production visibility

**Target Users:**
- Production Managers (primary)
- Production Admin Team (primary)
- Public Users - clients/stakeholders (secondary, v2.0)

---

## Product Overview

### Product Vision

To become the industry-leading production tracking solution for handcrafted ceramic art, enabling studios to achieve operational excellence through intelligent automation, real-time visibility, and data-driven decision making.

### Product Mission

Empower ceramic production teams with a modern, intuitive system that eliminates manual tracking waste, ensures data accuracy, and enables proactive management of production risks.

### Product Goals

1. **Efficiency:** Reduce manual tracking and verification time by 40%+
2. **Accuracy:** Achieve <5% data discrepancy rate across all production stages
3. **Visibility:** Provide real-time production progress tracking for all stakeholders
4. **Reliability:** Improve on-time delivery rate by 20%+
5. **Scalability:** Support 2x production volume without additional headcount

### Problem Statement

Production managers in handcrafted ceramic art face significant operational challenges:

1. **Material & Tool Availability:** Ensuring all necessary raw materials and tools are available before production begins
2. **Complex Production Tracking:** Managing ceramic production through multiple stages (forming, firing, glazing, QC, remake)
3. **Delivery Target Management:** Ensuring delivery targets are met with system alerts for production reductions

### Solution Overview

A modern web application that:
- Integrates with existing gayafusionall MySQL database for product data
- Uses PostgreSQL for new production tracking functionality
- Automates material and tool preparation workflows
- Provides comprehensive multi-stage production tracking
- Delivers intelligent alerts and notifications
- Offers reporting and visibility dashboards

---

## User Personas

### Primary User 1: Production Manager

**Profile:**
- Role: Oversees entire production process, creates POLs, manages delivery targets
- Environment: Office-based, reviews production status daily
- Technical Proficiency: Moderate - comfortable with web applications and spreadsheets
- Motivation: Ensure on-time delivery, accurate tracking, efficient resource management

**Goals:**
- Eliminate manual tracking waste
- Catch delivery risks early
- Ensure data accuracy without field verification
- Make data-driven production decisions

**Pain Points:**
- Currently uses Pepper Records to summarize spreadsheets
- Manual tracking wastes time, effort, and personnel resources
- Must check and recalculate in field to ensure data is correct
- Delivery dates often missed, especially with low orders and remakes
- Quantities are often inaccurate due to manual processing

**Success Criteria:**
- Real-time visibility into all production stages
- Automatic alerts for production issues
- Accurate data without manual field verification
- Efficient resource management and on-time delivery

---

### Primary User 2: Production Admin

**Profile:**
- Role: Enters production data at each stage into the system
- Environment: Workshop floor, mobile/tablet usage
- Technical Proficiency: Basic - needs simple, intuitive interface
- Motivation: Accurate quantity tracking, easy data entry, clear visibility

**Goals:**
- Eliminate manual data entry errors
- Handle complex tracking of main parts vs additional parts
- Receive automatic discrepancy alerts
- Complete data entry quickly during work shifts

**Pain Points:**
- Currently tracks on spreadsheets and product worksheet data
- Manual data entry is time-consuming and error-prone
- Complex tracking required for products with additional components
- Quantity discrepancies require manual recalculation

**Success Criteria:**
- Simple mobile-friendly interface for data entry
- Automatic discrepancy alerts
- Ability to track both main parts and additional parts
- Dynamic decoration task management for complex workflows

---

### Secondary User 3: Public User (Client/Stakeholder)

**Profile:**
- Role: View production tracking page
- Environment: Any device, no login required
- Technical Proficiency: Varied - needs simple, accessible interface
- Motivation: Visibility into order status without calling/emailing

**Goals:**
- Track order progress independently
- See current stage and delivery date
- Receive proactive updates on delays

**Pain Points:**
- Currently must call or email for status updates
- Lack of visibility into production progress
- Uncertainty about delivery dates
- Frustration when orders are late without notice

**Success Criteria:**
- Easy-to-access public tracking page
- Clear view of current production stage
- Estimated delivery date
- Progress visualization

**Note:** Public tracking page is deferred to v2.0

---

## Functional Requirements

### FR-001: POL (Purchase Order List) Management

**Priority:** P0 (Critical for MVP)

**Description:** System must allow creation and management of Purchase Order Lists with client details and product specifications.

**Requirements:**

**FR-001.1: Create POL**
- System shall allow Manager to create new POL with the following fields:
  - PO_Number (auto-generated or manual entry)
  - Client Name (dropdown from existing clients or new entry)
  - Total Order (calculated from POL Details)
  - PO_Date (default to current date, editable)
  - Delivery Date (required field)
  - Status (dropdown: Draft, In Progress, Completed, Cancelled)

**FR-001.2: Add POL Details**
- System shall allow Manager to add multiple products to POL with the following fields:
  - Product_Code (lookup from gayafusionall → tblcollect_master)
  - Product_Name (auto-populated from Product_Code)
  - Color (lookup from gayafusionall)
  - Texture (lookup from gayafusionall)
  - Material (auto-populated from gayafusionall)
  - Size (lookup from gayafusionall)
  - Final Size (auto-populated from gayafusionall)
  - Order_Quantity (required, positive integer)
  - Extra_Quantity_Buffer (default 15%, editable based on size, quantity, difficulty)

**FR-001.3: Material Requirement Calculation**
- System shall automatically calculate and display material requirements from gayafusionall database when POL Detail is generated:
  - Clay type and quantity
  - Glazes required
  - Engobes required
  - Lusters required
  - Stains/Oxides required

**FR-001.4: Tool Requirement Extraction**
- System shall automatically extract and display tool requirements from gayafusionall database:
  - Casting tools
  - Extruders tools
  - Textures tools
  - General tools

**FR-001.5: Build Notes Display**
- System shall automatically extract and display build notes from gayafusionall database for each product

**FR-001.6: POL Status Management**
- System shall allow Manager to update POL status
- System shall prevent status changes that violate business rules (e.g., cannot move to Completed if all stages not tracked)

**FR-001.7: POL Search and Filter**
- System shall allow searching POLs by:
  - PO_Number
  - Client Name
  - Date Range
  - Status
- System shall allow filtering POLs by status and date range

**Acceptance Criteria:**
- Manager can create POL with all required fields
- Manager can add multiple POL Details with product lookup
- Material requirements are automatically calculated and displayed
- Tool requirements are automatically extracted and displayed
- Build notes are automatically extracted and displayed
- POL status can be updated according to business rules
- POLs can be searched and filtered

---

### FR-002: Multi-Stage Production Tracking

**Priority:** P0 (Critical for MVP)

**Description:** System must track production quantities through all stages of ceramic production with support for main parts and additional parts.

**Requirements:**

**FR-002.1: Forming Stage Tracking**
- System shall track quantities through forming sub-stages:
  - Throwing (for plain and decor products)
  - Trimming (for plain and decor products)
  - Decoration (for decor, hand-built, and slab/tray products)
  - Drying
  - Load Bisque

**FR-002.2: Product Type Workflow Support**
- System shall support different workflows based on product type:
  - Plain products: Throwing → Trimming → Drying → Load Bisque
  - Decor products: Throwing → Trimming → Decor → Drying → Load Bisque
  - Hand-built products: Decor → Drying → Load Bisque (no throwing/trimming)
  - Slab/Tray products: Decor → Drying → Load Bisque (no throwing/trimming)

**FR-002.3: Main Parts and Additional Parts Tracking**
- System shall allow tracking of main parts and additional parts separately during forming:
  - Example: Teapot = main body + spout + handle + lid
  - Each part tracked independently during forming
  - Parts combine into final product after decoration and drying

**FR-002.4: Firing Stage Tracking**
- System shall track quantities through firing sub-stages:
  - Load Bisque (from forming)
  - Out Bisque
  - Load High Firing
  - Out High Firing
  - Load Raku Firing (optional, based on product)
  - Out Raku Firing (optional, based on product)
  - Load Luster Firing (optional, based on product)
  - Out Luster Firing (optional, based on product)

**FR-002.5: Glazing Stage Tracking**
- System shall track quantities through glazing sub-stages:
  - Sanding
  - Waxing
  - Dipping
  - Spraying
  - Color Decoration

**FR-002.6: QC Stage Tracking**
- System shall track quantities through QC sub-stages:
  - Good (accepted products)
  - Reject (rejected products)
  - Re-firing (products requiring additional firing)
  - Second (products requiring additional processing)

**FR-002.7: Remake Tracking**
- System shall track remake cycles:
  - Remake 1, Remake 2, Remake 3, etc.
  - Maximum remake limit (configurable, default 3)
  - Alert when maximum remake limit reached

**FR-002.8: Stage Transition Validation**
- System shall validate quantities before allowing stage transition:
  - Current stage quantity cannot exceed previous stage quantity
  - Reject quantities must be accounted for
  - Remake quantities must be tracked separately

**FR-002.9: Quantity Entry Interface**
- System shall provide simple interface for Admin to enter quantities at each stage:
  - Input field for quantity
  - Optional reject quantity field
  - Optional notes field
  - Submit button with validation

**Acceptance Criteria:**
- Admin can enter quantities at each production stage
- System supports different workflows for different product types
- System tracks main parts and additional parts separately
- System validates quantities before stage transitions
- System tracks remake cycles
- System alerts when maximum remake limit reached

---

### FR-003: Dynamic Decoration Task Management

**Priority:** P0 (Critical for MVP)

**Description:** System must handle highly variable decoration tasks that depend on design and product uniqueness.

**Requirements:**

**FR-003.1: Decoration Task Types**
- System shall support any decoration task type including but not limited to:
  - Carving
  - Engraving
  - Engobe Polishing
  - Air Pen
  - Sketch
  - Massage Texture
  - Line Texture
  - Handle Installation
  - Spout Installation
  - Plate Lip Cutting
  - Custom tasks (user-defined)

**FR-003.2: Dynamic Task Creation**
- System shall allow Admin to create custom decoration tasks on-the-fly
- System shall allow Admin to specify task name, description, and quantity for each custom task

**FR-003.3: Task Tracking**
- System shall track quantities for each decoration task:
  - Tasks to be completed
  - Tasks completed
  - Tasks rejected

**FR-003.4: Task Dependencies**
- System shall allow specification of task dependencies (optional):
  - Task B cannot start until Task A is complete
  - System enforces dependencies when tracking progress

**FR-003.5: Task Notes**
- System shall allow Admin to add notes for each decoration task
- Notes can include problem descriptions, solutions, or other relevant information

**Acceptance Criteria:**
- Admin can create custom decoration tasks
- System tracks quantities for each decoration task
- System enforces task dependencies when specified
- Admin can add notes for each decoration task

---

### FR-004: Discrepancy Alerts

**Priority:** P0 (Critical for MVP)

**Description:** System must automatically detect and alert on quantity discrepancies and production risks.

**Requirements:**

**FR-004.1: Quantity Discrepancy Detection**
- System shall automatically detect quantity discrepancies:
  - Example: "trimming: 52 but forming was only 50"
  - Example: "loading biscuits: 49 but out biscuits: 51"
  - System blocks progress until discrepancy is resolved

**FR-004.2: Discrepancy Alert Display**
- System shall display discrepancy alerts via:
  - Alert Message/Popup Window
  - Dashboard alert banner
  - Email notification (optional, v2.0)

**FR-004.3: Remake Required Alert**
- System shall alert when order quantity ≤ order quantity (remake required due to total rejections)

**FR-004.4: Maximum Remake Limit Alert**
- System shall alert when maximum remake limit is reached (default 3 remakes)
- Alert shall indicate that manual intervention is required

**FR-004.5: Delivery Risk Alert**
- System shall alert when delivery date is at risk:
  - Calculate estimated completion date based on current progress
  - Alert if estimated completion date > delivery date
  - Alert if delivery date is within configurable threshold (default 3 days) and production not complete

**FR-004.6: Alert Priority Levels**
- System shall support alert priority levels:
  - Critical (blocks progress, requires immediate action)
  - Warning (does not block progress, requires attention)
  - Informational (for awareness only)

**FR-004.7: Alert Acknowledgment**
- System shall require acknowledgment for critical alerts
- System shall log alert acknowledgment with user and timestamp

**FR-004.8: Alert History**
- System shall maintain history of all alerts
- History includes alert type, timestamp, user, resolution, and notes

**Acceptance Criteria:**
- System automatically detects quantity discrepancies
- System displays alerts via popup and dashboard
- System alerts when remake is required
- System alerts when maximum remake limit reached
- System alerts when delivery date is at risk
- System supports alert priority levels
- System requires acknowledgment for critical alerts
- System maintains alert history

---

### FR-005: Reporting and Analytics

**Priority:** P1 (Important for MVP)

**Description:** System must provide reporting capabilities for production analysis and visibility.

**Requirements:**

**FR-005.1: POL Order Summary**
- System shall generate POL order summary for completed production:
  - POL Number
  - Client Name
  - Products ordered
  - Quantities ordered vs completed
  - Delivery date vs actual delivery date
  - Status

**FR-005.2: Forming Analysis Report**
- System shall generate forming analysis report:
  - How many items made at each forming stage
  - How many remakes
  - What problems encountered
  - Reject quantities and reasons
  - Photo report of rejects/issues (v2.0)

**FR-005.3: QC Analysis Report**
- System shall generate QC analysis report:
  - How many good items
  - How many rejects
  - How many re-firings
  - Reject reasons and trends

**FR-005.4: Process Stage Tracking Report**
- System shall generate process stage tracking report with filters:
  - By Client
  - By Product
  - By Remake
  - By Reject
  - By Date Range

**FR-005.5: Real-Time Production Progress Tracking**
- System shall provide real-time production progress tracking:
  - Current stage for each POL
  - Percentage complete
  - Estimated completion date
  - Urgent focus: process & remake tracking for on-time delivery

**FR-005.6: Report Export**
- System shall allow exporting reports in:
  - PDF format
  - Excel format
  - CSV format

**FR-005.7: Report Scheduling**
- System shall allow scheduling of automated reports (v2.0):
  - Daily summary reports
  - Weekly production reports
  - Monthly performance reports

**Acceptance Criteria:**
- System generates POL order summary
- System generates forming analysis report
- System generates QC analysis report
- System generates process stage tracking report with filters
- System provides real-time production progress tracking
- System allows report export in multiple formats

---

### FR-006: Logbook Management

**Priority:** P1 (Important for MVP)

**Description:** System must provide logbook functionality for recording production issues and important events.

**Requirements:**

**FR-006.1: Logbook Entry Creation**
- System shall allow Admin to create logbook entries with:
  - Date and time (auto-populated, editable)
  - Production stage (dropdown)
  - Product (lookup)
  - POL (lookup)
  - Issue type (dropdown: Material Issue, Tool Issue, Process Issue, Quality Issue, Other)
  - Description (required text field)
  - Severity (dropdown: Low, Medium, High, Critical)
  - Resolution (optional text field)
  - Status (dropdown: Open, In Progress, Resolved)

**FR-006.2: Logbook Search and Filter**
- System shall allow searching and filtering logbook entries by:
  - Date range
  - Production stage
  - Product
  - POL
  - Issue type
  - Severity
  - Status

**FR-006.3: Logbook History**
- System shall maintain complete history of logbook entries
- System shall allow viewing historical entries for anticipating problems when reordering

**FR-006.4: Logbook Export**
- System shall allow exporting logbook entries in:
  - PDF format
  - Excel format
  - CSV format

**Acceptance Criteria:**
- Admin can create logbook entries with all required fields
- System allows searching and filtering logbook entries
- System maintains complete history of logbook entries
- System allows exporting logbook entries

---

### FR-007: Revision Ticket Management

**Priority:** P1 (Important for MVP)

**Description:** System must provide revision ticket functionality for tracking product changes during production.

**Requirements:**

**FR-007.1: Revision Ticket Creation**
- System shall allow Manager to create revision tickets with:
  - Ticket Number (auto-generated)
  - POL (lookup)
  - Product (lookup)
  - Revision type (dropdown: Design Change, Material Change, Process Change, Other)
  - Description (required text field)
  - Reason (required text field)
  - Impact assessment (optional text field)
  - Status (dropdown: Draft, Submitted, Approved, Rejected, Implemented)
  - Created by (auto-populated)
  - Created date (auto-populated)

**FR-007.2: Revision Ticket Workflow**
- System shall support revision ticket workflow:
  - Draft → Submitted → Approved/Rejected → Implemented
  - System enforces workflow transitions
  - System records approver and approval date

**FR-007.3: Revision Ticket Linking**
- System shall allow linking revision tickets to:
  - Specific POL
  - Specific product
  - Specific production stage

**FR-007.4: Revision History**
- System shall maintain complete revision history for reference
- History includes all changes, approvals, and implementation notes

**FR-007.5: Revision Ticket Search and Filter**
- System shall allow searching and filtering revision tickets by:
  - Ticket Number
  - POL
  - Product
  - Revision type
  - Status
  - Date range

**Acceptance Criteria:**
- Manager can create revision tickets with all required fields
- System supports revision ticket workflow
- System allows linking revision tickets to POL, product, and stage
- System maintains complete revision history
- System allows searching and filtering revision tickets

---

### FR-008: User Authentication and Authorization

**Priority:** P0 (Critical for MVP)

**Description:** System must provide secure user authentication and role-based authorization.

**Requirements:**

**FR-008.1: User Registration**
- System shall allow admin users to create new user accounts with:
  - Username (unique)
  - Email address (unique)
  - Password (minimum 8 characters, complexity requirements)
  - Full name
  - Role (dropdown: Manager, Admin)

**FR-008.2: User Login**
- System shall allow users to login with username/email and password
- System shall implement session management
- System shall implement automatic session timeout (configurable, default 30 minutes)

**FR-008.3: Password Recovery**
- System shall allow password recovery via email
- System shall implement secure password reset token mechanism

**FR-008.4: Role-Based Access Control**
- System shall implement role-based access control:
  - Manager: Full access to all features
  - Admin: Access to data entry and reporting only
  - Public: Access to tracking page only (v2.0)

**FR-008.5: User Profile Management**
- System shall allow users to update their profile:
  - Full name
  - Email address
  - Password

**FR-008.6: User Activity Logging**
- System shall log all user activities:
  - Login/logout
  - Data entry
  - Status changes
  - Report generation

**Acceptance Criteria:**
- Admin can create new user accounts
- Users can login with username/email and password
- System implements session management and timeout
- System allows password recovery via email
- System implements role-based access control
- Users can update their profile
- System logs all user activities

---

## Non-Functional Requirements

### NFR-001: Performance

**Priority:** P0 (Critical for MVP)

**Requirements:**
- System shall respond to user actions within 2 seconds for 95% of requests
- System shall support up to 50 concurrent users without performance degradation
- System shall handle database queries within 1 second for 95% of queries
- System shall load pages within 3 seconds on standard broadband connection

---

### NFR-002: Reliability

**Priority:** P0 (Critical for MVP)

**Requirements:**
- System shall have 99.5% uptime during business hours (8 AM - 6 PM, Monday - Saturday)
- System shall have 99% uptime overall
- System shall implement automatic data backup daily
- System shall implement data backup retention for 90 days
- System shall implement disaster recovery procedures with RTO (Recovery Time Objective) of 4 hours

---

### NFR-003: Scalability

**Priority:** P1 (Important for MVP)

**Requirements:**
- System shall support 2x production volume without additional headcount
- System shall support up to 10,000 POLs in database
- System shall support up to 100,000 production records in database
- System shall be architected to support horizontal scaling if needed

---

### NFR-004: Usability

**Priority:** P0 (Critical for MVP)

**Requirements:**
- System shall provide intuitive user interface requiring minimal training
- System shall provide mobile-responsive design for Admin users
- System shall provide clear error messages and validation feedback
- System shall provide help documentation and tooltips
- System shall be accessible to users with basic computer skills

---

### NFR-005: Maintainability

**Priority:** P1 (Important for MVP)

**Requirements:**
- System shall be built with modular architecture
- System shall follow coding standards and best practices
- System shall include comprehensive code comments
- System shall implement automated testing with minimum 80% code coverage
- System shall implement logging for debugging and monitoring

---

### NFR-006: Compatibility

**Priority:** P1 (Important for MVP)

**Requirements:**
- System shall support modern web browsers:
  - Google Chrome (latest 2 versions)
  - Mozilla Firefox (latest 2 versions)
  - Microsoft Edge (latest 2 versions)
  - Safari (latest 2 versions)
- System shall support mobile devices:
  - iOS (iOS 12+)
  - Android (Android 8.0+)

---

## Technical Requirements

### TR-001: Technology Stack

**Priority:** P0 (Critical for MVP)

**Requirements:**

**Frontend:**
- Framework: React.js or Vue.js (to be determined)
- UI Library: Material-UI or similar
- State Management: Redux or Vuex
- Build Tool: Webpack or Vite

**Backend:**
- Framework: Node.js with Express or Python with Django/Flask (to be determined)
- API: RESTful API
- Authentication: JWT (JSON Web Tokens)

**Database:**
- PostgreSQL for production tracking data
- MySQL integration with existing gayafusionall database (read-only access)

**Infrastructure:**
- Hosting: Cloud-based (AWS, Google Cloud, or Azure)
- Containerization: Docker
- Reverse Proxy: Nginx

---

### TR-002: Database Design

**Priority:** P0 (Critical for MVP)

**Requirements:**

**PostgreSQL Tables:**
- users
- pols (Purchase Order Lists)
- pol_details
- production_stages
- production_records
- decoration_tasks
- discrepancy_alerts
- logbook_entries
- revision_tickets
- user_activity_logs

**MySQL Integration:**
- Read-only access to gayafusionall database
- Tables accessed:
  - tblcollect_master (product catalog)
  - Other relevant tables for material and tool data

---

### TR-003: API Design

**Priority:** P0 (Critical for MVP)

**Requirements:**

**API Endpoints:**
- Authentication: /api/auth/*
- POL Management: /api/pols/*
- Production Tracking: /api/production/*
- Decoration Tasks: /api/decorations/*
- Alerts: /api/alerts/*
- Reports: /api/reports/*
- Logbook: /api/logbook/*
- Revision Tickets: /api/revisions/*

**API Standards:**
- RESTful design principles
- JSON request/response format
- Proper HTTP status codes
- API versioning (/api/v1/*)
- Rate limiting (to be configured)
- API documentation (Swagger/OpenAPI)

---

### TR-004: Security

**Priority:** P0 (Critical for MVP)

**Requirements:**

**Authentication:**
- JWT-based authentication
- Secure password storage (bcrypt or similar)
- Session management with timeout

**Authorization:**
- Role-based access control (RBAC)
- API endpoint authorization
- Data access control based on user role

**Data Protection:**
- Input validation and sanitization
- SQL injection prevention
- XSS (Cross-Site Scripting) prevention
- CSRF (Cross-Site Request Forgery) protection
- HTTPS/TLS encryption for all communications

**Audit Logging:**
- Log all user activities
- Log all data changes
- Log all system events
- Log retention for 90 days

---

## User Interface Requirements

### UIR-001: Design Principles

**Priority:** P0 (Critical for MVP)

**Requirements:**
- Clean, modern, and professional design
- Consistent color scheme and typography
- Mobile-responsive design
- Accessibility compliance (WCAG 2.1 Level AA)
- Intuitive navigation and user flow

---

### UIR-002: Dashboard

**Priority:** P0 (Critical for MVP)

**Requirements:**
- Manager dashboard with:
  - POL summary (total, in progress, completed)
  - Production progress overview
  - Active alerts
  - Upcoming delivery dates at risk
  - Quick actions (create POL, view reports)

- Admin dashboard with:
  - Today's tasks
  - Active POLs requiring data entry
  - Recent alerts
  - Quick data entry links

---

### UIR-003: POL Management Interface

**Priority:** P0 (Critical for MVP)

**Requirements:**
- POL list view with search and filters
- POL detail view with:
  - POL information
  - POL details list
  - Material requirements
  - Tool requirements
  - Build notes
  - Production progress
- POL creation/edit form with validation
- Product lookup from gayafusionall database

---

### UIR-004: Production Tracking Interface

**Priority:** P0 (Critical for MVP)

**Requirements:**
- Stage-based tracking interface
- Quantity entry forms with validation
- Real-time discrepancy alerts
- Progress visualization (progress bar or timeline)
- Reject and remake tracking
- Notes and problem documentation

---

### UIR-005: Alert System Interface

**Priority:** P0 (Critical for MVP)

**Requirements:**
- Alert popup window for critical alerts
- Dashboard alert banner for all alerts
- Alert list view with filters
- Alert detail view with resolution tracking
- Alert acknowledgment mechanism

---

### UIR-006: Reporting Interface

**Priority:** P1 (Important for MVP)

**Requirements:**
- Report generation form with filters
- Report preview
- Report export options (PDF, Excel, CSV)
- Report scheduling interface (v2.0)

---

## Data Requirements

### DR-001: Data Entities

**Priority:** P0 (Critical for MVP)

**Requirements:**

**User Entity:**
- user_id (primary key)
- username (unique)
- email (unique)
- password_hash
- full_name
- role (Manager, Admin)
- created_at
- updated_at
- last_login

**POL Entity:**
- pol_id (primary key)
- po_number (unique)
- client_name
- total_order
- po_date
- delivery_date
- status (Draft, In Progress, Completed, Cancelled)
- created_by (foreign key to users)
- created_at
- updated_at

**POL Detail Entity:**
- pol_detail_id (primary key)
- pol_id (foreign key)
- product_code
- product_name
- color
- texture
- material
- size
- final_size
- order_quantity
- extra_quantity_buffer
- created_at
- updated_at

**Production Record Entity:**
- record_id (primary key)
- pol_detail_id (foreign key)
- production_stage
- quantity
- reject_quantity
- remake_cycle
- notes
- created_by (foreign key to users)
- created_at
- updated_at

**Decoration Task Entity:**
- task_id (primary key)
- pol_detail_id (foreign key)
- task_name
- task_description
- quantity_required
- quantity_completed
- quantity_rejected
- status
- notes
- created_at
- updated_at

**Discrepancy Alert Entity:**
- alert_id (primary key)
- pol_detail_id (foreign key)
- alert_type
- alert_message
- priority (Critical, Warning, Informational)
- status (Open, Acknowledged, Resolved)
- acknowledged_by (foreign key to users)
- acknowledged_at
- resolved_by (foreign key to users)
- resolved_at
- resolution_notes
- created_at
- updated_at

**Logbook Entry Entity:**
- entry_id (primary key)
- pol_id (foreign key, optional)
- pol_detail_id (foreign key, optional)
- production_stage
- issue_type
- description
- severity (Low, Medium, High, Critical)
- resolution
- status (Open, In Progress, Resolved)
- created_by (foreign key to users)
- created_at
- updated_at

**Revision Ticket Entity:**
- ticket_id (primary key)
- ticket_number (unique)
- pol_id (foreign key)
- pol_detail_id (foreign key)
- revision_type
- description
- reason
- impact_assessment
- status (Draft, Submitted, Approved, Rejected, Implemented)
- created_by (foreign key to users)
- approved_by (foreign key to users, optional)
- approved_at (optional)
- created_at
- updated_at

**User Activity Log Entity:**
- log_id (primary key)
- user_id (foreign key)
- action
- entity_type
- entity_id
- details
- ip_address
- user_agent
- created_at

---

### DR-002: Data Validation

**Priority:** P0 (Critical for MVP)

**Requirements:**
- All required fields must be validated before submission
- Quantity fields must be positive integers
- Date fields must be valid dates
- Email fields must be valid email format
- Unique constraints must be enforced (username, email, po_number, ticket_number)
- Foreign key constraints must be enforced
- Business rule validation (e.g., stage quantity cannot exceed previous stage quantity)

---

### DR-003: Data Backup and Recovery

**Priority:** P0 (Critical for MVP)

**Requirements:**
- Automated daily database backups
- Backup retention for 90 days
- Off-site backup storage
- Regular backup restoration testing
- Disaster recovery procedures documented and tested

---

## Integration Requirements

### IR-001: Gayafusionall MySQL Database Integration

**Priority:** P0 (Critical for MVP)

**Requirements:**
- Read-only access to gayafusionall database
- Integration with tblcollect_master for product catalog
- Integration with relevant tables for material and tool data
- Real-time data synchronization or periodic refresh (to be determined)
- Error handling for database connection failures

---

### IR-002: Future Integrations (v2.0+)

**Priority:** P2 (Deferred)

**Requirements:**
- Email notification service
- SMS notification service
- Inventory management system
- Supplier portal
- Payment processing system
- Analytics platform

---

## Security Requirements

### SR-001: Authentication

**Priority:** P0 (Critical for MVP)

**Requirements:**
- Secure login with username/email and password
- JWT-based session management
- Automatic session timeout (configurable, default 30 minutes)
- Password complexity requirements (minimum 8 characters, uppercase, lowercase, number, special character)
- Password expiration policy (optional, to be configured)
- Multi-factor authentication (optional, v2.0)

---

### SR-002: Authorization

**Priority:** P0 (Critical for MVP)

**Requirements:**
- Role-based access control (RBAC)
- Manager role: Full access to all features
- Admin role: Access to data entry and reporting only
- Public role: Access to tracking page only (v2.0)
- API endpoint authorization
- Data access control based on user role

---

### SR-003: Data Protection

**Priority:** P0 (Critical for MVP)

**Requirements:**
- Input validation and sanitization
- SQL injection prevention
- XSS (Cross-Site Scripting) prevention
- CSRF (Cross-Site Request Forgery) protection
- HTTPS/TLS encryption for all communications
- Secure password storage (bcrypt or similar)
- Sensitive data encryption at rest (optional, to be evaluated)

---

### SR-004: Audit Logging

**Priority:** P0 (Critical for MVP)

**Requirements:**
- Log all user activities (login/logout, data entry, status changes, report generation)
- Log all data changes (create, update, delete)
- Log all system events (errors, warnings, alerts)
- Log retention for 90 days
- Audit log export capability

---

## Performance Requirements

### PR-001: Response Time

**Priority:** P0 (Critical for MVP)

**Requirements:**
- Page load time: < 3 seconds on standard broadband connection
- API response time: < 2 seconds for 95% of requests
- Database query time: < 1 second for 95% of queries
- Alert generation: < 1 second after data entry

---

### PR-002: Throughput

**Priority:** P1 (Important for MVP)

**Requirements:**
- Support up to 50 concurrent users
- Support up to 1000 data entries per hour
- Support up to 100 report generations per day

---

### PR-003: Scalability

**Priority:** P1 (Important for MVP)

**Requirements:**
- Support 2x production volume without additional headcount
- Support up to 10,000 POLs in database
- Support up to 100,000 production records in database
- Horizontal scaling capability if needed

---

## Testing Requirements

### TR-001: Unit Testing

**Priority:** P0 (Critical for MVP)

**Requirements:**
- Minimum 80% code coverage
- Test all business logic
- Test all data validation
- Test all utility functions

---

### TR-002: Integration Testing

**Priority:** P0 (Critical for MVP)

**Requirements:**
- Test all API endpoints
- Test database operations
- Test gayafusionall integration
- Test authentication and authorization

---

### TR-003: End-to-End Testing

**Priority:** P1 (Important for MVP)

**Requirements:**
- Test critical user workflows:
  - POL creation and management
  - Production tracking through all stages
  - Discrepancy alert generation and resolution
  - Report generation
- Test cross-browser compatibility
- Test mobile responsiveness

---

### TR-004: Performance Testing

**Priority:** P2 (Optional for MVP)

**Requirements:**
- Load testing with 50 concurrent users
- Stress testing to identify breaking points
- Performance optimization based on test results

---

### TR-005: Security Testing

**Priority:** P1 (Important for MVP)

**Requirements:**
- Penetration testing
- Vulnerability scanning
- Security code review

---

## Deployment Requirements

### DR-001: Deployment Environment

**Priority:** P0 (Critical for MVP)

**Requirements:**
- Cloud-based hosting (AWS, Google Cloud, or Azure)
- Production environment
- Staging environment for testing
- Development environment for development

---

### DR-002: Deployment Process

**Priority:** P0 (Critical for MVP)

**Requirements:**
- Automated deployment pipeline (CI/CD)
- Database migration scripts
- Configuration management
- Rollback procedures

---

### DR-003: Monitoring and Logging

**Priority:** P0 (Critical for MVP)

**Requirements:**
- Application performance monitoring
- Error logging and alerting
- Uptime monitoring
- Resource usage monitoring

---

### DR-004: Backup and Disaster Recovery

**Priority:** P0 (Critical for MVP)

**Requirements:**
- Automated daily backups
- Off-site backup storage
- Disaster recovery procedures
- Regular backup restoration testing

---

## MVP Scope

### Included in MVP

**Core Features:**
1. POL (Purchase Order List) Management
2. Multi-Stage Production Tracking
3. Dynamic Decoration Task Management
4. Discrepancy Alerts
5. Basic Reporting
6. Logbook Management
7. Revision Ticket Management
8. User Authentication and Authorization

**Technical Requirements:**
- Frontend: Responsive web application
- Backend: RESTful API
- Database: PostgreSQL + MySQL integration
- Hosting: Cloud-based
- Security: Authentication, authorization, data protection

**User Roles:**
- Manager (full access)
- Admin (data entry and reporting)

---

### Excluded from MVP

**Features Deferred to v2.0:**
1. Public tracking page for clients/stakeholders
2. Advanced analytics dashboards
3. Mobile native app (iOS/Android)
4. Photo upload for rejects/issues
5. Automated email/SMS notifications
6. Report scheduling
7. Multi-factor authentication
8. External system integrations (inventory, supplier portal, payment processing)

**Rationale:**
- Focus on core production tracking functionality first
- Validate data accuracy and workflow effectiveness before adding visibility features
- Ensure MVP is achievable with available resources and timeline
- Learn from internal user feedback before expanding to external stakeholders

---

### MVP Success Criteria

**Adoption Metrics:**
- Manager adoption: 100% of POLs created through system within 3 months
- Admin adoption: Daily data entry across all production stages
- Logbook usage: 90%+ of production issues logged in Logbook
- Revision tracking: 100% of production revisions captured in Revision Tickets

**Quality Metrics:**
- Data accuracy: <5% discrepancy rate requiring manual correction
- Alert effectiveness: 90%+ of delivery risks caught and addressed before impact

**Business Impact Metrics:**
- On-time delivery improvement: 15%+ improvement in on-time delivery rate
- Time saved: 2+ hours/day saved on manual tracking and verification

**User Feedback:**
- Positive feedback on ease of use and effectiveness
- User satisfaction score > 4/5

---

### Decision Point for Scaling Beyond MVP

**Proceed to v2.0 Development If:**
- All success criteria met within 6 months
- User adoption targets achieved
- Data accuracy targets met
- Positive user feedback received

**Refine Core Tracking Before Expansion If:**
- Data accuracy targets not met
- User adoption below target
- Negative user feedback on core functionality

**Improve UX and Training Before Expansion If:**
- User adoption below target due to usability issues
- Users require additional training
- Interface improvements needed

---

## Future Roadmap

### v2.0 Enhancements (6-12 months after MVP)

**Public Tracking:**
- Public tracking page for clients and stakeholders
- QR code generation for easy access
- Email notifications with tracking links

**Advanced Analytics:**
- Advanced analytics dashboards with customizable views
- Production trend analysis
- Performance benchmarking
- Predictive analytics for delivery risk forecasting

**Enhanced Features:**
- Photo upload and management for rejects/issues
- Automated email/SMS notifications for alerts
- Report scheduling and automation
- Multi-factor authentication

**Mobile:**
- Mobile native app for iOS and Android
- Push notifications for alerts
- Offline data entry capability

---

### v3.0+ Capabilities (12-24 months after MVP)

**AI and Machine Learning:**
- AI-powered production optimization recommendations
- Predictive analytics for delivery risk forecasting
- Automated anomaly detection
- Smart scheduling and resource allocation

**Extended Integrations:**
- Integration with inventory management systems
- Supplier portal for material ordering
- Payment processing integration
- Accounting system integration

**Platform Expansion:**
- Multi-location support for production facilities
- White-label solution for ceramic production tracking
- SaaS offering for other ceramic studios
- Industry benchmarks and best practices sharing

---

## Success Metrics

### Manager Success Metrics

**Leading Indicators:**
- Daily active users: Number of unique managers using system daily
- Alert response time: Average time from alert generation to resolution
- POL creation rate: Number of POLs created per week
- Data entry completeness: Percentage of required fields completed per entry

**Lagging Indicators:**
- On-time delivery rate: Percentage of orders delivered on/before target date (Target: 95%)
- Data discrepancy rate: Percentage of entries requiring manual correction (Target: <5%)
- Time saved: Hours saved per day on manual tracking and verification (Target: 2+ hours/day)
- Alert effectiveness: Percentage of delivery risks caught and addressed before impact (Target: 90%+)

---

### Admin User Success Metrics

**Leading Indicators:**
- Data entry speed: Number of items entered per shift using mobile interface (Target: 50+ items/shift)
- Daily active users: Number of unique admins using system daily
- Data entry completeness: Percentage of required fields completed per entry

**Lagging Indicators:**
- Alert accuracy: Percentage of quantity discrepancies caught automatically (Target: 100%)
- Error reduction: Percentage reduction in manual recalculation needs (Target: 80%+)
- Usage frequency: Daily usage across all production stages (Target: 100%)

---

### Business Objectives

**3-Month Objectives:**
- System adoption: 100% of production team using system daily
- Process coverage: All POLs tracked through system from creation to completion
- Data accuracy: <5% discrepancy rate across all production stages

**12-Month Objectives:**
- On-time delivery improvement: 20%+ improvement in on-time delivery rate
- Efficiency gains: 40%+ reduction in manual tracking time
- Cost savings: Measurable reduction in overtime and rework costs
- Client satisfaction: 90%+ client satisfaction with order visibility (v2.0)

**Strategic Impact:**
- Modernization: Complete replacement of 20-year-old legacy system
- Scalability: System supports 2x production volume without additional headcount
- Competitive advantage: Industry-leading ceramic production tracking capability

---

### Financial Metrics

**Cost Savings:**
- Cost per POL: Reduction in administrative cost per order
- Rework cost: Reduction in remake and refiring costs due to early detection
- Overtime reduction: Hours saved in manual tracking and verification

**ROI:**
- Return on investment calculation based on cost savings vs development and maintenance costs
- Target ROI: Positive within 12 months

---

## Appendix

### A. Glossary

- **POL:** Purchase Order List - A list of products ordered by a client
- **QC:** Quality Control - The process of inspecting and testing products
- **Raku Firing:** A type of ceramic firing technique
- **Luster Firing:** A type of ceramic firing technique for applying metallic lusters
- **Bisque Firing:** The first firing of ceramic pieces to harden them
- **High Firing:** The second firing of ceramic pieces at higher temperatures
- **Engobe:** A colored slip applied to ceramic pieces before firing
- **Gayafusionall:** The existing MySQL database containing 20+ years of product data

---

### B. References

- Product Brief: ProdGantiNew (2026-01-31)
- Gayafusionall Database Schema
- Ceramic Production Best Practices

---

### C. Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-31 | Madegun | Initial PRD creation |

---

**Document Status:** Draft
**Next Review Date:** TBD
**Approved By:** TBD
**Approval Date:** TBD
