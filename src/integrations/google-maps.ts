/**
 * Google Maps Configuration
 * Handles API key and Google Maps utilities
 */

export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export const GOOGLE_MAPS_CONFIG = {
  apiKey: GOOGLE_MAPS_API_KEY,
  version: '3.54',
  libraries: ['places', 'geometry'] as const,
};

/**
 * Validate that Google Maps API key is configured
 */
export const validateGoogleMapsApiKey = (): boolean => {
  if (!GOOGLE_MAPS_API_KEY) {
    console.error(
      'Google Maps API Key is not configured. Please set VITE_GOOGLE_MAPS_API_KEY in .env.local'
    );
    return false;
  }
  return true;
};

/**
 * Common map styling options
 */
export const MAP_STYLES = {
  container: {
    width: '100%',
    height: '500px',
  },
  containerSmall: {
    width: '100%',
    height: '300px',
  },
  mapOptions: {
    zoom: 14,
    minZoom: 3,
    maxZoom: 20,
    mapTypeId: 'roadmap' as const,
    streetViewControl: true,
    mapTypeControl: true,
    fullscreenControl: true,
    zoomControl: true,
  },
};

/**
 * Marker icons for different vendor types
 */
export const MARKER_ICONS = {
  user: {
    url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
    scaledSize: { width: 32, height: 32 },
  },
  vendor: {
    url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
    scaledSize: { width: 32, height: 32 },
  },
  ngo: {
    url: 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
    scaledSize: { width: 32, height: 32 },
  },
};

/**
 * Proximity circle options
 */
export const PROXIMITY_CIRCLE_OPTIONS = {
  fillColor: '#2563eb', // Blue
  fillOpacity: 0.1,
  strokeColor: '#2563eb',
  strokeOpacity: 0.3,
  strokeWeight: 2,
};

/**
 * Info window configuration
 */
export const INFO_WINDOW_OPTIONS = {
  maxWidth: 300,
};
