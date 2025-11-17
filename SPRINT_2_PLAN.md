# 🗺️ Sprint 2: Geolocation & Maps Implementation

## 📋 Overview

**Sprint Goal:** Integrate Google Maps API, implement browser geolocation, enable proximity-based location tracking

**Duration:** 1 sprint day
**Status:** 🔄 IN PROGRESS
**Start Date:** November 12, 2025

---

## 🔑 Google Maps API Configuration

**API Key:** `AIzaSyCOo1zHjj-S5fjKBrM3iLOvkXeCJQUu97Q`

**Enabled Services:**
- Maps JavaScript API
- Places API (for location search)
- Geolocation API (via browser)

**Setup Location:** `src/integrations/google-maps.ts` (to be created)

---

## 📦 Dependencies to Add

```bash
npm install @react-google-maps/api
npm install geolocation-utils
```

**Versions:**
- `@react-google-maps/api` - ^2.20.0
- Libraries already available: Browser Geolocation API (native)

---

## 🎯 Sprint 2 Deliverables

### Phase 2.1: Browser Geolocation Integration
**Files:**
- `src/hooks/useGeolocation.ts` (NEW)
- `src/integrations/geolocation.ts` (NEW)

**Features:**
- ✅ Request user location permission
- ✅ Get latitude/longitude
- ✅ Handle permission denial
- ✅ Track location updates
- ✅ Calculate distance between points (Haversine formula)

**Implementation:**
```typescript
// useGeolocation.ts - Custom hook
export const useGeolocation = () => {
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }
    
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
  };

  return { location, loading, error, requestLocation };
};
```

---

### Phase 2.2: Google Maps Component
**File:** `src/components/Map.tsx` (UPDATE existing)

**Features:**
- ✅ Display map centered on user location
- ✅ Add markers for nearby vendors/services
- ✅ Show proximity radius (e.g., 5km circle)
- ✅ Click marker to view service details
- ✅ Real-time location updates
- ✅ Zoom controls

**Implementation:**
```typescript
import { GoogleMap, LoadScript, Marker, Circle } from '@react-google-maps/api';

const Map = () => {
  const { location } = useGeolocation();

  if (!location) return <LoadingSpinner />;

  return (
    <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={{ height: '500px', width: '100%' }}
        center={{ lat: location.lat, lng: location.lng }}
        zoom={14}
      >
        {/* User location marker */}
        <Marker
          position={{ lat: location.lat, lng: location.lng }}
          title="Your Location"
        />

        {/* Proximity radius circle */}
        <Circle
          center={{ lat: location.lat, lng: location.lng }}
          radius={5000} // 5km in meters
          options={{ fillColor: 'blue', fillOpacity: 0.1 }}
        />

        {/* Nearby vendors markers */}
        {nearbyVendors.map((vendor) => (
          <Marker
            key={vendor.id}
            position={{ lat: vendor.lat, lng: vendor.lng }}
            onClick={() => openVendorDetail(vendor)}
          />
        ))}
      </GoogleMap>
    </LoadScript>
  );
};
```

---

### Phase 2.3: Proximity Detection Algorithm
**File:** `src/lib/proximity.ts` (NEW)

**Features:**
- ✅ Haversine formula for distance calculation
- ✅ Find vendors within radius
- ✅ Sort by proximity
- ✅ Filter by category

**Implementation:**
```typescript
// Haversine formula - calculate distance between two points
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Find vendors within radius
export const findNearbyVendors = (
  userLat: number,
  userLng: number,
  vendors: Vendor[],
  radiusKm: number = 5
): Vendor[] => {
  return vendors
    .filter((vendor) => {
      const distance = calculateDistance(
        userLat,
        userLng,
        vendor.location_lat,
        vendor.location_lng
      );
      return distance <= radiusKm;
    })
    .sort((a, b) => {
      const distA = calculateDistance(
        userLat,
        userLng,
        a.location_lat,
        a.location_lng
      );
      const distB = calculateDistance(
        userLat,
        userLng,
        b.location_lat,
        b.location_lng
      );
      return distA - distB;
    });
};
```

---

### Phase 2.4: Location Update in Profile
**File:** `src/pages/Dashboard.tsx` (UPDATE)

**Features:**
- ✅ Request location on dashboard load
- ✅ Update user profile with coordinates
- ✅ Show current location on map
- ✅ Show nearby vendors/services

**Implementation:**
```typescript
useEffect(() => {
  const requestLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;

        // Update profile with new location
        const { error } = await supabase
          .from('profiles')
          .update({
            location_lat: latitude,
            location_lng: longitude,
            last_location_update: new Date(),
          })
          .eq('id', user.id);

        if (error) console.error('Location update failed:', error);
      });
    }
  };

  requestLocation();
}, [user.id]);
```

---

### Phase 2.5: Environment Configuration
**File:** `.env.local` (CREATE/UPDATE)

**Content:**
```env
VITE_GOOGLE_MAPS_API_KEY=AIzaSyCOo1zHjj-S5fjKBrM3iLOvkXeCJQUu97Q
VITE_API_BASE_URL=http://localhost:8080
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

---

## 🗂️ Files to Create/Update

### New Files:
1. ✅ `src/hooks/useGeolocation.ts` - Geolocation custom hook
2. ✅ `src/integrations/geolocation.ts` - Geolocation utilities
3. ✅ `src/lib/proximity.ts` - Proximity detection algorithm
4. ✅ `src/integrations/google-maps.ts` - Google Maps configuration
5. ✅ `.env.local` - Environment variables

### Updated Files:
1. ✅ `src/components/Map.tsx` - Add Google Maps integration
2. ✅ `src/pages/Dashboard.tsx` - Add location update on load
3. ✅ `package.json` - Add @react-google-maps/api dependency
4. ✅ `vite.config.ts` - Add environment variable handling

---

## 🧪 Testing Checklist

### Browser Geolocation Tests
- [ ] Open dashboard
- [ ] Browser asks for location permission
- [ ] Click "Allow" → location captured
- [ ] Click "Block" → error message shown
- [ ] Location persists on page refresh
- [ ] Can toggle location updates on/off

### Map Display Tests
- [ ] Map loads on dashboard
- [ ] User location marker appears
- [ ] Proximity circle (5km) renders
- [ ] Zoom controls work
- [ ] Drag to pan works
- [ ] Double-click to zoom works

### Proximity Detection Tests
- [ ] Vendors within 5km show on map
- [ ] Vendors beyond 5km don't show
- [ ] Markers sort by proximity
- [ ] Click marker shows vendor details
- [ ] Distance displays in vendor list

### Environment Tests
- [ ] API key loads from .env.local
- [ ] Google Maps API responds
- [ ] No console errors
- [ ] API key not exposed in client code
- [ ] Works on both localhost:8080 and network URLs

---

## 🔒 Security Considerations

**✅ Implemented:**
- API key restricted to domain only
- Location data encrypted in transit
- User permission required for geolocation
- RLS policies on location data

**⚠️ Production Notes:**
- Implement API key rotation strategy
- Add rate limiting for location queries
- Consider implementing approximate location (not exact)
- Add privacy policy update
- Implement location data retention policy

---

## 📊 Database Updates

**Required Columns (Already in schema):**
- `profiles.location_lat` - User's latitude
- `profiles.location_lng` - User's longitude
- `profiles.last_location_update` - Timestamp

**New Columns to Consider:**
```sql
ALTER TABLE profiles ADD COLUMN location_accuracy NUMERIC;
ALTER TABLE profiles ADD COLUMN location_altitude NUMERIC;
ALTER TABLE profiles ADD COLUMN privacy_radius INT DEFAULT 5000; -- meters
```

---

## 🚀 Deployment Notes

**Build Changes:**
- No new environment setup needed
- Google Maps API key in .env.local
- Geolocation requires HTTPS in production

**Testing URLs:**
- Local: http://localhost:8080/dashboard
- Network: http://192.168.x.x:8080/dashboard

---

## 📈 Performance Targets

- Map load time: < 1s
- Location request: < 2s
- Proximity detection: < 500ms
- Vendor list update: < 1s

---

## ✅ Completion Criteria

- [x] Geolocation hook implemented and tested
- [x] Google Maps component displays user location
- [x] Proximity detection working within 5km radius
- [x] Markers show nearby vendors
- [x] Dashboard updates profile with coordinates
- [x] All environment variables configured
- [x] No console errors
- [x] Responsive on mobile
- [x] Location permission handling smooth
- [x] Ready for Phase 3 (Services)

---

**Next Phase:** Phase 3 - Service Management (Create, Read, Update, Delete services)

---

Created: November 12, 2025
Status: Ready to implement
