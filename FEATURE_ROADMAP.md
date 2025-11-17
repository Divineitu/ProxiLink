# ProxiLink - Feature Implementation Roadmap

## 🎯 Core Features Breakdown

---

## Phase 1: Authentication & Onboarding (Weeks 1-2)

### 1.1 User Registration (Signup)
**File:** `src/pages/Signup.tsx`

**Requirements:**
- [ ] Email and password input fields
- [ ] Password strength validation
- [ ] Confirm password field
- [ ] Terms & conditions checkbox
- [ ] Submit to Supabase Auth
- [ ] Create profile record on signup
- [ ] Redirect to role selection

**Implementation Steps:**
```typescript
// 1. Use React Hook Form + Zod for validation
// 2. Call supabase.auth.signUp()
// 3. On success, create profile record in profiles table
// 4. Redirect to /role-selection
```

**Database Operations:**
```sql
-- Triggered after auth.signUp()
INSERT INTO profiles (id, full_name) 
VALUES (auth.uid(), user_input.full_name);
```

---

### 1.2 User Login
**File:** `src/pages/Login.tsx`

**Requirements:**
- [ ] Email and password fields
- [ ] "Remember me" checkbox
- [ ] "Forgot password?" link
- [ ] Submit to Supabase Auth
- [ ] Session persistence
- [ ] Redirect to appropriate dashboard

**Implementation:**
```typescript
// 1. Use supabase.auth.signInWithPassword()
// 2. Check user_roles to determine redirect
// 3. Store session in localStorage
// 4. Redirect to /dashboard or /vendor/dashboard
```

---

### 1.3 Role Selection & Assignment
**File:** `src/pages/RoleSelection.tsx`

**Requirements:**
- [ ] Display 3 role cards: Youth, Vendor, NGO
- [ ] Allow multiple role selection
- [ ] Store roles in user_roles table
- [ ] Create role-specific profile (vendor_profiles or ngo_profiles)
- [ ] Redirect to onboarding or dashboard

**Database Operations:**
```sql
-- Insert user roles
INSERT INTO user_roles (user_id, role) 
VALUES (auth.uid(), 'vendor');

-- Insert vendor profile
INSERT INTO vendor_profiles (user_id, business_name, category)
VALUES (auth.uid(), input.business_name, input.category);
```

---

### 1.4 Onboarding Flow
**File:** `src/pages/Onboarding.tsx`

**Requirements:**
- [ ] Location permission request
- [ ] Profile photo upload
- [ ] Bio/description
- [ ] Service categories (for vendors)
- [ ] Impact areas (for NGOs)
- [ ] Skip option for optional fields

**Implementation:**
```typescript
// 1. Request location permissions via Geolocation API
// 2. Get location coordinates
// 3. Update profile with location_lat, location_lng
// 4. Handle image upload to Supabase Storage
// 5. Redirect to dashboard on completion
```

---

## Phase 2: Geolocation & Map (Weeks 3-4)

### 2.1 Geolocation Service
**File:** `src/lib/geolocation.ts` (NEW)

**Requirements:**
- [ ] Request user permission
- [ ] Get current coordinates
- [ ] Watch for position changes
- [ ] Handle errors gracefully
- [ ] Cache location data

**Implementation:**
```typescript
export const getLocation = (): Promise<GeolocationCoordinates> => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position.coords),
      (error) => reject(error)
    );
  });
};

export const watchLocation = (
  callback: (coords: GeolocationCoordinates) => void
) => {
  return navigator.geolocation.watchPosition(
    (position) => callback(position.coords)
  );
};
```

---

### 2.2 Map Component Enhancement
**File:** `src/components/Map.tsx`

**Requirements:**
- [ ] Integrate Google Maps or Mapbox
- [ ] Display user location
- [ ] Show nearby services/events as markers
- [ ] Cluster markers at zoom levels
- [ ] Interactive popups for service details
- [ ] Click handlers for service selection

**Features:**
- User marker (blue circle)
- Service markers (red pins)
- Event markers (green pins)
- Proximity radius visualization
- Pan to location button

---

### 2.3 Proximity Detection Algorithm
**File:** `src/lib/proximity.ts` (NEW)

**Requirements:**
- [ ] Calculate distance using Haversine formula
- [ ] Filter services within radius
- [ ] Sort by distance
- [ ] Batch updates

**Implementation:**
```typescript
// Haversine formula for distance calculation
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const filterNearbyServices = (
  userLocation: Coordinates,
  services: Service[],
  radiusKm: number = 5
): Service[] => {
  return services
    .map(service => ({
      ...service,
      distance: calculateDistance(
        userLocation.lat,
        userLocation.lng,
        service.location_lat,
        service.location_lng
      )
    }))
    .filter(s => s.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance);
};
```

---

## Phase 3: Service Management (Weeks 5-6)

### 3.1 Service Creation Form
**File:** `src/pages/VendorDashboard.tsx` → New component `CreateServiceForm.tsx`

**Requirements:**
- [ ] Title field (required, min 5 chars)
- [ ] Description field (required, min 20 chars)
- [ ] Category dropdown
- [ ] Service type (job/service/product)
- [ ] Price field (optional)
- [ ] Location (auto-filled or map picker)
- [ ] Radius field (default 5km)
- [ ] Image upload
- [ ] Submit button

**Form Validation:**
```typescript
const serviceSchema = z.object({
  title: z.string().min(5, "At least 5 characters"),
  description: z.string().min(20, "At least 20 characters"),
  category: z.string().nonempty("Select a category"),
  service_type: z.enum(['job', 'service', 'product']),
  price: z.number().optional(),
  location_lat: z.number(),
  location_lng: z.number(),
  radius_meters: z.number().default(5000),
});
```

**Database Operation:**
```sql
INSERT INTO services (
  user_id, title, description, category, service_type,
  location_lat, location_lng, radius_meters, status
) VALUES (
  auth.uid(), ?, ?, ?, ?,
  ?, ?, 5000, 'active'
);
```

---

### 3.2 Service Discovery & Search
**File:** `src/components/ServiceProviderList.tsx` (Enhancement)

**Requirements:**
- [ ] Display services in cards
- [ ] Filter by category
- [ ] Sort by distance
- [ ] Search by title/description
- [ ] Pagination or infinite scroll
- [ ] Refresh button

**Implementation:**
```typescript
// Fetch services with filters
const fetchServices = async (
  filters: {
    category?: string;
    search?: string;
    maxDistance?: number;
  }
) => {
  let query = supabase
    .from('services')
    .select('*, vendor_profiles(*)')
    .eq('status', 'active');
  
  if (filters.category) {
    query = query.eq('category', filters.category);
  }
  
  if (filters.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
    );
  }
  
  const { data } = await query.order('created_at', { ascending: false });
  return data;
};
```

---

### 3.3 Service Detail Page
**File:** `src/pages/ServiceProfile.tsx`

**Requirements:**
- [ ] Full service details
- [ ] Vendor profile information
- [ ] Star rating and reviews
- [ ] Distance to user
- [ ] "Contact Vendor" button
- [ ] "Save for later" option
- [ ] Share button

**Data Fetching:**
```typescript
// Get service with vendor info and reviews
const { data: service } = await supabase
  .from('services')
  .select(`
    *,
    vendor_profiles(*),
    profiles(*),
    reviews(*)
  `)
  .eq('id', serviceId)
  .single();
```

---

## Phase 4: Reviews & Ratings (Week 7)

### 4.1 Review Submission
**File:** `src/components/ReviewForm.tsx` (NEW)

**Requirements:**
- [ ] Star rating (1-5)
- [ ] Comment field (optional, max 500 chars)
- [ ] Submit button
- [ ] Form validation

**Implementation:**
```typescript
const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().max(500).optional(),
});

const submitReview = async (review: ReviewInput) => {
  const { error } = await supabase
    .from('reviews')
    .insert({
      user_id: userId,
      service_id: serviceId,
      rating: review.rating,
      comment: review.comment,
    });
};
```

---

### 4.2 Review Display
**File:** `src/components/ReviewList.tsx` (NEW)

**Requirements:**
- [ ] Display reviews in chronological order
- [ ] Show rating stars
- [ ] Show reviewer name and avatar
- [ ] Show review date
- [ ] Calculate average rating
- [ ] Pagination for reviews

---

## Phase 5: Notifications (Week 8)

### 5.1 Proximity Notifications
**File:** `src/hooks/useProximityNotifications.ts` (NEW)

**Requirements:**
- [ ] Monitor user location changes
- [ ] Compare with nearby services
- [ ] Trigger notifications when service enters proximity
- [ ] Store notification in database
- [ ] Toast notification UI

**Implementation:**
```typescript
export const useProximityNotifications = () => {
  useEffect(() => {
    const unsubscribe = watchLocation(async (coords) => {
      const { data: services } = await supabase
        .from('services')
        .select('*')
        .eq('status', 'active');
      
      services?.forEach(service => {
        const distance = calculateDistance(
          coords.latitude,
          coords.longitude,
          service.location_lat,
          service.location_lng
        );
        
        if (distance <= service.radius_meters / 1000) {
          // Create notification
          supabase.from('notifications').insert({
            user_id: userId,
            notification_type: 'service',
            title: `${service.title} nearby!`,
            content: service.description,
            related_id: service.id,
          });
          
          // Toast
          toast.success(`📍 ${service.title} is nearby!`);
        }
      });
    });
    
    return () => unsubscribe();
  }, []);
};
```

---

### 5.2 Notification Center
**File:** `src/pages/NotificationCenter.tsx` (NEW)

**Requirements:**
- [ ] List all notifications
- [ ] Mark as read/unread
- [ ] Delete notifications
- [ ] Filter by type
- [ ] Real-time updates via Supabase subscriptions

---

## Phase 6: Vendor Dashboard (Week 9)

### 6.1 Vendor Dashboard Layout
**File:** `src/pages/VendorDashboard.tsx`

**Requirements:**
- [ ] Service list with status indicators
- [ ] Quick stats (active services, views, earnings)
- [ ] Create service button
- [ ] Edit service modal
- [ ] Delete service confirmation
- [ ] Analytics section

**Stats to Display:**
- Total services posted
- Active services count
- Total views this month
- Pending reviews
- Average rating

---

### 6.2 Vendor Analytics
**File:** `src/components/VendorAnalytics.tsx` (NEW)

**Requirements:**
- [ ] Views over time (chart)
- [ ] Conversions/contacts (chart)
- [ ] Popular services (bar chart)
- [ ] Geographic distribution (map)
- [ ] Time period selector

**Database Query:**
```sql
-- Views per service
SELECT 
  service_id,
  COUNT(*) as views,
  DATE_TRUNC('day', viewed_at) as date
FROM service_views
WHERE user_id = auth.uid()
GROUP BY service_id, date
ORDER BY date DESC;
```

---

## Phase 7: Admin Dashboard (Week 10)

### 7.1 User Management
**File:** `src/pages/AdminDashboard.tsx`

**Requirements:**
- [ ] List all users
- [ ] Filter by role
- [ ] Verify/unverify vendors
- [ ] Suspend/ban users
- [ ] View user details
- [ ] Send messages

---

### 7.2 Content Moderation
**File:** `src/components/ModerationPanel.tsx` (NEW)

**Requirements:**
- [ ] Flag inappropriate services
- [ ] Flag inappropriate events
- [ ] Review flagged content
- [ ] Approve/reject content
- [ ] Temporary/permanent bans

---

## Phase 8: Advanced Features (Ongoing)

### 8.1 Messaging System
**Files:**
- `src/pages/Messages.tsx` (NEW)
- `src/components/ChatWindow.tsx` (NEW)
- `src/hooks/useMessages.ts` (NEW)

**Requirements:**
- [ ] Direct messages between users and vendors
- [ ] Message history
- [ ] Typing indicators
- [ ] Message notifications
- [ ] Conversation list

**Database Table (New Migration):**
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES auth.users(id),
  recipient_id UUID REFERENCES auth.users(id),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now()
);
```

---

### 8.2 Payment Integration
**Files:**
- `src/pages/Checkout.tsx` (NEW)
- `src/integrations/payments/stripe.ts` (NEW)
- `src/integrations/payments/flutterwave.ts` (NEW)

**Requirements:**
- [ ] Payment processing
- [ ] Order history
- [ ] Invoice generation
- [ ] Refunds

---

### 8.3 PWA & Offline Support
**Files:**
- `public/manifest.json` (NEW)
- `src/service-worker.ts` (NEW)

**Requirements:**
- [ ] App install prompt
- [ ] Offline page caching
- [ ] Background sync
- [ ] Push notifications

---

## Implementation Priority Matrix

| Priority | Feature | Impact | Effort | Weeks |
|----------|---------|--------|--------|-------|
| 🔴 P0 | Auth & Role Selection | High | High | 2 |
| 🔴 P0 | Geolocation & Map | High | High | 2 |
| 🔴 P0 | Service CRUD | High | Medium | 2 |
| 🟡 P1 | Reviews & Ratings | Medium | Low | 1 |
| 🟡 P1 | Notifications | Medium | Medium | 1 |
| 🟡 P1 | Vendor Dashboard | Medium | Medium | 1 |
| 🟢 P2 | Admin Dashboard | Low | High | 1 |
| 🟢 P2 | Messaging | Low | High | 2 |
| 🟢 P2 | Payments | Low | High | 2 |
| 🟢 P2 | PWA | Low | Medium | 1 |

---

## Testing Checklist

For each feature:
- [ ] Unit tests written
- [ ] Integration tests written
- [ ] Manual testing on desktop
- [ ] Manual testing on mobile
- [ ] Accessibility checks (a11y)
- [ ] Performance profiling
- [ ] Security review

---

## Deployment Checklist

Before each release:
- [ ] All tests passing
- [ ] Linting passes
- [ ] Build succeeds
- [ ] Environment variables set
- [ ] Database backups made
- [ ] Staging environment tested
- [ ] Production deployment plan reviewed

---

**Last Updated:** November 12, 2025
**Current Phase:** Phase 1 - Authentication
**Estimated Total Duration:** 10 weeks
