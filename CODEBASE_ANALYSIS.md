# ProxiLink - Codebase Analysis & Development Guide

## 📋 Project Overview

**ProxiLink** is a proximity-based platform connecting youth, businesses, and communities across Africa. It enables real-time discovery of opportunities (jobs, services, events) based on geographic location.

**Status:** Early-stage prototype built with modern web technologies

---

## 🏗️ Architecture & Technology Stack

### Frontend
- **Framework:** React 18.3 with TypeScript
- **Build Tool:** Vite 5.4
- **Styling:** Tailwind CSS + PostCSS with shadcn-ui component library
- **Routing:** React Router v6
- **State Management:** TanStack React Query (for async state)
- **Forms:** React Hook Form + Zod (validation)
- **UI Components:** shadcn-ui (Radix UI primitives)
- **Icons:** Lucide React
- **Charting:** Recharts
- **Notifications:** Sonner & Toaster
- **Other:** Embla Carousel, react-resizable-panels, vaul (drawer)

### Backend & Database
- **Backend as a Service:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Real-time:** Supabase Realtime (enabled)
- **Project ID:** nuqzhlzhtzjfzpqgcogd

### Development
- **Linting:** ESLint 9 + TypeScript ESLint
- **Package Manager:** Bun (with bun.lockb)
- **Development Server:** Vite with hot reload on port 8080

---

## 📊 Database Schema

### Core Tables

#### **profiles** (User information)
- `id` (UUID, PK) - References auth.users
- `full_name`, `phone`, `avatar_url`
- `location_lat`, `location_lng` - For geolocation
- `preferences` (JSONB)
- Timestamps: `created_at`, `updated_at`

#### **user_roles** (Role assignment)
- `id` (UUID, PK)
- `user_id` → users
- `role` (ENUM: 'youth', 'vendor', 'ngo', 'admin')
- Unique constraint: (user_id, role)

#### **vendor_profiles** (Vendor-specific info)
- `id` (UUID, PK)
- `user_id` → users (UNIQUE)
- `business_name`, `category`, `description`
- `verification_status` (boolean)

#### **ngo_profiles** (NGO-specific info)
- `id` (UUID, PK)
- `user_id` → users (UNIQUE)
- `organization_name`, `impact_area`, `description`
- `verification_status` (boolean)

#### **services** (Opportunities/Products)
- `id` (UUID, PK)
- `user_id` → users
- `title`, `description`, `category`
- `service_type` (ENUM: 'job', 'service', 'product')
- `location_lat`, `location_lng`, `radius_meters` (5000m default)
- `status` ('active', 'inactive', 'expired')
- `price` (DECIMAL)
- Geospatial indexes for proximity queries

#### **events** (Community events)
- `id` (UUID, PK)
- `user_id` → users
- `title`, `description`, `event_type`
- `location_lat`, `location_lng`, `radius_meters`
- `event_date` (TIMESTAMP)
- `status` ('upcoming', 'ongoing', 'completed', 'cancelled')

#### **notifications**
- `id` (UUID, PK)
- `user_id` → users
- `notification_type` ('service', 'event', 'message', 'system')
- `title`, `content`, `related_id` (FK to service/event)
- `is_read` (boolean)

#### **reviews**
- `id` (UUID, PK)
- `user_id` → users
- `service_id` → services
- `rating` (1-5)
- `comment` (TEXT)

### Security
- **Row Level Security (RLS):** Enabled on all tables
- **Role-based access:** `has_role()` security-definer function for secure role checking
- **Policies:**
  - Users can view all profiles; edit only own
  - Services/events visible based on status and ownership
  - Admin-only data access for management

---

## 📁 Project Structure

```
src/
├── components/
│   ├── Map.tsx                    # Map display component
│   ├── NavLink.tsx                # Navigation link
│   ├── ProfileMenu.tsx            # User profile dropdown
│   ├── ServiceProviderList.tsx    # List of services/events
│   └── ui/                        # shadcn-ui components (30+)
├── hooks/
│   ├── use-mobile.tsx             # Mobile detection
│   └── use-toast.ts               # Toast notifications
├── integrations/
│   └── supabase/
│       ├── client.ts              # Supabase client initialization
│       └── types.ts               # TypeScript types
├── lib/
│   └── utils.ts                   # Utility functions (cn for classnames)
├── pages/
│   ├── Index.tsx                  # Landing page (hero, features, CTA)
│   ├── Splash.tsx                 # Splash/loading screen
│   ├── Login.tsx                  # Login page
│   ├── Signup.tsx                 # Registration page
│   ├── RoleSelection.tsx          # Role selection (youth/vendor/ngo)
│   ├── Onboarding.tsx             # Onboarding flow
│   ├── Dashboard.tsx              # Main user dashboard (map + services)
│   ├── VendorDashboard.tsx        # Vendor management dashboard
│   ├── AdminDashboard.tsx         # Admin panel
│   ├── ServiceProfile.tsx         # Service/opportunity detail
│   └── NotFound.tsx               # 404 page
├── App.tsx                        # Route definitions
├── main.tsx                       # Entry point
├── index.css                      # Global styles
└── App.css                        # App-specific styles
```

---

## 🎯 Current Features

### ✅ Implemented
1. **Landing Page** - Hero section, features, how-it-works, CTA
2. **Authentication Routes** - Login, Signup pages
3. **Role Selection** - Youth, Vendor, NGO options
4. **Dashboard** - Map-based interface with proximity alerts
5. **Service/Event Display** - List components with data fetching
6. **Profile Management** - Profile menu, user data fetching
7. **Responsive Design** - Mobile-first Tailwind CSS styling

### 🚧 In Progress / To-Do
1. **Map Functionality** - Actual geolocation and proximity detection
2. **Form Validation** - Complete auth flows with error handling
3. **Service Management** - Create, edit, delete services
4. **Notifications** - Real-time proximity alerts
5. **Reviews & Ratings** - Vendor rating system
6. **Admin Dashboard** - User management, analytics
7. **Search & Filtering** - Advanced service discovery
8. **Payment Integration** - For premium services
9. **Offline Support** - PWA capabilities

---

## 🔧 Key Development Workflows

### Available Scripts
```bash
npm run dev           # Start dev server (hot reload on :8080)
npm run build        # Production build
npm run build:dev    # Development mode build
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

### Development Setup
```bash
# Install dependencies
npm install          # or: bun install

# Start development
npm run dev

# Watch linting
npm run lint
```

---

## 🔌 Supabase Integration Points

### Authentication
- User creation via `supabase.auth.signUp()`
- User login via `supabase.auth.signIn()`
- Session management via `supabase.auth.getUser()`

### Data Operations
- Querying: `supabase.from('table').select().eq().limit()`
- Creating: `.insert()`
- Updating: `.update().eq()`
- Deleting: `.delete().eq()`
- Joins: Use select with nested queries via foreign keys

### Example Pattern (from Dashboard.tsx)
```typescript
const { data } = await supabase
  .from("services")
  .select(`
    *,
    profiles(full_name),
    vendor_profiles(business_name)
  `)
  .eq("status", "active")
  .order("created_at", { ascending: false })
  .limit(10);
```

---

## 🎨 Design System

### Tailwind CSS Configuration
- **Colors:** Primary, secondary, accent, muted, card, border
- **Spacing:** Standard Tailwind scale
- **Gradients:** `gradient-hero` for brand color
- **Shadows:** `shadow-soft`, `shadow-strong`
- **Animations:** `animate-fade-in`, standard Tailwind animations

### Component Patterns
- Use `cn()` from `@/lib/utils` to merge classNames
- shadcn-ui components follow Radix UI primitives
- Responsive breakpoints: sm, md, lg, xl, 2xl

---

## 📋 Routes & Navigation

```
/                     → Landing page
/splash              → Splash screen
/onboarding          → Onboarding flow
/role-selection      → Choose role (youth/vendor/ngo)
/login               → Login
/signup              → Registration
/dashboard           → Main dashboard (users)
/vendor/dashboard    → Vendor dashboard
/admin/dashboard     → Admin panel
/service/:id         → Service detail page
*                    → 404 Not Found
```

---

## 🚀 Next Steps for Development

### Phase 1: Core Features
1. [ ] Complete authentication flows (signup/login with validation)
2. [ ] Implement geolocation tracking for users
3. [ ] Build service creation form for vendors
4. [ ] Create event posting functionality for NGOs
5. [ ] Implement proximity-based notifications

### Phase 2: Enhanced Features
6. [ ] Real-time map updates with Supabase Realtime
7. [ ] Review and rating system
8. [ ] User search and filtering
9. [ ] Chat/messaging between users and vendors
10. [ ] Payment integration (Stripe/Flutterwave for African markets)

### Phase 3: Platform Features
11. [ ] Analytics dashboard for vendors/admins
12. [ ] Advanced admin controls
13. [ ] Content moderation system
14. [ ] Mobile app (React Native)
15. [ ] Offline-first PWA capabilities

---

## 🔐 Security Checklist

- [ ] Validate all Supabase RLS policies
- [ ] Test authentication edge cases
- [ ] Implement rate limiting
- [ ] Add CORS configuration
- [ ] Verify sensitive data is not exposed in logs
- [ ] Test SQL injection prevention (Supabase handles this)
- [ ] Implement API key rotation
- [ ] Add audit logging for sensitive operations

---

## 📝 Development Notes

### Environment Variables
Create `.env.local`:
```
VITE_SUPABASE_URL=https://nuqzhlzhtzjfzpqgcogd.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

### Code Quality
- ESLint configured with TypeScript support
- React Hooks and Refresh rules enforced
- Use `@` alias for imports from src/
- Type all React components with `React.FC` or function return type

### Common Patterns
- Data fetching: `useEffect` + state + try-catch
- Forms: React Hook Form + Zod for validation
- Notifications: `toast.success()`, `toast.error()` from sonner
- Styling: Combine Tailwind classes with `cn()` utility

---

## 📚 Useful Resources

- [Supabase Docs](https://supabase.com/docs)
- [shadcn-ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Router](https://reactrouter.com/)
- [React Hook Form](https://react-hook-form.com/)
- [Zod Validation](https://zod.dev/)

---

## 🤝 Collaboration Notes

- Code is version controlled via Git
- Push changes to GitHub main branch
- All changes are tracked in commit history

---

**Last Updated:** November 12, 2025
**Project Lead:** DiviTech01
