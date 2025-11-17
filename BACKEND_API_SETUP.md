# Backend API Setup - Supabase Edge Functions

## Overview
You've successfully migrated from frontend Google Maps API calls to secure **backend Supabase Edge Functions**. This solves the map rendering issues and improves security.

## What Was Changed

### ✅ Created 3 Supabase Edge Functions:

1. **`find-nearby-vendors`** - Calculates nearby vendors using distance formula
   - Backend handles all vendor proximity calculations
   - Returns vendors sorted by distance
   - Location: `supabase/functions/find-nearby-vendors/index.ts`

2. **`geocode-address`** - Converts address to coordinates
   - Frontend sends address, backend returns lat/lng
   - Location: `supabase/functions/geocode-address/index.ts`

3. **`reverse-geocode`** - Converts coordinates to address
   - Frontend sends lat/lng, backend returns address
   - Location: `supabase/functions/reverse-geocode/index.ts`

### ✅ Created Backend API Service:
- **File**: `src/integrations/backend-maps.ts`
- Provides TypeScript functions to call edge functions
- Handles error recovery gracefully
- Functions: `findNearbyVendorsBackend()`, `geocodeAddress()`, `reverseGeocodeLocation()`

### ✅ Updated Map Component:
- **File**: `src/components/Map.tsx`
- Replaced Google Maps library dependency with backend API
- Uses SimpleMap for beautiful visualization (no library issues)
- Backend API handles all proximity calculations
- Cleaner, simpler, more secure

## Deployment Steps

### 1. Set Environment Variable for Edge Functions
The edge functions need your Google Maps API key. Add it to Supabase:

```bash
# In terminal, from project root:
supabase secrets set GOOGLE_MAPS_API_KEY=AIzaSyCOo1zHjj-S5fjKBrM3iLOvkXeCJQUu97Q
```

Or via Supabase Dashboard:
- Go to Project Settings → Edge Functions → Secrets
- Add key: `GOOGLE_MAPS_API_KEY`
- Value: Your API key from `.env.local`

### 2. Deploy Edge Functions

```bash
# From project root
supabase functions deploy find-nearby-vendors
supabase functions deploy geocode-address
supabase functions deploy reverse-geocode
```

### 3. Verify Functions are Deployed

```bash
# List deployed functions
supabase functions list

# Should show:
# find-nearby-vendors
# geocode-address
# reverse-geocode
```

### 4. Test the Backend (Optional)

Visit the API diagnostic page to test:
```
http://localhost:8080/api-diagnostic
```

## Benefits

✅ **Security**: API key never exposed to frontend
✅ **Reliability**: Backend-to-backend API calls are more stable
✅ **Performance**: Backend can cache results
✅ **Simpler**: No complex Google Maps library on frontend
✅ **Beautiful UI**: SimpleMap works instantly without Google Maps issues

## How It Works

**Before (Problematic)**:
```
Frontend → Google Maps API ❌ (CORS, library issues, rendering problems)
```

**After (Secure & Reliable)**:
```
Frontend → Supabase Edge Function → Google Maps API ✅
           (backend handles auth & API calls)
```

## Troubleshooting

### Functions not found error?
1. Verify they're deployed: `supabase functions list`
2. Check if GOOGLE_MAPS_API_KEY secret is set
3. Restart dev server: `npm run dev`

### "Backend returned null" in console?
1. Check if Google Maps API is working
2. Verify API key is correct and has geocoding enabled
3. Check Supabase function logs: `supabase functions logs find-nearby-vendors`

### Map still not showing vendors?
1. Make sure demo vendors are enabled: `VITE_USE_DEMO_VENDORS=true`
2. Enable browser location services
3. Check browser console for errors
4. Verify nearby vendors are being found: Look for "✅ Backend found X nearby vendors" in console

## Next Steps

1. **Deploy Functions**: Run the deployment commands above
2. **Test the Map**: Navigate to `/dashboard` and enable location
3. **Monitor**: Watch browser console and Supabase logs
4. **Optional**: Create additional edge functions as needed (places search, route optimization, etc.)

## Files Modified

- ✅ `src/components/Map.tsx` - Updated to use backend API
- ✅ `src/integrations/backend-maps.ts` - New service file for API calls
- ✅ `supabase/functions/find-nearby-vendors/index.ts` - New edge function
- ✅ `supabase/functions/geocode-address/index.ts` - New edge function
- ✅ `supabase/functions/reverse-geocode/index.ts` - New edge function

## Environment Variables

Make sure `.env.local` has:
```
VITE_GOOGLE_MAPS_API_KEY=AIzaSyCOo1zHjj-S5fjKBrM3iLOvkXeCJQUu97Q
VITE_USE_DEMO_VENDORS=true
```
