---
stepsCompleted: [1, 2, 3, 4, 5]
inputDocuments: []
date: 2026-01-31
author: Madegun
---

# Product Brief: ProdGantiNew

<!-- Content will be appended sequentially through collaborative workflow steps -->

## Executive Summary

ProdGantiNew is a web application designed to manage and track the production process of handcrafted ceramic art. The system addresses critical challenges faced by production managers: ensuring all necessary raw materials and tools are available before production, managing and tracking complex multi-stage ceramic production process from start to finish, and ensuring delivery targets are met through system alerts for production reductions due to damage, defects, and other issues.

The solution integrates with an existing MySQL-based product database (gayafusionall) while leveraging PostgreSQL for new production tracking functionality. The key differentiator is dynamic decoration task management combined with multi-stage quantity tracking and discrepancy alerts, ensuring data accuracy from A-Z throughout the production pipeline.

---

## Core Vision

### Problem Statement

Production managers in handcrafted ceramic art face significant operational challenges:

1. **Material & Tool Availability**: Ensuring all necessary raw materials (clay, glazes, engobes, lusters, stains/oxides) and tools (casting, extruders, textures, general tools) are available before production begins.

2. **Complex Production Tracking**: Managing and tracking ceramic production process from start to finish through multiple stages:
   - Forming (Throwing, Trimming, Handbuild, Slab, Decoration)
   - Firing (Bisque Firing, High Firing, Raku Firing, Luster Firing)
   - Glazing (Sanding, Waxing, Dipping, Spraying, Color Decoration)
   - Remake tracking

3. **Delivery Target Management**: Ensuring delivery targets are met with system alerts when production is reduced due to damage, defects, or other issues.

### Problem Impact

The current manual tracking approach has significant negative consequences:

- **Time & Resource Waste**: Manual tracking wastes time, effort, and personnel resources
- **Missed Delivery Dates**: Delivery dates are often missed, especially with low orders and remakes
- **Data Inaccuracy**: Quantities are often inaccurate due to manual processing and lack of data filters (e.g., throwing: 50, trimming: 52, loading biscuits: 49, out biscuits: 51, loading high-firing: 47, out: 48, QC: good: 40, reject: 5, refiring: 2, second: 1)
- **Field Verification**: Production managers must check and recalculate in field to ensure data is correct
- **Client Dissatisfaction**: Sometimes receive complaints because orders are late from delivery
- **Organizational Impact**: Production managers, production admin team, sales admins, and superiors all feel the impact of production delays

### Why Existing Solutions Fall Short

1. **Niche Industry**: Ceramic production workflows are too variable across different ceramic studios for mainstream software providers to address effectively
2. **Generic Manufacturing Systems**: Existing ERP and manufacturing systems are too expensive and do not understand the unique nuances of ceramic production
3. **Database Integration Gap**: No existing system integrates with the gayafusionall database structure that contains 20+ years of product data
4. **Obsolete Legacy System**: The current 20-year-old web app only handles product collections and does not provide production tracking functionality

### Proposed Solution

A modern web application for ceramic production tracking that:

**Integrates with Existing Infrastructure:**
- Looks up product data using the existing gayafusionall MySQL database
- Uses PostgreSQL for new production tracking functionality
- Leverages 20+ years of product catalog investment

**Automates Material & Tool Preparation:**
- Purchase Order List (POL) creation with PO details (PO_Number, Client Name, Total Order, PO_Date, Delivery, Status)
- POL Details with product specifications (Product_Code, Product_Name, Color, Texture, Material, Size, Final Size)
- Automatic calculation and display of material requirements from product database
- Early extraction of material, tool, glaze, firing type, and build notes when PO Detail is generated

**Provides Comprehensive Production Process Tracking:**
- **Forming Stage** with multiple product type workflows:
  - Plain products: Throwing → Trimming → Drying → Load Bisque
  - Decor products: Throwing → Trimming → Decor → Drying → Load Bisque
  - Hand-built products: Decor → Drying → Load Bisque (no throwing/trimming)
  - Slab/Tray products: Decor → Drying → Load Bisque (no throwing/trimming)
- **Dynamic Decoration Task Management**: Handles highly variable decoration tasks (carving, engraving, engobe polishing, air pen, sketch, massage texture, line texture, handle installation, spout installation, plate lip cutting, etc.)
- **Multi-Stage Quantity Tracking**: Tracks quantities at each stage with reject handling (e.g., Teapot → Throw 10, Trimming 10, Reject 1, Decor: Make 10 handles, Install 9 handles, Reject 1, Install 8 stencils, Drying 8, Load Biscuit 8, Reject 1)
- **Data Accuracy Enforcement**: System blocks and issues alerts for discrepancies to ensure data accuracy from A-Z

**Delivers Intelligent Alerts & Notifications:**
- Alert Message/Popup Window system
- 15% extra quantity buffer (dynamically editable based on size, quantity, and difficulty level)
- Warning when order quantity ≤ order quantity (remake required due to total rejections)
- Alert for multiple remakes (remake 1, 2, 3, maximum remake limit reached)
- Priority action alert when delivery date is at risk

**Provides Reporting & Visibility:**
- PO order summary for completed production
- Forming analysis: How many made? How many remakes? What problems? Photo report of rejects/issues
- QC analysis: How many good? How many rejects? How many re-firings?
- Process stage tracking by: Client, Product, Remake, Reject
- Real-time production progress tracking (urgent focus: process & remake tracking for on-time delivery)

### Key Differentiators

1. **Dynamic Decoration Task Management**: Unlike generic manufacturing systems, this solution understands that decoration tasks are highly dynamic and depend on design and product uniqueness. The system can handle any decoration task type that emerges.

2. **Multi-Stage Quantity Tracking with Discrepancy Alerts**: The system tracks quantities through every stage of ceramic production and automatically flags discrepancies (e.g., "trimming: 52 but forming was only 50"), blocking progress until data is corrected.

3. **Ceramic-Specific Workflow Understanding**: The solution is built specifically for ceramic production, understanding the unique workflows for different product types (plain, decor, hand-built, slab/tray) and the importance of firing stages, glazing processes, and quality control.

4. **Integration with Legacy Database**: Leverages the existing gayafusionall MySQL database for product data while modernizing the tracking infrastructure with PostgreSQL, preserving 20+ years of product catalog investment.

---

## Target Users

### Primary Users

**User 1: Manager**

**Name & Context:**
- Role: Oversees entire production process, creates Purchase Order Lists (POLs), manages delivery targets
- Environment: Works in office, reviews production status daily
- Motivation: Ensure on-time delivery, accurate production tracking, efficient resource management
- Goals: Eliminate manual tracking waste, catch delivery risks early, ensure data accuracy without field verification

**Problem Experience:**
- Currently uses Pepper Records to summarize spreadsheets
- Manual tracking wastes time, effort, and personnel resources
- Must check and recalculate in field to ensure data is correct
- Delivery dates often missed, especially with low orders and remakes
- Quantities are often inaccurate due to manual processing and lack of data filters (e.g., throwing: 50, trimming: 52, loading biscuits: 49, out biscuits: 51, loading high-firing: 47, out: 48, QC: good: 40, reject: 5, refiring: 2, second: 1)

**Success Vision:**
- Real-time visibility into all production stages
- Automatic alerts for production issues (discrepancies, remake limits, delivery risks)
- Accurate data without manual field verification
- Efficient resource management and on-time delivery
- "This is exactly what I needed" moment: First time they catch a delivery risk early or see accurate data without needing to verify in the field

**User 2: Admin User Input Data**

**Name & Context:**
- Role: Enters production data at each stage into the system
- Environment: Works on workshop floor, updates quantities at each production stage
- Motivation: Accurate quantity tracking, easy data entry, clear visibility of rejects/problems
- Goals: Eliminate manual data entry errors, handle complex tracking of main parts vs additional parts, receive automatic discrepancy alerts

**Problem Experience:**
- Currently tracks on spreadsheets and product worksheet data ("Workplan")
- Manual data entry is time-consuming and error-prone
- Complex tracking required for products with additional components (e.g., teapot = main body + spout + handle + lid)
- Must track both main parts and additional parts during forming because they require time to form and are part of a single unit
- After decoration and drying, parts combine into final product (tea pot + lid)
- Quantity discrepancies require manual recalculation

**Success Vision:**
- Simple mobile-friendly interface for data entry
- Automatic discrepancy alerts (e.g., "trimming: 52 but forming was only 50")
- Ability to track both main parts and additional parts during forming
- Dynamic decoration task management for complex workflows
- "This is exactly what I needed" moment: First time system catches a discrepancy automatically or saves them from manual recalculation

### Secondary Users

**User 3: Public Users (without logging in)**

**Name & Context:**
- Role: View production tracking page
- Environment: Clients or stakeholders who want to see production progress
- Motivation: Visibility into order status without needing to call or email
- Goals: Track order progress independently, see current stage and delivery date

**Problem Experience:**
- Currently must call or email to get order status updates
- Lack of visibility into production progress
- Uncertainty about delivery dates
- Frustration when orders are late without prior notice

**Success Vision:**
- Easy-to-access public tracking page (via link in order confirmation email or QR code)
- Clear view of current production stage
- Estimated delivery date
- Progress visualization
- "This is exactly what I needed" moment: First time they can track their order status without calling

### User Journey

**Manager's Journey:**

- **Discovery**: Internal system rollout with demo and training
- **Onboarding**: Create first POL, set up dashboard preferences, understand alert system
- **Core Usage**: Daily dashboard review to check production status, review alerts for discrepancies or delivery risks, view production summaries and reports, make decisions based on real-time data
- **Success Moment**: First time they catch a delivery risk early through system alert, or first time they see accurate production data without needing to verify in the field
- **Long-term**: Daily dashboard check becomes routine, automated reports replace manual spreadsheet reviews, proactive management replaces reactive problem-solving

**Admin User's Journey:**

- **Discovery**: Training session on new system with hands-on practice
- **Onboarding**: Login to system, enter first production data for a stage, learn interface and data entry process
- **Core Usage**: Mobile data entry during work shifts at each production stage (forming, firing, glazing, QC), update quantities for main parts and additional parts, respond to discrepancy alerts by correcting data, document problems/issues with photo uploads
- **Success Moment**: First time system catches a discrepancy automatically (e.g., "trimming exceeds forming quantity") and prompts correction, or first time they save significant time on data entry compared to spreadsheets
- **Long-term**: Mobile data entry becomes part of daily workflow, automatic alerts prevent data errors, dynamic decoration task management handles complex product variations

**Public Users' Journey:**

- **Discovery**: Receive link to tracking page in order confirmation email or scan QR code on invoice
- **Onboarding**: Visit tracking page, enter order number or client code, view current production status
- **Core Usage**: Check tracking page periodically (daily or weekly) to see current production stage, view progress bar or status indicators, see estimated delivery date, check for any issues or delays
- **Success Moment**: First time they can track their order status independently without needing to call or email for updates
- **Long-term**: Regular checking of tracking page becomes part of order management routine, reduced need for status inquiries, increased confidence in delivery timelines

---

## Success Metrics

**Manager Success:**
- On-time delivery rate: 95% of orders delivered on or before target date
- Data accuracy: <5% data discrepancies requiring field verification
- Time saved: 2+ hours/day saved on manual tracking and verification
- Alert effectiveness: 90%+ of delivery risks caught and addressed before impact

**Admin User Success:**
- Data entry speed: 50+ items entered per shift using mobile interface
- Alert accuracy: 100% of quantity discrepancies caught automatically
- Error reduction: 80%+ reduction in manual recalculation needs
- Usage frequency: Daily usage across all production stages

**Public User Success:**
- Call reduction: 80%+ reduction in status inquiry calls/emails
- Page visits: Weekly average visits to tracking page per active order
- Satisfaction: Zero complaints about lack of order visibility

### Business Objectives

**3-Month Objectives:**
- System adoption: 100% of production team using system daily
- Process coverage: All POLs tracked through system from creation to completion
- Data accuracy: <5% discrepancy rate across all production stages

**12-Month Objectives:**
- On-time delivery improvement: 20%+ improvement in on-time delivery rate
- Efficiency gains: 40%+ reduction in manual tracking time
- Cost savings: Measurable reduction in overtime and rework costs
- Client satisfaction: 90%+ client satisfaction with order visibility

**Strategic Impact:**
- Modernization: Complete replacement of 20-year-old legacy system
- Scalability: System supports 2x production volume without additional headcount
- Competitive advantage: Industry-leading ceramic production tracking capability

### Key Performance Indicators

**Leading Indicators (predict success):**
- Daily active users: Number of unique users entering data daily
- Alert response time: Average time from alert generation to resolution
- POL creation rate: Number of POLs created per week
- Data entry completeness: Percentage of required fields completed per entry

**Lagging Indicators (measure outcomes):**
- On-time delivery rate: Percentage of orders delivered on/before target date
- Data discrepancy rate: Percentage of entries requiring manual correction
- Client inquiry volume: Number of status inquiry calls/emails per week
- Production cycle time: Average time from POL creation to delivery

**Financial Metrics:**
- Cost per POL: Reduction in administrative cost per order
- Rework cost: Reduction in remake and refiring costs due to early detection
- Overtime reduction: Hours saved in manual tracking and verification

---

## MVP Scope

### Core Features

**1. POL (Purchase Order List) Management**
- Create POL with client details (PO_Number, Client Name, Total Order, PO_Date, Delivery, Status)
- Add POL Details with product specifications collected from gayafusionall → tblcollect_master
- Automatic material requirement calculation from gayafusionall database
- Early extraction of material, tool, glaze, firing type, and build notes

**2. Multi-Stage Production Tracking**
- Forming stage tracking (Throwing, Trimming, Decoration, Drying, Load Bisque)
- Firing stage tracking (Bisque Firing, High Firing)
- Glazing stage tracking (Sanding, Waxing, Dipping, Spraying, Color Decoration)
- QC stage tracking (Good, Reject, Re-firing)
- Support for main parts and additional parts tracking (e.g., teapot body + spout + handle + lid)
- Dynamic decoration task management

**3. Discrepancy Alerts**
- Automatic quantity discrepancy detection (e.g., "trimming exceeds forming quantity")
- Alert when order quantity ≤ order quantity (remake required)
- Alert for multiple remakes (maximum remake limit reached)
- Priority action alert when delivery date is at risk
- Alert Message/Popup Window system

**4. Basic Reporting**
- POL order summary for completed production
- Forming analysis (made, remakes, problems)
- QC analysis (good, rejects, re-firings)
- Process stage tracking by Client, Product, Remake, Reject

**5. Logbook Management**
- Record all problems and important issues during production process
- Capture issues by production stage and product
- Enable historical issue tracking for anticipating problems when reordering

**6. Revision Ticket Management**
- Create revision tickets for product changes during production process
- Track revision status and implementation
- Link revisions to specific POL and product
- Maintain revision history for reference

### Out of Scope for MVP

**Explicitly Excluded from MVP:**
- Public tracking page (deferred to v2.0)
- Advanced analytics dashboards (deferred to v2.0)
- Mobile native app (responsive web only for MVP)
- Photo upload for rejects/issues (deferred to v2.0)
- Integration with external systems (deferred to v2.0)
- Automated notifications (email/SMS) - in-app alerts only for MVP

**Rationale for Exclusions:**
- Focus on core production tracking functionality first
- Validate data accuracy and workflow effectiveness before adding visibility features
- Ensure MVP is achievable with available resources and timeline
- Learn from internal user feedback before expanding to external stakeholders

### MVP Success Criteria

**How will we know MVP is successful?**
- Manager adoption: 100% of POLs created through system within 3 months
- Admin adoption: Daily data entry across all production stages
- Data accuracy: <5% discrepancy rate requiring manual correction
- On-time delivery improvement: 15%+ improvement in on-time delivery rate
- Logbook usage: 90%+ of production issues logged in Logbook
- Revision tracking: 100% of production revisions captured in Revision Tickets
- User feedback: Positive feedback on ease of use and effectiveness

**Decision Point for Scaling Beyond MVP:**
- If all success criteria met within 6 months → Proceed to v2.0 development
- If data accuracy targets not met → Refine core tracking before adding features
- If user adoption below target → Improve UX and training before expansion

### Future Vision

**If MVP is wildly successful, what does it become in 2-3 years?**

**v2.0 Enhancements:**
- Public tracking page for clients and stakeholders
- Advanced analytics dashboards with customizable views
- Photo upload and management for rejects/issues
- Automated email/SMS notifications for alerts
- Mobile native app for iOS and Android

**v3.0+ Capabilities:**
- AI-powered production optimization recommendations
- Predictive analytics for delivery risk forecasting
- Integration with inventory management systems
- Supplier portal for material ordering
- Multi-location support for production facilities

**Platform Expansion:**
- SaaS offering for other ceramic studios
- White-label solution for ceramic production tracking
- Industry benchmarks and best practices sharing
