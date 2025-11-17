import { supabase } from '@/integrations/supabase/client';

export interface NearbyVendorsResponse {
  userLocation: { lat: number; lng: number };
  userAddress: string;
  radiusKm: number;
  nearbyVendors: {
    id: string;
    business_name?: string;
    location_lat?: number;
    location_lng?: number;
    lat?: number;
    lng?: number;
    profiles?: Record<string, unknown>;
    distance?: number;
  }[];
  count: number;
}

export interface GeocodeResponse {
  success: boolean;
  address?: string;
  location?: { lat: number; lng: number };
  placeId?: string;
  error?: string;
}

/**
 * Find vendors nearby user location using backend calculation
 * This avoids frontend Google Maps library issues
 */
export async function findNearbyVendorsBackend(
  userLocation: { lat: number; lng: number },
  vendors: {
    id: string;
    business_name?: string;
    location_lat?: number;
    location_lng?: number;
    lat?: number;
    lng?: number;
    profiles?: Record<string, unknown>;
    distance?: number;
  }[],
  radiusKm: number = 5
): Promise<NearbyVendorsResponse | null> {
  try {
    const { data, error } = await supabase.functions.invoke('find-nearby-vendors', {
      body: {
        userLocation,
        vendors,
        radiusKm,
      },
    });

    if (error) {
      console.error('Backend nearby vendors error:', error);
      return null;
    }

    return data as NearbyVendorsResponse;
  } catch (error) {
    console.error('Failed to call find-nearby-vendors function:', error);
    return null;
  }
}

/**
 * Geocode an address to coordinates
 */
export async function geocodeAddress(address: string): Promise<GeocodeResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('geocode-address', {
      body: { address },
    });

    if (error) {
      console.error('Backend geocode error:', error);
      return { success: false, error: 'Geocoding failed' };
    }

    return data as GeocodeResponse;
  } catch (error) {
    console.error('Failed to call geocode-address function:', error);
    return { success: false, error: 'Failed to geocode address' };
  }
}

/**
 * Reverse geocode coordinates to address
 */
export async function reverseGeocodeLocation(
  lat: number,
  lng: number
): Promise<GeocodeResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('reverse-geocode', {
      body: { lat, lng },
    });

    if (error) {
      console.error('Backend reverse geocode error:', error);
      return { success: false, error: 'Reverse geocoding failed' };
    }

    return data as GeocodeResponse;
  } catch (error) {
    console.error('Failed to call reverse-geocode function:', error);
    return { success: false, error: 'Failed to reverse geocode' };
  }
}
