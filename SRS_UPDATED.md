# ProxiLink - Software Requirements Specification (UPDATED)
**Version 2.0 - Current Implementation**

---

## 1. Introduction

### 1.1 Purpose
This Software Requirements Specification (SRS) describes the current state and requirements for **ProxiLink**, a web-based platform that connects African youth, MSMEs (Micro, Small, and Medium Enterprises), and community organizations with opportunities and services around them in real time. This document serves as both a technical reference and a roadmap for future development.

**Scope:** This document describes the fully implemented system as of November 2025, highlighting both functional and non-functional requirements, system interfaces, and the current technology stack.

### 1.2 Document Conventions
**Formatting Rules:**
- **Bold text** is used for headings and important terms
- *Italics* are used when giving examples
- Requirements are numbered for clarity:
  - Functional requirements are labeled as **FR** (e.g., FR 1.1)
  - Non-functional requirements are labeled as **NFR** (e.g., NFR 2.3)

**Implementation Status Labels:**
- ✅ **Implemented** - Feature is fully functional
- ⚠️ **Partially Implemented** - Feature exists but needs enhancement
- 🔄 **Planned** - Feature scheduled for future development

**Priority Levels:**
- **High (H):** Must-have features critical for core functionality
- **Medium (M):** Important features that enhance user experience
- **Low (L):** Optional features for future enhancement

### 1.3 Intended Audience and Reading Suggestions
This SRS is written for:
- **Developers & Engineers:** To understand system architecture and implement new features
- **Project Managers:** To track progress and plan future development
- **Testers/QA Analysts:** To validate system functionality and quality
- **Marketing & Business Teams:** To align technical capabilities with user needs
- **End-Users (Youth, MSMEs, NGOs):** To understand available features and planned enhancements

**Reading Guide:**
- For a quick overview, read Sections 1, 2, and the Summary in Section 8
- Developers should focus on Sections 3, 4, 5, and 6
- Testers should pay attention to Sections 4, 5, and 7
- Business teams may find Sections 1.4, 2.2, and 8 most useful

### 1.4 Product Scope
**ProxiLink** is a real-time, location-based web application that helps youth, small businesses, vendors, and NGOs connect with opportunities nearby.

**Current Goals & Objectives:**
- ✅ Provide young people quick access to jobs, services, and learning opportunities
- ✅ Help MSMEs and vendors promote their services affordably
- ⚠️ Support NGOs and local organizations (partially implemented - event management in progress)
- ✅ Enable safe, real-time community interaction
- ✅ Facilitate vendor-user communication through messaging

**Delivered Benefits:**
- ✅ Reduces missed opportunities for youth and businesses
- ✅ Provides affordable visibility for MSMEs through proximity-based discovery
- ⚠️ Supports civic and community activities (NGO features in development)
- ✅ Enables trust through vendor profiles, ratings, and reviews

**Long-term Vision:**
ProxiLink contributes to digital empowerment of African youth, strengthens small businesses, and supports inclusive economic growth across the continent.

---

## 2. Overall Description

### 2.1 Product Perspective
**ProxiLink** is a **web-first Progressive Web App (PWA)** currently accessible via modern browsers on desktop and mobile devices. The platform is built on a serverless architecture using Supabase for backend services.

**System Architecture:**
- **Frontend:** React 18.3.1 with TypeScript, Vite 5.4.19 dev server
- **Backend:** Supabase (PostgreSQL database + serverless Edge Functions)
- **Authentication:** Supabase Auth with email, phone, and Google OAuth
- **Real-time:** Supabase Realtime for live notifications and messaging
- **Maps:** Google Maps API via @react-google-maps/api
- **UI Framework:** Tailwind CSS with Radix UI components
- **Hosting:** Vercel (recommended) or similar cloud platforms

**System Context:**
ProxiLink operates as a standalone platform but integrates with:
- Google Maps API for geolocation and mapping
- Web Push API for browser notifications
- Supabase Realtime for live updates
- *Future:* Payment gateways (Paystack/Flutterwave)
- *Future:* Email service (SendGrid/AWS SES)

### 2.2 Product Functions
**Core Capabilities (Current Implementation):**

✅ **User Management**
- Multi-role registration and authentication (user, vendor, NGO, admin)
- Secure login with password strength validation and visibility toggles
- Profile management with geolocation tracking
- Role-based access control (RBAC) with Row Level Security (RLS)

✅ **Location Services**
- Real-time geolocation tracking via browser GPS
- Proximity detection within configurable radius (default: 5km)
- Google Maps integration with animated vendor markers
- Nearby service provider discovery

✅ **Vendor Services**
- Vendor profile creation with business information, categories, and location
- Service listing creation and management
- Service status toggle (active/inactive)
- Public vendor profile pages with tabs (Services, About, Reviews)
- Vendor settings page for profile editing

✅ **User Features**
- Browse services by category and proximity
- View service details with vendor information
- Click vendor names to view full profiles
- Navigate to nearby service providers from notifications
- Access comprehensive profile settings (password, privacy, notifications, account deletion)

✅ **Notifications**
- Welcome notification on login
- Special offer notification after 50 seconds
- Real-time notifications via Supabase Realtime
- Custom notification center with mark-as-read functionality
- Browser push notifications support

⚠️ **Messaging** (Partially Implemented)
- In-app messaging interface with conversation threading
- Real-time message updates
- Typing indicators and read receipts
- Demo mode currently active (database tables pending migration)

⚠️ **Admin Dashboard** (Mostly Complete)
- User and vendor management
- System-wide analytics with charts (user growth, vendor categories)
- Google Maps showing user locations
- *Pending:* Suspend/ban functionality, report exports

🔄 **Planned Features**
- NGO dashboard and event management
- Service booking and request system
- Complete review submission and display
- Payment integration (Paystack/Flutterwave)
- Email notifications for offline users
- WebRTC-based voice/video calling
- Multilingual support (French, Swahili, Hausa, Yoruba)

### 2.3 User Classes and Characteristics

**1. Youth Users / General Users**
- **Frequency:** High (daily/weekly)
- **Characteristics:** Tech-savvy, mobile-first, looking for gigs, jobs, services, or events
- **Needs:** Fast alerts, low data consumption, simple UI, quick access to nearby opportunities
- **Current Features:** Service discovery, vendor profiles, messaging, notifications, location-based search

**2. MSME/Vendor Users**
- **Frequency:** Medium to high
- **Characteristics:** Small business owners, mobile-first, seeking affordable visibility
- **Needs:** Easy service broadcasting, profile management, customer communication, basic analytics
- **Current Features:** Vendor dashboard, service creation, profile pages, settings, messaging

**3. NGOs & Social Impact Groups**
- **Frequency:** Occasional
- **Characteristics:** Focused on civic, education, or health activities
- **Needs:** Event broadcasting, community reach, impact measurement
- **Current Features:** Profile creation (partial - dashboard and event management pending)

**4. Admin/Platform Managers**
- **Frequency:** Continuous
- **Characteristics:** Responsible for system health, security, moderation
- **Needs:** User management, analytics, moderation tools, system monitoring
- **Current Features:** Admin dashboard with analytics, user/vendor oversight (moderation tools pending)

### 2.4 Operating Environment

**Client-Side (Users):**
- **Devices:** Smartphones (Android ≥ v9, iOS ≥ v14), tablets, desktops/laptops with GPS or IP-based location
- **Browsers:** Chrome, Firefox, Edge, Safari (latest 2 versions)
- **Network:** Optimized for 3G; best experience on 4G/5G and Wi-Fi
- **Storage:** Progressive Web App capabilities with service worker caching

**Server-Side:**
- **Hosting:** Cloud platforms (Vercel recommended, AWS, Google Cloud compatible)
- **Database:** PostgreSQL via Supabase (includes real-time capabilities)
- **Authentication:** Supabase Auth service
- **Storage:** Supabase Storage for file uploads

**External Services:**
- **Maps:** Google Maps API for location and visualization
- **Notifications:** Web Push API + Supabase Realtime
- **Future:** Payment APIs (Paystack/Flutterwave), Email service (SendGrid/AWS SES)

### 2.5 Design and Implementation Constraints

**Technical Constraints:**
- **Platform:** Web-first (Progressive Web App) before native mobile deployment
- **Geolocation:** Accuracy depends on device GPS quality and internet connectivity
- **Notifications:** Require user browser permission; not available in all browsers
- **Real-time:** Dependent on Supabase Realtime infrastructure and user connection quality

**Technology Stack Constraints:**
- **Frontend:** React 18.3.1 with TypeScript (strict typing enforced)
- **Backend:** Supabase (serverless, no custom Express server)
- **Database:** PostgreSQL (relational model, not MongoDB as originally planned)
- **Styling:** Tailwind CSS (utility-first CSS framework)

**Regulatory & Policy Constraints:**
- Must comply with **Nigeria Data Protection Regulation (NDPR 2019)**
- Must be GDPR-ready for international expansion
- User data encrypted at rest and in transit (HTTPS/TLS 1.2+)
- Sensitive information (phone numbers) shared only with explicit user consent

**Resource Constraints:**
- Small development team - features prioritized by impact
- Budget considerations - advanced features (AI, full payment escrow) deferred to later phases
- Phased rollout approach - MVP first, then iterative enhancements

### 2.6 User Documentation

**Current Documentation:**
- ✅ README.md - Project setup and installation guide
- ✅ SETUP_GUIDE.md - Comprehensive setup instructions
- ✅ CODEBASE_ANALYSIS.md - Architecture and code organization
- ✅ DEVELOPMENT_TRACKER.md - Change log and development history
- ✅ FEATURE_ROADMAP.md - Feature implementation tracking
- ✅ QUICK_REFERENCE.md - Quick reference for developers
- ✅ Multiple sprint summaries documenting completed features

**Planned Documentation:**
- 🔄 Interactive in-app onboarding for new users
- 🔄 Video tutorials for key features
- 🔄 Admin dashboard user guide
- 🔄 Vendor handbook for service management
- 🔄 API documentation for developers
- 🔄 Help center with FAQs

**Format & Accessibility:**
- Documentation available in Markdown format (HTML export planned)
- Starting with English; multilingual documentation planned for Phase 2
- Will include screenshots, diagrams, and video walkthroughs

### 2.7 Assumptions and Dependencies

**Assumptions:**
- ✅ Users have access to internet-enabled smartphones or PCs
- ✅ GPS and browser location services work reliably on user devices
- ✅ Users will adopt the platform if entry barrier is low (currently free for all users)
- ✅ MSMEs and youth will share minimal data for geolocation-based matching
- ⚠️ Vendors and NGOs are willing to undergo verification (verification system pending)

**Current Dependencies:**
- ✅ Supabase service availability and performance (99.9% SLA)
- ✅ Google Maps API availability and quota
- ✅ Browser support for modern JavaScript (ES6+), geolocation, and push notifications
- ✅ Internet connectivity and power availability in target regions
- 🔄 Payment gateway integration (Paystack/Flutterwave) for monetization
- 🔄 Email service provider (SendGrid/AWS SES) for offline notifications
- 🔄 Community partners (youth groups, NGOs) for user acquisition and feedback

**Risk Mitigation:**
- Supabase self-hosting option available if vendor lock-in becomes a concern
- Google Maps can be replaced with OpenStreetMap/Leaflet if API costs become prohibitive
- Demo mode implemented for testing without full backend setup

---

## 3. External Interface Requirements

### 3.1 User Interfaces

**Design Principles:**
- ✅ **Mobile-first responsive design** using Tailwind CSS
- ✅ **Touch-friendly controls** with minimum 44px button heights
- ✅ **Accessible color contrast** and clear typography
- ✅ **Consistent design language** with Radix UI components

**Main UI Components:**

**1. Landing Page** (`src/pages/Index.tsx`)
- Hero section with value proposition
- Login / Register call-to-action buttons
- Feature highlights
- Responsive for mobile and desktop

**2. Authentication Pages**
- **Login** (`src/pages/Login.tsx`)
  - Email and password fields with visibility toggles
  - "Remember me" checkbox
  - "Forgot password?" link
  - Google OAuth login (via Supabase)
  - Error handling with user-friendly messages
- **Signup** (`src/pages/Signup.tsx`)
  - Full name, email, phone, password fields
  - Password strength indicator with real-time validation
  - Role selection (user, vendor, NGO)
  - Auto-redirect to login after successful signup

**3. User Dashboard** (`src/pages/Dashboard.tsx`)
- Google Map showing nearby vendors and services
- Proximity alert system for nearby providers
- Service provider list (bottom sheet on mobile)
- Category filters
- Quick actions (Messages, Profile, Notifications)
- Auto-expands providers list when navigating from notifications

**4. Vendor Dashboard** (`src/pages/VendorDashboard.tsx`)
- Overview statistics (total services, views, requests)
- Service management (create, edit, delete, toggle status)
- Quick actions (Create Service, Business Settings, Analytics)
- Service listing with status indicators

**5. Public Vendor Profile** (`src/pages/VendorProfile.tsx`)
- Business information (name, category, description, phone)
- Service tabs (Services, About, Reviews)
- Location map showing vendor location
- Contact buttons (Message, Call, Request Service)
- Rating display with star system

**6. Vendor Settings** (`src/pages/VendorSettings.tsx`)
- Edit business profile form
- Category dropdown with predefined options
- Location picker with "Use Current Location" button
- Phone number and description fields

**7. Profile & Settings Pages**
- **Profile** (`src/pages/Profile.tsx`)
  - User information display
  - Quick actions (Edit Profile, Become a Vendor)
  - Navigation to settings pages
- **Change Password** (`src/pages/ChangePassword.tsx`)
  - Current password, new password, confirm password fields
  - Password strength indicator
  - Visibility toggles for all fields
- **Privacy Settings** (`src/pages/PrivacySettings.tsx`)
  - Toggle switches for profile visibility, location sharing, messages, activity status
- **Notification Preferences** (`src/pages/NotificationPreferences.tsx`)
  - Granular control over notification types (push, email, messages, reviews, payments, promotions)
- **Delete Account** (`src/pages/DeleteAccount.tsx`)
  - Confirmation text input validation
  - Acknowledgment checkbox
  - Proper back navigation

**8. Messaging Page** (`src/pages/Messages.tsx`)
- Conversation list with avatars and unread badges
- Real-time message threading
- Message input with send button
- Read receipts and typing indicators
- Demo mode with auto-reply simulation

**9. Admin Dashboard** (`src/pages/AdminDashboard.tsx`)
- System statistics (users, vendors, services, events)
- User growth chart (Recharts area chart)
- Vendor category distribution (pie chart)
- Google Map with user location pins
- User and vendor management tables

**10. Other Pages**
- Service List, Service Profile, Orders, Payments, Notifications, Support, About

**UI Standards:**
- Consistent gradient hero headers with navigation
- Card-based layouts for content organization
- Skeleton loaders for async data fetching
- Toast notifications for user feedback (Sonner)
- Error boundaries for graceful error handling

### 3.2 Hardware Interfaces

**Client Devices:**
- ✅ **Smartphones:** Android (≥ v9), iOS (≥ v14)
- ✅ **Tablets:** iPad, Android tablets
- ✅ **Desktops/Laptops:** Windows 10+, macOS 11+, Linux
- ✅ **GPS:** Device GPS for accurate location (IP-based fallback)
- ✅ **Camera/Microphone:** For future video calling and profile photos

**Server Infrastructure:**
- ✅ **Cloud-hosted:** Supabase PostgreSQL database on AWS infrastructure
- ✅ **Scalable:** Auto-scaling with Supabase connection pooling
- ✅ **Redundant:** Multi-region failover capabilities (Supabase managed)

**Performance Requirements:**
- Supports up to 10,000 concurrent users in current deployment phase
- Database connection pooling for efficient resource usage
- CDN for static asset delivery (Vercel Edge Network)

### 3.3 Software Interfaces

**Operating Systems (Client):**
- ✅ Windows 10+, macOS 11+, Android 9+, iOS 14+
- ✅ Linux (desktop browsers)

**Databases:**
- ✅ **PostgreSQL 15+** via Supabase
  - Relational data storage
  - Row Level Security (RLS) for data protection
  - Real-time subscriptions for live updates

**APIs & Services:**
- ✅ **Google Maps API** - Location visualization and geocoding
- ✅ **Supabase Auth** - User authentication and session management
- ✅ **Supabase Realtime** - WebSocket-based live data sync
- ✅ **Supabase Storage** - File upload and storage
- ✅ **Web Push API** - Browser push notifications
- 🔄 **Paystack/Flutterwave API** (Planned) - Payment processing
- 🔄 **SendGrid/AWS SES** (Planned) - Email notifications

**Browsers:**
- ✅ Chrome 120+, Firefox 120+, Safari 17+, Edge 120+
- ✅ Mobile browsers: Chrome Mobile, Safari Mobile, Samsung Internet

**Development Tools:**
- ✅ **Vite 5.4.19** - Frontend build tool and dev server
- ✅ **TypeScript 5.8.3** - Type-safe JavaScript
- ✅ **Vitest 0.34.1** - Unit testing framework
- ✅ **ESLint** - Code linting and quality checks

### 3.4 Communications Interfaces

**Network Protocols:**
- ✅ **HTTPS** - All communication encrypted (TLS 1.2+)
- ✅ **WebSocket** - Real-time data via Supabase Realtime
- ✅ **REST API** - Supabase PostgREST API for database operations

**Notification System:**
- ✅ **Web Push API** - Browser push notifications
- ✅ **Supabase Realtime** - In-app notifications via WebSocket
- 🔄 **Email** (Planned) - Offline user notifications via SMTP

**Data Formats:**
- ✅ **JSON** - All API communication and data exchange
- ✅ **WebP/PNG/JPEG** - Image formats
- 🔄 **CSV/PDF** (Planned) - Report exports

**Security:**
- ✅ **TLS 1.2+** - Secure communication
- ✅ **JWT** - Authentication tokens (Supabase Auth)
- ✅ **Row Level Security (RLS)** - Database-level access control
- ✅ **CORS** - Controlled cross-origin resource sharing
- ⚠️ **Content Security Policy** (Partially implemented)

---

## 4. Functional Requirements Specification

### FR 1: User Registration & Authentication

#### FR 1.1: User Registration ✅ **IMPLEMENTED**
**Description:** Users can register using email, phone number, or Google OAuth.

**Implementation Details:**
- Email/password registration via Supabase Auth
- Phone number registration supported
- Google OAuth integration via Supabase Auth providers
- Password requirements: minimum 6 characters, must contain uppercase, lowercase, number
- Email verification via Supabase (configurable)
- Profile automatically created in `profiles` table upon signup
- User role (user, vendor, NGO) assigned during signup
- Auto-redirect to login page after successful signup

**Files:** `src/pages/Signup.tsx`, `src/integrations/supabase/client.ts`

**Database Tables:** `auth.users` (Supabase managed), `profiles`, `user_roles`

**Priority:** High  
**Status:** ✅ Complete

---

#### FR 1.2: User Authentication ✅ **IMPLEMENTED**
**Description:** Secure authentication before granting access to dashboards.

**Implementation Details:**
- Email/password login via Supabase Auth
- Google OAuth login
- Session persistence using Supabase session management
- "Remember me" functionality stores email in localStorage
- Password visibility toggle with eye icons
- Multi-role support with priority-based routing (admin > vendor > user)
- Protected routes with `ProtectedRoute` component
- Session expiration handling with auto-redirect to login

**Files:** `src/pages/Login.tsx`, `src/components/ProtectedRoute.tsx`

**Security:** HTTPS, JWT tokens, session cookies

**Priority:** High  
**Status:** ✅ Complete

---

#### FR 1.3: Specialized Profiles ✅ **IMPLEMENTED**
**Description:** Vendors and NGOs can create specialized profiles with additional business/organization fields.

**Implementation Details:**
- Vendor profile creation via dialog in Profile page or Sidebar
- Required fields: business name, category, description
- Optional fields: phone, location
- NGO profile creation with organization name, impact area, description
- Profile stored in `vendor_profiles` or `ngo_profiles` table
- User role automatically assigned in `user_roles` table
- Verification status field (pending admin approval)
- Profile editing via VendorSettings or NgoSettings pages

**Files:** `src/pages/Profile.tsx`, `src/pages/VendorSettings.tsx`, `src/components/Sidebar.tsx`

**Database Tables:** `vendor_profiles`, `ngo_profiles`, `user_roles`

**Priority:** High  
**Status:** ✅ Complete

---

### FR 2: Location Services & Proximity Detection

#### FR 2.1: User Geolocation ✅ **IMPLEMENTED**
**Description:** Capture user geolocation using device GPS or IP-based fallback.

**Implementation Details:**
- Browser Geolocation API via `useGeolocation.ts` hook
- Real-time location tracking with position watching
- Location stored in `profiles` table (`location_lat`, `location_lng`, `last_location_update`)
- IP-based fallback when GPS is unavailable
- Location permission request with user-friendly prompts
- Location accuracy indicators
- Manual location input option (latitude/longitude)

**Files:** `src/hooks/useGeolocation.ts`, `src/pages/Dashboard.tsx`, `src/pages/VendorSettings.tsx`

**Browser API:** `navigator.geolocation`

**Priority:** High  
**Status:** ✅ Complete

---

#### FR 2.2: Display Nearby Users (Default: 5km) ⚠️ **PARTIALLY IMPLEMENTED**
**Description:** Detect and display nearby users, vendors, or opportunities within a configurable radius.

**Implementation Details:**
- Proximity calculation using Haversine formula in `src/lib/proximity.ts`
- Default radius: 5km (SRS specifies 10m-5km configurable range)
- Google Maps integration showing nearby vendors as animated markers
- Vendor filtering by distance
- Proximity alerts when vendors are within 500m
- Auto-expand service provider list when nearby vendors detected

**Current Gap:** Default radius is 5km, not 10m as specified in SRS. No UI control for user to adjust radius.

**Files:** `src/components/GoogleMapView.tsx`, `src/pages/Dashboard.tsx`, `src/lib/proximity.ts`

**Priority:** High  
**Status:** ⚠️ Mostly complete (needs radius configuration UI)

---

#### FR 2.3: Filter ✅ **IMPLEMENTED**
**Description:** Enable users to filter visible opportunities by category (Jobs, Services, Community).

**Implementation Details:**
- Category filters in ServiceProviderList component
- Service category dropdown in ServiceList page
- Search functionality across service titles and descriptions
- Filter by service type (jobs, services, events)
- Sort by distance, rating, date created
- Clear all filters button

**Files:** `src/components/ServiceProviderList.tsx`, `src/pages/ServiceList.tsx`

**Priority:** High  
**Status:** ✅ Complete

---

### FR 3: Real-Time Notifications

#### FR 3.1: Push Notifications ✅ **IMPLEMENTED**
**Description:** Send push notifications when a matching opportunity or service is nearby.

**Implementation Details:**
- Welcome notification on login (one-time per session)
- Special offer notification after 50 seconds (one-time per session)
- Real-time notifications via Supabase Realtime channels
- Browser push notifications using Web Push API
- Custom toast notifications with `NotificationToast` component
- Notification click opens Notification Center
- Notification persistence in `notifications` table
- Mark as read functionality with unread count badge

**Files:** `src/hooks/useNotifications.tsx`, `src/hooks/usePushNotifications.ts`, `src/components/NotificationCenter.tsx`

**Database Tables:** `notifications`, `push_subscriptions`

**Priority:** High  
**Status:** ✅ Complete

---

#### FR 3.2: Custom Notifications ⚠️ **PARTIALLY IMPLEMENTED**
**Description:** Allow users to set notification preferences (e.g., jobs only, vendors only).

**Implementation Details:**
- Notification preferences page with toggle switches
- Settings for: push notifications, email notifications, messages, reviews, payments, promotions
- Preferences stored in user profile (not yet enforced in delivery logic)

**Current Gap:** Category-specific filtering (e.g., "jobs only", "vendors only") not fully implemented in notification delivery logic. Preferences are saved but not applied when triggering notifications.

**Files:** `src/pages/NotificationPreferences.tsx`

**Priority:** Medium  
**Status:** ⚠️ Partially complete (UI exists, logic needs implementation)

---

#### FR 3.3: Email Notification ❌ **NOT IMPLEMENTED**
**Description:** Provide alerts via email if the user is offline.

**Implementation Details:** Not yet implemented. Requires:
- Email service integration (SendGrid/AWS SES)
- Offline user detection (check last_active_at timestamp)
- Email queue system
- Email templates (HTML/text)
- Respect user email preferences

**Priority:** Medium  
**Status:** ❌ Not implemented (Planned for Sprint 12)

---

### FR 4: Vendor/MSME Services

#### FR 4.1: Broadcast Service Listing ✅ **IMPLEMENTED**
**Description:** Allow vendors to create, edit, and broadcast service listings.

**Implementation Details:**
- Service creation form in VendorDashboard
- Required fields: title, description, category, service_type, price, location
- Optional fields: radius_meters (service coverage area)
- Service stored in `services` table
- Service status toggle (active/inactive)
- Service editing and deletion
- Service visibility controlled by status field

**Files:** `src/pages/VendorDashboard.tsx`

**Database Tables:** `services`

**Priority:** High  
**Status:** ✅ Complete

---

#### FR 4.2: Analytics Dashboards ⚠️ **PARTIALLY IMPLEMENTED**
**Description:** Provide analytics dashboards showing reach, clicks, and user interaction.

**Implementation Details:**
- **Admin Dashboard:** System-wide analytics with charts
  - User growth over time (Recharts area chart)
  - Vendor category distribution (pie chart)
  - User locations on Google Map
  - Total counts (users, vendors, services, events)

**Current Gap:** Vendor-specific analytics not implemented in VendorDashboard. Vendors cannot see:
- Views per service
- Service request counts
- Conversion rates
- Click-through rates
- Revenue analytics

**Files:** `src/pages/AdminDashboard.tsx`

**Priority:** Medium  
**Status:** ⚠️ Admin analytics complete, vendor analytics missing (Planned for Sprint 10)

---

#### FR 4.3: Toggle Availability ✅ **IMPLEMENTED**
**Description:** Enable vendors to toggle service availability (active/inactive mode).

**Implementation Details:**
- Service status field in `services` table (active/inactive)
- Status toggle in service creation/edit form
- Active services visible to users
- Inactive services hidden from search and map
- Status badge on vendor dashboard service cards

**Files:** `src/pages/VendorDashboard.tsx`

**Priority:** High  
**Status:** ✅ Complete

---

### FR 5: NGO/Community Broadcasts

#### FR 5.1: NGO Dashboard ❌ **NOT IMPLEMENTED**
**Description:** Allow NGOs to create and broadcast events or service opportunities.

**Implementation Details:** Not yet implemented. Requires:
- NGO dashboard page (similar to VendorDashboard)
- Event creation form
- Event management (edit, delete, toggle status)
- Event broadcasting to nearby users
- Event analytics

**Priority:** High  
**Status:** ❌ Not implemented (Planned for Sprint 6)

---

#### FR 5.2: Display Active Events ❌ **NOT IMPLEMENTED**
**Description:** Display active events on the user's dashboard map view.

**Implementation Details:** Not yet implemented. Requires:
- Event markers on Google Map
- Event cards in ServiceProviderList
- Event filtering
- RSVP/registration functionality
- Event notifications

**Database Tables:** `events` (table exists, UI not implemented)

**Priority:** High  
**Status:** ❌ Not implemented (Planned for Sprint 6)

---

### FR 6: Communication & Interaction

#### FR 6.1: In-app Messaging ⚠️ **PARTIALLY IMPLEMENTED**
**Description:** Provide optional in-app messaging between users and vendors/NGOs.

**Implementation Details:**
- Messaging UI with conversation list and message threading
- Real-time message updates via Supabase Realtime
- Read receipts and typing indicators
- Message input with send button
- Demo mode with auto-reply simulation

**Current Gap:** 
- `conversations` and `messages` tables not confirmed in database migrations
- Demo mode active (local message storage, no persistence)
- Requires database table creation and RLS policies

**Files:** `src/pages/Messages.tsx`, `src/data/demoMessages.ts`

**Priority:** High  
**Status:** ⚠️ UI complete, database setup pending (Planned for Sprint 5)

---

#### FR 6.2: Direct Calling ⚠️ **PARTIALLY IMPLEMENTED**
**Description:** Enable direct calling (phone number revealed with user consent).

**Implementation Details:**
- Call UI interface with voice/video call simulation
- Call controls (mute, speaker, video toggle, end call)
- Call duration tracking
- Call type selection (voice/video)

**Current Gap:**
- No WebRTC integration
- Only demo/mock interface
- No real audio/video streaming
- Phone number sharing not implemented with consent flow

**Files:** `src/pages/Call.tsx`

**Priority:** Low  
**Status:** ⚠️ UI mockup only (Real calling planned for Sprint 13)

---

#### FR 6.3: Ratings and Reviews ⚠️ **PARTIALLY IMPLEMENTED**
**Description:** Allow ratings and reviews for vendors and services.

**Implementation Details:**
- `reviews` table exists in database schema
- ReviewForm component created with star rating and comment input

**Current Gap:**
- Review submission logic not fully integrated
- Review display on vendor profiles not implemented
- No review moderation
- No review response from vendors
- No rating calculation for vendors

**Files:** `src/components/ReviewForm.tsx`

**Database Tables:** `reviews`

**Priority:** High  
**Status:** ⚠️ Partially complete (Planned for Sprint 8)

---

### FR 7: Administration & Moderation

#### FR 7.1: Admin Dashboard ✅ **IMPLEMENTED**
**Description:** Provide an admin dashboard for user and content moderation.

**Implementation Details:**
- Role-based access control (admin role required)
- System statistics (users, vendors, services, events, pending vendors)
- Analytics charts:
  - User growth over last 7 days (area chart)
  - Vendor category distribution (pie chart)
  - User locations on Google Map
- User management table (view all users)
- Vendor management table (view all vendors)
- Tabs for easy navigation

**Files:** `src/pages/AdminDashboard.tsx`

**Priority:** High  
**Status:** ✅ Complete

---

#### FR 7.2: Admin Control ⚠️ **PARTIALLY IMPLEMENTED**
**Description:** Enable administrators to suspend or ban fraudulent users/vendors.

**Implementation Details:**
- Admin can view all users and vendors
- User and vendor tables display in admin dashboard

**Current Gap:**
- No suspend functionality
- No ban functionality
- No moderation controls for inappropriate content
- No reason tracking for suspensions/bans
- No appeal process

**Priority:** Medium  
**Status:** ⚠️ View-only (Control features planned for Sprint 9)

---

#### FR 7.3: System Report ⚠️ **PARTIALLY IMPLEMENTED**
**Description:** Generate system-wide reports (active users, broadcasts, alerts).

**Implementation Details:**
- Real-time statistics displayed on admin dashboard
- Counts for users, vendors, services, events
- Charts showing trends

**Current Gap:**
- No report export (CSV/PDF)
- No historical trend analysis
- No scheduled reports
- No downloadable charts

**Priority:** Medium  
**Status:** ⚠️ Display only (Export planned for Sprint 10)

---

## 5. Non-Functional Requirements Specification

### NFR 1: Security

#### NFR 1.1: HTTPS/TLS 1.2+ ✅ **IMPLEMENTED**
**Description:** All communication between client and server must be encrypted using HTTPS with TLS 1.2 or higher.

**Implementation:**
- Supabase enforces TLS 1.2+
- Vite dev server supports HTTPS
- Production deployment on Vercel with automatic HTTPS
- No mixed content (all resources loaded over HTTPS)

**Status:** ✅ Complete

---

#### NFR 1.2: Multi-factor Authentication ⚠️ **PARTIALLY IMPLEMENTED**
**Description:** User authentication must support multi-factor authentication for vendors and NGOs.

**Implementation:**
- Supabase Auth supports MFA (TOTP-based)
- MFA capability exists but not enforced in UI
- No MFA enrollment flow for vendors/NGOs

**Gap:** MFA not mandatory or promoted to vendors and NGOs

**Status:** ⚠️ Capability exists, enforcement pending (Planned for Sprint 16)

---

#### NFR 1.3: Role-Based Access Control ✅ **IMPLEMENTED**
**Description:** RBAC must restrict access to admin-only functions.

**Implementation:**
- `user_roles` table with roles: user, vendor, ngo, admin
- `ProtectedRoute` component enforces role-based access
- Row Level Security (RLS) policies on all tables
- Admin routes require "admin" role
- Vendor routes require "vendor" role
- Multi-role support with priority-based routing

**Status:** ✅ Complete

---

### NFR 2: Performance

#### NFR 2.1: 2-Second Response Time ⚠️ **NEEDS VERIFICATION**
**Description:** The system must respond to user actions (e.g., loading nearby opportunities) within 2 seconds under normal network conditions.

**Status:** ⚠️ Not formally benchmarked. Anecdotal testing shows responsive performance, but no performance testing conducted.

**Requirement:** Performance testing planned for Sprint 15

---

#### NFR 2.2: 10,000 Concurrent Users ❌ **NOT VERIFIED**
**Description:** The web app must support at least 10,000 concurrent users in its first deployment phase.

**Status:** ❌ Not tested. Architecture supports scalability (serverless Supabase), but no load testing performed.

**Requirement:** Load testing planned for Sprint 15

---

#### NFR 2.3: 5-Second Notification Delivery ⚠️ **NEEDS VERIFICATION**
**Description:** Push notifications must be delivered within 5 seconds of an opportunity or vendor broadcast.

**Status:** ⚠️ Browser notifications appear near-instantly in testing. Real-time channel latency dependent on Supabase infrastructure. Not formally benchmarked.

**Requirement:** Notification latency testing planned for Sprint 15

---

### NFR 3: Usability

#### NFR 3.1: Mobile-first Responsive Design ✅ **IMPLEMENTED**
**Description:** The interface must follow mobile-first responsive design, accessible across desktop and mobile browsers.

**Implementation:**
- Tailwind CSS with mobile-first breakpoints (sm, md, lg, xl)
- Touch-friendly controls (minimum 44px button heights)
- Responsive Google Maps component
- Bottom sheets for mobile (ServiceProviderList)
- Swipe gestures supported (via vaul library)
- Tested on iOS Safari, Android Chrome, desktop browsers

**Status:** ✅ Complete

---

#### NFR 3.2: Multilingual Functionality ❌ **NOT IMPLEMENTED**
**Description:** The app must support multilingual functionality, beginning with English and expandable to local African languages.

**Status:** ❌ Currently English-only. No i18n framework integrated.

**Requirement:** Multilingual support planned for Sprint 14 (French, Swahili, Hausa, Yoruba)

---

### NFR 4: Safety Requirements

#### NFR 4.1: Verification for Broadcasts ⚠️ **PARTIALLY IMPLEMENTED**
**Description:** The system must prevent malicious broadcasts by requiring verification for vendor/NGO accounts.

**Implementation:**
- `verification_status` field exists in `vendor_profiles` and `ngo_profiles` tables
- Default value: false (unverified)

**Gap:**
- No verification process implemented
- No admin approval workflow
- No document upload for verification
- Unverified accounts can broadcast services/events

**Status:** ⚠️ Database field exists, process not implemented (Planned for Sprint 9)

---

#### NFR 4.2: Consent for Data Sharing ⚠️ **PARTIALLY IMPLEMENTED**
**Description:** Sensitive data (such as phone numbers) must only be shared with user consent.

**Implementation:**
- Phone numbers not automatically shared
- Vendor profiles display phone numbers (vendor-provided)

**Gap:**
- No explicit consent UI/flow for data sharing
- No per-user privacy controls for phone visibility
- No data sharing permission toggles

**Status:** ⚠️ Basic privacy, explicit consent missing (Planned for Sprint 16)

---

### NFR 5: Software Quality Attributes

#### NFR 5.1: 99.9% Uptime ⚠️ **DEPENDS ON HOSTING**
**Description:** The system must be available 99.9% of the time (excluding planned maintenance).

**Implementation:**
- Supabase offers 99.9% SLA on Pro plan
- Vercel hosting with global CDN and auto-scaling
- No independent uptime monitoring

**Gap:** No uptime monitoring or alerting configured

**Status:** ⚠️ Depends on third-party providers (Monitoring planned for Sprint 15)

---

#### NFR 5.2: Scalable to 100,000+ Users ⚠️ **ARCHITECTURE SUPPORTS**
**Description:** The platform must be scalable to 100,000+ users with minimal re-architecture.

**Implementation:**
- Supabase PostgreSQL with connection pooling
- Serverless architecture (no single points of failure)
- Stateless frontend (React SPA)
- CDN for static assets

**Gap:** No load testing or optimization performed for large scale

**Status:** ⚠️ Architecture supports, not tested (Load testing planned for Sprint 15)

---

#### NFR 5.3: Modular Codebase ✅ **IMPLEMENTED**
**Description:** The codebase must be modular, enabling feature updates without breaking existing functionality.

**Implementation:**
- React component architecture with clear separation of concerns
- Organized folder structure: `pages/`, `components/`, `hooks/`, `integrations/`, `lib/`
- Feature-based file organization
- TypeScript for type safety
- Component reusability (UI components in `components/ui/`)
- Independent feature modules

**Status:** ✅ Complete

---

### NFR 6: Cross-Browser and Device Support

#### NFR 6.1: Latest 2 Browser Versions ✅ **IMPLEMENTED**
**Description:** The system must run on the latest two versions of Chrome, Firefox, Safari, and Edge.

**Implementation:**
- Tested on Chrome 120+, Firefox 120+, Safari 17+, Edge 120+
- Modern JavaScript (ES6+) with Vite transpilation
- Browser compatibility checks in place

**Status:** ✅ Complete

---

#### NFR 6.2: Android ≥v9, iOS ≥v14 ✅ **IMPLEMENTED**
**Description:** The platform must support Android (≥ v9) and iOS (≥ v14) browsers.

**Implementation:**
- Mobile browser support confirmed (Chrome Mobile, Safari Mobile)
- Progressive Web App (PWA) capabilities with service worker
- Touch-optimized UI
- Mobile-responsive layouts

**Status:** ✅ Complete

---

#### NFR 6.3: 2GB RAM Devices ⚠️ **NOT FORMALLY TESTED**
**Description:** The app must function reliably on both high-end and low-end devices with at least 2GB RAM.

**Implementation:**
- Lightweight React components
- Lazy loading for routes and heavy components
- Image optimization
- Efficient state management

**Gap:** Performance not benchmarked on low-end devices

**Status:** ⚠️ Designed for efficiency, not tested (Testing planned for Sprint 15)

---

### NFR 7: Auditability & Compliance

#### NFR 7.1: Activity Logging ❌ **NOT IMPLEMENTED**
**Description:** All user activities (login, broadcasts, payments) must be logged for audit purposes.

**Status:** ❌ No comprehensive audit logging. Database tracks `created_at` timestamps, but no dedicated activity logs table.

**Requirement:** Audit logging planned for Sprint 16

---

#### NFR 7.2: NDPR/GDPR Compliance ⚠️ **PARTIALLY IMPLEMENTED**
**Description:** The system must comply with Nigeria Data Protection Regulation (NDPR) and be extendable for GDPR compliance.

**Implementation:**
- Data encrypted at rest (Supabase default)
- HTTPS enforced for data in transit
- User can delete account (`DeleteAccount.tsx`)

**Gap:**
- No privacy policy displayed
- No cookie consent banner
- No data export feature (GDPR right to data portability)
- Data deletion incomplete (orphaned records may remain)

**Status:** ⚠️ Basic compliance, full implementation pending (Planned for Sprint 16)

---

#### NFR 7.3: CSV/PDF Export ❌ **NOT IMPLEMENTED**
**Description:** Reports must be exportable in CSV/PDF format for analysis by admins.

**Status:** ❌ No export functionality exists.

**Requirement:** Export planned for Sprint 10

---

## 6. Technology Stack (Current Implementation)

### Frontend
- **Framework:** React 18.3.1 with TypeScript
- **Build Tool:** Vite 5.4.19
- **Styling:** Tailwind CSS 3.4.17
- **UI Components:** Radix UI (40+ components)
- **Routing:** React Router DOM 6.30.1
- **State Management:** React hooks, TanStack React Query 5.83.0
- **Maps:** @react-google-maps/api 2.20.7
- **Charts:** Recharts 2.15.4
- **Notifications:** Sonner 1.7.4
- **Forms:** React Hook Form 7.61.1, Zod 3.25.76
- **Icons:** Lucide React 0.462.0

### Backend
- **Platform:** Supabase (serverless)
- **Database:** PostgreSQL 15+
- **Authentication:** Supabase Auth
- **Real-time:** Supabase Realtime (WebSocket-based)
- **Storage:** Supabase Storage
- **Edge Functions:** Supabase Edge Functions (Deno-based)

### APIs & Services
- **Maps:** Google Maps JavaScript API
- **Geolocation:** Browser Geolocation API
- **Push Notifications:** Web Push API
- **Payment Gateway:** Not yet integrated (Paystack/Flutterwave planned)
- **Email Service:** Not yet integrated (SendGrid/AWS SES planned)

### Development Tools
- **Package Manager:** npm
- **Testing:** Vitest 0.34.1, @testing-library/react 14.0.0
- **Linting:** ESLint 9.32.0, TypeScript ESLint 8.38.0
- **Type Checking:** TypeScript 5.8.3
- **Version Control:** Git, GitHub

### Deployment
- **Hosting:** Vercel (recommended)
- **CDN:** Vercel Edge Network
- **CI/CD:** Vercel automatic deployments
- **Analytics:** Vercel Analytics 1.5.0
- **Monitoring:** Not yet configured (Sentry planned)

### Database Schema (PostgreSQL)
**Tables:**
- `profiles` - User information
- `user_roles` - Role assignments (user, vendor, ngo, admin)
- `vendor_profiles` - Vendor-specific data
- `ngo_profiles` - NGO-specific data
- `services` - Service listings
- `events` - Community events (schema exists, UI pending)
- `notifications` - User notifications
- `push_subscriptions` - Web push subscriptions
- `reviews` - Service/vendor reviews (schema exists, integration pending)
- `conversations` - Message conversations (table pending)
- `messages` - Chat messages (table pending)

---

## 7. System Constraints

### Technical Constraints
- Web-first platform (mobile app planned for future)
- Requires modern browser with JavaScript enabled
- Geolocation accuracy varies by device and environment
- Real-time features depend on stable internet connection
- Push notifications require user permission

### Business Constraints
- Small development team (2-3 developers)
- Limited budget for third-party services
- MVP-first approach (iterative feature rollout)
- Free for all users initially (monetization via paid features planned)

### Regulatory Constraints
- Must comply with NDPR (Nigeria Data Protection Regulation)
- Must be GDPR-ready for international expansion
- User consent required for data collection and sharing
- Right to be forgotten (account deletion)
- Data portability requirements

---

## 8. Summary & Roadmap

### Current Status (November 2025)
**ProxiLink is approximately 60% complete based on the original SRS requirements.**

**Fully Implemented (38%):**
- User authentication and registration
- Multi-role system (user, vendor, NGO, admin)
- Vendor profiles and service listings
- Location-based service discovery
- Real-time notifications
- Admin dashboard with analytics
- Profile settings and privacy controls

**Partially Implemented (38%):**
- Messaging system (UI complete, database pending)
- Proximity detection (needs radius configuration)
- Review system (schema exists, integration pending)
- Admin moderation tools (view-only, actions pending)
- Vendor analytics (admin has analytics, vendors do not)
- Compliance (basic encryption, full NDPR/GDPR pending)

**Not Implemented (24%):**
- NGO dashboard and event management
- Service booking and request system
- Payment integration
- Email notifications
- Real-time video calling (WebRTC)
- Multilingual support
- Audit logging and report exports
- Performance testing and optimization

### Development Roadmap (Next 7-8 Months)

**Immediate Priorities (Months 1-3):**
1. Complete messaging system database setup (Sprint 5)
2. Build NGO dashboard and event management (Sprint 6)
3. Implement service booking and request flow (Sprint 7)
4. Complete review system integration (Sprint 8)

**High Priority (Months 3-6):**
5. Add admin moderation tools (suspend/ban, verification) (Sprint 9)
6. Implement vendor analytics and report exports (Sprint 10)
7. Integrate payment gateway (Paystack/Flutterwave) (Sprint 11)
8. Set up email notification service (Sprint 12)

**Medium Priority (Months 6-8):**
9. Conduct performance testing and optimization (Sprint 15)
10. Implement compliance measures (audit logging, NDPR/GDPR) (Sprint 16)

**Future Enhancements:**
11. Real-time video calling with WebRTC (Sprint 13)
12. Multilingual support (French, Swahili, Hausa, Yoruba) (Sprint 14)
13. Native mobile apps (iOS, Android)
14. AI-powered service recommendations
15. In-app wallet and payment escrow

### Key Metrics (Target by End of 2026)
- **Users:** 50,000 active users
- **Vendors:** 5,000 registered vendors
- **Services:** 20,000+ service listings
- **Daily Active Users:** 5,000+
- **Transactions:** 10,000+ service bookings
- **Geographic Coverage:** 10 major Nigerian cities

---

## 9. Appendix

### Appendix A: Glossary

| Term | Definition |
|------|------------|
| **ProxiLink** | The web application connecting youth, MSMEs, NGOs, and communities via proximity-based services |
| **MVP** | Minimum Viable Product, the first functional version of the app (web-first, browser-based) |
| **MSME** | Micro, Small, and Medium Enterprises, small-scale businesses offering products or services |
| **NGO** | Non-Governmental Organization, civic and community organizations using ProxiLink for broadcasting events |
| **Broadcast** | An alert or notification sent by a vendor, NGO, or community actor to nearby users |
| **RBAC** | Role-Based Access Control, a method of restricting system access to authorized users based on their roles |
| **RLS** | Row Level Security, PostgreSQL security feature that restricts which rows a user can access |
| **PWA** | Progressive Web App, a web application that can be installed and work offline |
| **WebRTC** | Web Real-Time Communication, technology for peer-to-peer audio/video calling in browsers |
| **i18n** | Internationalization, the process of designing software to support multiple languages |
| **NDPR** | Nigeria Data Protection Regulation, governs how user data is collected and stored in Nigeria |
| **GDPR** | General Data Protection Regulation, European Union data protection law |
| **JWT** | JSON Web Token, a compact token format used for authentication |
| **TOTP** | Time-based One-Time Password, used for multi-factor authentication |
| **TLS** | Transport Layer Security, cryptographic protocol for secure communication |

### Appendix B: Database Schema Overview

**Core Tables:**
- `profiles` - User information (full_name, phone, location, preferences)
- `user_roles` - Role assignments (user, vendor, ngo, admin)
- `vendor_profiles` - Vendor business data (business_name, category, description, verification_status)
- `ngo_profiles` - NGO organization data (organization_name, impact_area, description)
- `services` - Service listings (title, description, category, price, location, status)
- `notifications` - User notifications (title, content, type, is_read, related_id)
- `push_subscriptions` - Web push subscriptions (endpoint, keys)
- `reviews` - Service/vendor reviews (rating, comment, service_id, user_id)

**Planned Tables:**
- `conversations` - Message threads between users and vendors
- `messages` - Individual chat messages
- `service_requests` - Service booking requests
- `payments` - Payment transactions
- `audit_logs` - Activity audit trail

### Appendix C: API Reference

**Supabase API Endpoints (PostgREST):**
- Base URL: `https://usdftdymaiyddgmlaaqm.supabase.co/rest/v1/`
- Authentication: Bearer token (JWT) in `Authorization` header

**Common Operations:**
```typescript
// Get current user
supabase.auth.getUser()

// Query profiles
supabase.from('profiles').select('*')

// Create service
supabase.from('services').insert({ title, description, ... })

// Real-time subscription
supabase.channel('notifications:userId')
  .on('postgres_changes', { event: 'INSERT', ... }, callback)
  .subscribe()
```

### Appendix D: Environment Variables

**Required Environment Variables:**
```
VITE_SUPABASE_URL=https://usdftdymaiyddgmlaaqm.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_USE_DEMO_VENDORS=false
```

**Optional Environment Variables:**
```
VITE_PAYSTACK_PUBLIC_KEY=your_paystack_key (future)
VITE_SENDGRID_API_KEY=your_sendgrid_key (future)
VITE_SENTRY_DSN=your_sentry_dsn (future)
```

---

**Document Version:** 2.0 (Updated)  
**Original SRS Version:** 1.0  
**Last Updated:** November 25, 2025  
**Implementation Status:** 60% Complete  
**Next Review Date:** February 2026

---

**Related Documents:**
- `SRS_IMPLEMENTATION_CHECKLIST.md` - Detailed implementation checklist with status
- `SRS_IMPLEMENTATION_SPRINTS.md` - Sprint-by-sprint development plan
- `README.md` - Project setup and installation guide
- `SETUP_GUIDE.md` - Comprehensive setup instructions
- `CODEBASE_ANALYSIS.md` - Architecture and code organization
