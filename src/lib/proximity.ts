/**
 * Proximity Detection & Distance Calculation Utilities
 * Implements Haversine formula for accurate geographic distance calculation
 */

export interface LocationPoint {
  lat: number;
  lng: number;
}

export interface Vendor {
  id: string;
  business_name: string;
  location_lat: number;
  location_lng: number;
  category?: string;
  distance?: number; // in km
}

/**
 * Calculate distance between two geographic points using Haversine formula
 * @param lat1 First point latitude
 * @param lng1 First point longitude
 * @param lat2 Second point latitude
 * @param lng2 Second point longitude
 * @returns Distance in kilometers
 */
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371; // Earth's radius in kilometers

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

/**
 * Convert degrees to radians
 */
const toRad = (deg: number): number => {
  return (deg * Math.PI) / 180;
};

/**
 * Find all vendors within a specific radius
 * @param userLocation User's current location
 * @param vendors List of vendors with locations
 * @param radiusKm Search radius in kilometers (default: 5km)
 * @returns Filtered list of vendors within radius, sorted by distance
 */
export const findNearbyVendors = (
  userLocation: LocationPoint,
  vendors: Vendor[],
  radiusKm: number = 5
): Vendor[] => {
  return vendors
    .map((vendor) => ({
      ...vendor,
      distance: calculateDistance(
        userLocation.lat,
        userLocation.lng,
        vendor.location_lat,
        vendor.location_lng
      ),
    }))
    .filter((vendor) => vendor.distance! <= radiusKm)
    .sort((a, b) => (a.distance || 0) - (b.distance || 0));
};

/**
 * Find vendors by category within radius
 * @param userLocation User's current location
 * @param vendors List of vendors
 * @param category Filter by category
 * @param radiusKm Search radius
 * @returns Filtered vendors
 */
export const findVendorsByCategory = (
  userLocation: LocationPoint,
  vendors: Vendor[],
  category: string,
  radiusKm: number = 5
): Vendor[] => {
  return findNearbyVendors(
    userLocation,
    vendors.filter((v) => v.category === category),
    radiusKm
  );
};

/**
 * Get vendors sorted by distance
 * @param userLocation User's current location
 * @param vendors List of vendors
 * @returns Vendors sorted by distance
 */
export const sortVendorsByDistance = (
  userLocation: LocationPoint,
  vendors: Vendor[]
): Vendor[] => {
  return vendors
    .map((vendor) => ({
      ...vendor,
      distance: calculateDistance(
        userLocation.lat,
        userLocation.lng,
        vendor.location_lat,
        vendor.location_lng
      ),
    }))
    .sort((a, b) => (a.distance || 0) - (b.distance || 0));
};

/**
 * Check if vendor is within radius
 * @param userLocation User's location
 * @param vendor Vendor location
 * @param radiusKm Radius in kilometers
 * @returns True if vendor is within radius
 */
export const isVendorInRadius = (
  userLocation: LocationPoint,
  vendor: Vendor,
  radiusKm: number = 5
): boolean => {
  const distance = calculateDistance(
    userLocation.lat,
    userLocation.lng,
    vendor.location_lat,
    vendor.location_lng
  );
  return distance <= radiusKm;
};

/**
 * Format distance for display
 * @param distanceKm Distance in kilometers
 * @returns Formatted string (e.g., "2.5 km", "500 m")
 */
export const formatDistance = (distanceKm: number): string => {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
};

/**
 * Get vendors within a bounding box
 * Useful for map view calculations
 */
export const getVendorsInBounds = (
  vendors: Vendor[],
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }
): Vendor[] => {
  return vendors.filter(
    (vendor) =>
      vendor.location_lat <= bounds.north &&
      vendor.location_lat >= bounds.south &&
      vendor.location_lng <= bounds.east &&
      vendor.location_lng >= bounds.west
  );
};

/**
 * Calculate center point between multiple locations
 * Useful for centering map on multiple vendors
 */
export const calculateCenter = (locations: LocationPoint[]): LocationPoint => {
  if (locations.length === 0) {
    return { lat: 0, lng: 0 };
  }

  const totalLat = locations.reduce((sum, loc) => sum + loc.lat, 0);
  const totalLng = locations.reduce((sum, loc) => sum + loc.lng, 0);

  return {
    lat: totalLat / locations.length,
    lng: totalLng / locations.length,
  };
};
