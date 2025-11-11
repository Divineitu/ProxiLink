import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface MapProps {
  userLocation?: { lat: number; lng: number };
}

const Map = ({ userLocation }: MapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [isTokenSet, setIsTokenSet] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || !isTokenSet || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    const centerLat = userLocation?.lat || 6.5244;
    const centerLng = userLocation?.lng || 3.3792;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [centerLng, centerLat],
      zoom: 12,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add user location marker if available
    if (userLocation) {
      new mapboxgl.Marker({ color: 'hsl(var(--primary))' })
        .setLngLat([userLocation.lng, userLocation.lat])
        .setPopup(new mapboxgl.Popup().setHTML('<strong>Your Location</strong>'))
        .addTo(map.current);
    }

    // Fetch and display services
    const fetchServices = async () => {
      const { data: services } = await supabase
        .from('services')
        .select('*, profiles(*), vendor_profiles(*)')
        .eq('status', 'active');

      services?.forEach((service) => {
        if (service.location_lat && service.location_lng && map.current) {
          const popup = new mapboxgl.Popup().setHTML(`
            <div class="p-2">
              <h3 class="font-semibold text-sm">${service.title}</h3>
              <p class="text-xs text-muted-foreground">${service.category}</p>
              <p class="text-xs mt-1">${service.description.substring(0, 100)}...</p>
            </div>
          `);

          new mapboxgl.Marker({ color: 'hsl(var(--trust))' })
            .setLngLat([Number(service.location_lng), Number(service.location_lat)])
            .setPopup(popup)
            .addTo(map.current);
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
          const popup = new mapboxgl.Popup().setHTML(`
            <div class="p-2">
              <h3 class="font-semibold text-sm">${event.title}</h3>
              <p class="text-xs text-muted-foreground">${event.event_type}</p>
              <p class="text-xs mt-1">${event.description.substring(0, 100)}...</p>
            </div>
          `);

          new mapboxgl.Marker({ color: 'hsl(var(--secondary))' })
            .setLngLat([Number(event.location_lng), Number(event.location_lat)])
            .setPopup(popup)
            .addTo(map.current);
        }
      });
    };

    fetchServices();
    fetchEvents();

    return () => {
      map.current?.remove();
    };
  }, [isTokenSet, mapboxToken, userLocation]);

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mapboxToken.trim()) {
      setIsTokenSet(true);
    }
  };

  if (!isTokenSet) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center bg-muted/20 rounded-lg border border-border">
        <form onSubmit={handleTokenSubmit} className="max-w-md w-full p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mapbox-token">Enter Mapbox Public Token</Label>
            <Input
              id="mapbox-token"
              type="text"
              placeholder="pk.eyJ1Ijoi..."
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Get your token from{' '}
              <a
                href="https://account.mapbox.com/access-tokens/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Mapbox Account
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
