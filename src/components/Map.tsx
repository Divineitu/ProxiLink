import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface MapProps {
  userLocation?: { lat: number; lng: number };
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

const Map = ({ userLocation }: MapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState('');
  const [isApiKeySet, setIsApiKeySet] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!isApiKeySet || !googleMapsApiKey) return;

    // Load Google Maps script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&callback=initMap`;
    script.async = true;
    script.defer = true;

    window.initMap = () => {
      setIsLoaded(true);
    };

    document.head.appendChild(script);

    return () => {
      const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
      if (existingScript) {
        existingScript.remove();
      }
      delete window.initMap;
    };
  }, [isApiKeySet, googleMapsApiKey]);

  useEffect(() => {
    if (!mapContainer.current || !isLoaded || map.current) return;

    const centerLat = userLocation?.lat || 6.5244;
    const centerLng = userLocation?.lng || 3.3792;

    // Initialize Google Map
    map.current = new window.google.maps.Map(mapContainer.current, {
      center: { lat: centerLat, lng: centerLng },
      zoom: 12,
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
    });

    // Add user location marker if available
    if (userLocation) {
      const userMarker = new window.google.maps.Marker({
        position: { lat: userLocation.lat, lng: userLocation.lng },
        map: map.current,
        title: 'Your Location',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: 'hsl(var(--primary))',
          fillOpacity: 1,
          strokeColor: 'white',
          strokeWeight: 2,
        },
      });

      const userInfoWindow = new window.google.maps.InfoWindow({
        content: '<strong>Your Location</strong>',
      });

      userMarker.addListener('click', () => {
        userInfoWindow.open(map.current, userMarker);
      });
    }

    // Fetch and display services
    const fetchServices = async () => {
      const { data: services } = await supabase
        .from('services')
        .select('*, profiles(*), vendor_profiles(*)')
        .eq('status', 'active');

      services?.forEach((service) => {
        if (service.location_lat && service.location_lng && map.current) {
          const marker = new window.google.maps.Marker({
            position: { lat: Number(service.location_lat), lng: Number(service.location_lng) },
            map: map.current,
            title: service.title,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: 'hsl(var(--trust))',
              fillOpacity: 1,
              strokeColor: 'white',
              strokeWeight: 2,
            },
          });

          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="padding: 8px; max-width: 200px;">
                <h3 style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">${service.title}</h3>
                <p style="font-size: 12px; color: #666; margin-bottom: 4px;">${service.category}</p>
                <p style="font-size: 12px;">${service.description.substring(0, 100)}...</p>
              </div>
            `,
          });

          marker.addListener('click', () => {
            infoWindow.open(map.current, marker);
          });
        }
      });
    };

    // Fetch and display events
    const fetchEvents = async () => {
      const { data: events } = await supabase
        .from('events')
        .select('*, profiles(*)')
        .in('status', ['upcoming', 'ongoing']);

      events?.forEach((event) => {
        if (event.location_lat && event.location_lng && map.current) {
          const marker = new window.google.maps.Marker({
            position: { lat: Number(event.location_lat), lng: Number(event.location_lng) },
            map: map.current,
            title: event.title,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: 'hsl(var(--secondary))',
              fillOpacity: 1,
              strokeColor: 'white',
              strokeWeight: 2,
            },
          });

          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="padding: 8px; max-width: 200px;">
                <h3 style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">${event.title}</h3>
                <p style="font-size: 12px; color: #666; margin-bottom: 4px;">${event.event_type}</p>
                <p style="font-size: 12px;">${event.description.substring(0, 100)}...</p>
              </div>
            `,
          });

          marker.addListener('click', () => {
            infoWindow.open(map.current, marker);
          });
        }
      });
    };

    fetchServices();
    fetchEvents();
  }, [isLoaded, userLocation]);

  const handleApiKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (googleMapsApiKey.trim()) {
      setIsApiKeySet(true);
    }
  };

  if (!isApiKeySet) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center bg-muted/20 rounded-lg border border-border">
        <form onSubmit={handleApiKeySubmit} className="max-w-md w-full p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="google-maps-key">Enter Google Maps API Key</Label>
            <Input
              id="google-maps-key"
              type="text"
              placeholder="AIzaSy..."
              value={googleMapsApiKey}
              onChange={(e) => setGoogleMapsApiKey(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Get your API key from{' '}
              <a
                href="https://console.cloud.google.com/google/maps-apis"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Google Cloud Console
              </a>
            </p>
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            Load Map
          </button>
        </form>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center bg-muted/20 rounded-lg border border-border">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Google Maps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[500px]">
      <div ref={mapContainer} className="absolute inset-0 rounded-lg shadow-lg" />
      <div className="absolute top-4 left-4 bg-background/95 backdrop-blur-sm p-3 rounded-lg shadow-md space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[hsl(var(--primary))]"></div>
          <span className="text-xs">Your Location</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[hsl(var(--trust))]"></div>
          <span className="text-xs">Services</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[hsl(var(--secondary))]"></div>
          <span className="text-xs">Events</span>
        </div>
      </div>
    </div>
  );
};

export default Map;
