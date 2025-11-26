import React, { useEffect, useState, useCallback } from 'react';
import { GoogleMap, useLoadScript, Marker, InfoWindow, Libraries } from '@react-google-maps/api';
import { calculateDistance } from '@/lib/proximity';
import { Loader2 } from 'lucide-react';
import AnimatedMarker from './AnimatedMarker';
import RadarPulse from './RadarPulse';

const libraries: Libraries = ['places'];

interface Vendor {
  id: string;
  business_name?: string;
  category?: string;
  location_lat?: number;
  location_lng?: number;
  lat?: number;
  lng?: number;
  distance?: number;
  profiles?: {
    location_lat?: number;
    location_lng?: number;
  };
}

interface GoogleMapViewProps {
  userLocation: { lat: number; lng: number };
  radiusKm?: number;
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const GoogleMapView = ({ userLocation, radiusKm = 5 }: GoogleMapViewProps) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY || '',
    libraries,
    preventGoogleFontsLoading: false,
  });

  // Log any load errors
  useEffect(() => {
    if (loadError) {
      console.error('Google Maps load error:', loadError);
    }
  }, [loadError]);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Generate vendors around user location
  useEffect(() => {
    if (!userLocation) return;

    // will add vendor fetching from DB later
    setVendors([]);
  }, [userLocation, radiusKm]);

  if (loadError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 p-4">
        <p className="text-red-600 font-semibold mb-2">Error loading Google Maps</p>
        <p className="text-sm text-gray-600 text-center max-w-md">
          {loadError.message || 'Failed to load Google Maps API'}
        </p>
        <p className="text-xs text-gray-500 mt-4 text-center">
          Please check: <br/>
          1. Google Maps JavaScript API is enabled in your Google Cloud Console<br/>
          2. API key is valid and has proper restrictions<br/>
          3. Billing is enabled for the project
        </p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <p className="text-red-600">Google Maps API key not configured</p>
      </div>
    );
  }

  const mapOptions: google.maps.MapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: false, // Removed fullscreen control
    gestureHandling: 'greedy', // Allow one-finger panning on mobile
  };

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={userLocation}
      zoom={14}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={mapOptions}
    >
      {/* Radar pulse from user location */}
      <RadarPulse center={userLocation} maxRadius={radiusKm * 1000} />

      {/* User location marker with pulsing effect */}
      <Marker
        position={userLocation}
        icon={{
          path: google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: '#3B82F6',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 4,
        }}
        title="You are here"
        animation={google.maps.Animation.BOUNCE}
      />

      {/* Animated vendor markers */}
      {vendors.map((vendor, index) => {
        const lat = vendor.lat;
        const lng = vendor.lng;

        if (!lat || !lng) return null;

        return (
          <AnimatedMarker
            key={vendor.id}
            position={{ lat, lng }}
            category={vendor.category}
            title={vendor.business_name}
            onClick={() => setSelectedVendor(vendor)}
            delay={index * 200} // Stagger appearance
          />
        );
      })}

      {/* Info window for selected vendor */}
      {selectedVendor && selectedVendor.lat && selectedVendor.lng && (
        <InfoWindow
          position={{ lat: selectedVendor.lat, lng: selectedVendor.lng }}
          onCloseClick={() => setSelectedVendor(null)}
        >
          <div className="p-2">
            <h3 className="font-semibold text-sm">{selectedVendor.business_name}</h3>
            <p className="text-xs text-gray-600 mt-1">
              {selectedVendor.distance?.toFixed(2)} km away
            </p>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

export default GoogleMapView;
