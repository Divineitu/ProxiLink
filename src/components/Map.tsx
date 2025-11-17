import React, { useEffect, useState, useMemo } from 'react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { findNearbyVendorsBackend } from '@/integrations/backend-maps';
import demoVendors from '@/data/demoVendors';
import demoServices from '@/data/demoServices';
import { AlertCircle, Loader2, MapPin, Copy, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapProps {
  userLocation?: { lat: number; lng: number };
  radiusKm?: number;
}

// Vendor shape used across the map components
type Vendor = {
  id: string;
  business_name?: string;
  location_lat?: number;
  location_lng?: number;
  lat?: number;
  lng?: number;
  profiles?: Record<string, unknown>;
  distance?: number;
};

const SimpleMap = ({ location, vendors }: { location: { lat: number; lng: number }; vendors: Vendor[] }) => {
  return (
    <div className="w-full h-full bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 relative overflow-hidden flex items-center justify-center">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(24)].map((_, i) => (
          <div key={`h-${i}`} className="absolute w-full h-px border-t border-gray-400" style={{ top: `${i * 4.16}%` }} />
        ))}
        {[...Array(24)].map((_, i) => (
          <div key={`v-${i}`} className="absolute h-full w-px border-l border-gray-400" style={{ left: `${i * 4.16}%` }} />
        ))}
      </div>

      {/* Gradient circles background */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-300/20 rounded-full blur-3xl" />

      {/* Simplified map representation */}
      <div className="relative w-full h-full flex items-center justify-center">
        {/* User location dot - center */}
        <div className="absolute animate-pulse z-10">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-500 rounded-full shadow-2xl border-4 border-white relative flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-75"></div>
          </div>
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs font-semibold text-blue-700 dark:text-blue-300">
            You are here
          </div>
        </div>

        {/* Vendor markers scattered around */}
        {vendors.slice(0, 8).map((vendor, idx) => {
          const angle = (idx / 8) * Math.PI * 2;
          const radius = 120;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          return (
            <div
              key={vendor.id}
              className="absolute"
              style={{
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
              }}
              title={vendor.business_name}
            >
              <div className="w-6 h-6 bg-gradient-to-br from-red-500 to-red-600 rounded-full shadow-lg border-2 border-white hover:scale-125 transition-transform cursor-pointer relative group">
                <div className="absolute -inset-1 bg-red-400 rounded-full animate-pulse opacity-30"></div>
              </div>
              <div className="absolute top-full mt-1 left-1/2 transform -translate-x-1/2 bg-white dark:bg-slate-900 px-2 py-1 rounded text-xs font-semibold whitespace-nowrap shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {vendor.business_name?.substring(0, 15)}
              </div>
            </div>
          );
        })}

        {/* Connection lines from user to vendors */}
        <svg className="absolute inset-0" width="100%" height="100%" style={{ pointerEvents: 'none' }}>
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          {vendors.slice(0, 4).map((vendor, idx) => {
            const angle = (idx / 8) * Math.PI * 2;
            const radius = 120;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            const centerX = (window.innerWidth || 1000) / 2;
            const centerY = (window.innerHeight || 600) / 2;
            return (
              <line
                key={`line-${vendor.id}`}
                x1={centerX}
                y1={centerY}
                x2={centerX + x}
                y2={centerY + y}
                stroke="url(#lineGradient)"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
            );
          })}
        </svg>
      </div>

      {/* Info Card */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-8 rounded-2xl shadow-2xl max-w-sm border border-white/20 dark:border-slate-700/50">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full">
              <MapPin className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="font-bold text-lg text-gray-900 dark:text-white mb-1">Your Location</p>
          <p className="text-sm text-gray-600 dark:text-gray-300 font-mono">
            {location.lat.toFixed(4)}°, {location.lng.toFixed(4)}°
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            📍 {vendors.length} nearby vendors found
          </p>
          {vendors.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Top Vendors:</p>
              <div className="space-y-1 max-h-20 overflow-y-auto">
                {vendors.slice(0, 3).map((vendor) => (
                  <div key={vendor.id} className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    {vendor.business_name?.substring(0, 20)}...
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-6 left-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 rounded-xl shadow-lg space-y-3 text-sm border border-white/20 dark:border-slate-700/50">
        <div className="font-semibold text-gray-900 dark:text-white mb-2">Map Legend</div>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 bg-gradient-to-br from-blue-600 to-blue-500 rounded-full shadow"></div>
          <span className="text-gray-700 dark:text-gray-300">Your Location</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 bg-gradient-to-br from-red-500 to-red-600 rounded-full shadow"></div>
          <span className="text-gray-700 dark:text-gray-300">Nearby Vendors</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
          <span>📍 Range: ~{Math.round(Math.random() * 3 + 2)}km radius</span>
        </div>
      </div>

      {/* Top-right info */}
      <div className="absolute top-6 right-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-lg shadow-lg text-sm text-gray-700 dark:text-gray-300 border border-white/20 dark:border-slate-700/50">
        <span className="font-semibold">Map View</span> • {vendors.length} vendors
      </div>
    </div>
  );
};

const Map = ({ userLocation, radiusKm = 5 }: MapProps) => {
  const { location, loading, error, requestLocation } = useGeolocation();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [nearbyVendors, setNearbyVendors] = useState<Vendor[]>([]);
  const [mapLoading, setMapLoading] = useState(false);
  const [useLeaflet, setUseLeaflet] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine ?? true : true);

  // Log initialization
  useEffect(() => {
    console.log('=== MAP COMPONENT INITIALIZED (Using Backend API) ===');
    console.log('Backend will handle all Google Maps API calls securely');
  }, []);

  // Listen for online/offline to toggle Leaflet usage
  useEffect(() => {
    const onOnline = () => setUseLeaflet(true);
    const onOffline = () => setUseLeaflet(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  // Debug log when useLeaflet changes
  useEffect(() => {
    console.log('useLeaflet state:', useLeaflet);
  }, [useLeaflet]);

  // Use provided location or geolocation hook result
  const mapLocation = userLocation || location;

  // Fetch vendors on mount
  useEffect(() => {
    const useDemoVendors = import.meta.env.VITE_USE_DEMO_VENDORS === 'true';
    
    if (useDemoVendors) {
      // Convert demo vendors to proper format (demoVendors store coords under `profiles`)
      const formattedVendors = demoVendors.map(v => {
        const profiles = (v as unknown as { profiles?: { location_lat?: number; location_lng?: number } }).profiles;
        return ({
          id: v.id,
          business_name: v.business_name,
          lat: profiles?.location_lat,
          lng: profiles?.location_lng,
        } as Vendor);
      });
      setVendors(formattedVendors);
      console.log('Loaded demo vendors:', formattedVendors.length);
    }
  }, []);

  // Find nearby vendors using backend API when location changes
  useEffect(() => {
    if (!mapLocation || vendors.length === 0) return;

    const fetchNearbyVendors = async () => {
      setMapLoading(true);
      try {
        console.log('Calling backend API to find nearby vendors...');
        const result = await findNearbyVendorsBackend(
          { lat: mapLocation.lat, lng: mapLocation.lng },
          vendors,
          radiusKm
        );

        if (result) {
          console.log(`✅ Backend found ${result.nearbyVendors.length} nearby vendors`);
          setNearbyVendors(result.nearbyVendors);
        } else {
          console.warn('Backend returned null');
          setNearbyVendors([]);
        }
      } catch (err) {
        console.error('Error calling backend API:', err);
        setNearbyVendors([]);
      } finally {
        setMapLoading(false);
      }
    };

    fetchNearbyVendors();
  }, [mapLocation, vendors, radiusKm]);

  // Show error state
  if (error) {
    return (
      <Alert variant="destructive" className="w-full">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={requestLocation}
            className="ml-4 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded"
          >
            Retry
          </button>
        </AlertDescription>
      </Alert>
    );
  }

  // Show location request UI
  if (!mapLocation) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-96 h-96 bg-blue-400 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative text-center space-y-6 max-w-md px-6">
          {loading ? (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 bg-primary/20 rounded-full animate-ping" />
                </div>
                <Loader2 className="h-16 w-16 animate-spin mx-auto text-primary relative z-10" />
              </div>
              <div className="space-y-2">
                <p className="text-xl font-bold">Locating You...</p>
                <p className="text-sm text-muted-foreground">
                  Please allow location access when your browser asks
                </p>
                <div className="bg-card/80 backdrop-blur-sm border border-border rounded-lg p-4 mt-4">
                  <p className="text-xs text-muted-foreground">
                    💡 <strong>Tip:</strong> You may need to click "Allow" on the permission popup at the top of your browser
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <MapPin className="h-10 w-10 text-primary" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Find Vendors Near You</h2>
                <p className="text-muted-foreground">
                  ProxiLink uses your location to show nearby service providers and opportunities
                </p>
              </div>
              <div className="bg-card/80 backdrop-blur-sm border border-border rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3 text-sm text-left">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">1</span>
                  </div>
                  <p className="text-muted-foreground">Click "Enable Location" below</p>
                </div>
                <div className="flex items-start gap-3 text-sm text-left">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">2</span>
                  </div>
                  <p className="text-muted-foreground">Allow location access in your browser</p>
                </div>
                <div className="flex items-start gap-3 text-sm text-left">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">3</span>
                  </div>
                  <p className="text-muted-foreground">Discover nearby vendors on the map!</p>
                </div>
              </div>
              <button
                onClick={async () => {
                  console.log('Location button clicked');
                  try {
                      if (navigator.permissions && navigator.permissions.query) {
                        const p = await navigator.permissions.query({ name: 'geolocation' } as PermissionDescriptor);
                        console.log('Geolocation permission state (before request):', p?.state);
                      }
                  } catch (permErr) {
                    console.warn('Permissions API not available or failed', permErr);
                  }
                  try {
                    requestLocation();
                  } catch (e) {
                    console.error('requestLocation threw error:', e);
                  }
                }}
                className="w-full px-6 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-semibold transition-all hover:shadow-xl active:scale-95 flex items-center justify-center gap-2"
              >
                <MapPin className="h-5 w-5" />
                Enable Location
              </button>
              <div className="mt-3 flex items-center gap-3">
                <button
                  onClick={() => {
                    console.log('Debug Geolocation button clicked');
                    if (!navigator.geolocation) {
                      alert('Geolocation API not available in this browser');
                      return;
                    }
                    navigator.geolocation.getCurrentPosition(
                      (pos) => {
                        const { latitude, longitude } = pos.coords;
                        console.log('Debug geolocation success', pos);
                        alert(`Location: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
                      },
                      (err) => {
                        console.error('Debug geolocation error', err);
                        alert(`Geolocation error: ${err.message} (code ${err.code})`);
                      },
                      { timeout: 10000 }
                    );
                  }}
                  className="px-3 py-2 bg-gray-100 dark:bg-slate-800 border border-border rounded text-xs"
                >
                  Debug Geolocation
                </button>

                <div className="text-xs text-muted-foreground">
                  If you don't see a browser permission prompt, the site may have been denied permission previously. Check your browser's site settings or try in an Incognito window.
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                🔒 Your location is only used to find nearby vendors and is never shared without your permission
              </p>
              {/* Show permission / error hints for debugging */}
              {error && (
                <div className="mt-3 text-xs text-red-600 dark:text-red-300">
                  <strong>Location error:</strong> {error}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  console.log('Map Component rendering with:', {
    hasLocation: !!mapLocation,
    vendorCount: vendors.length,
    nearbyVendorCount: nearbyVendors.length,
    mapLoading,
  });

  // Leaflet default icon fix (ensure markers show)
    try {
      const iconUrl = new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href;
      const iconRetinaUrl = new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href;
      const shadowUrl = new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href;
      const DefaultIcon = L.icon({ iconUrl, iconRetinaUrl, shadowUrl, iconSize: [25, 41], iconAnchor: [12, 41] });
      L.Marker.prototype.options.icon = DefaultIcon;
    } catch (err) {
    console.warn('Leaflet icon setup failed:', err);
  }

  const LeafletMap = ({ location, vendors, onTileError }: { location: { lat: number; lng: number }; vendors: Vendor[]; onTileError: () => void }) => {
    const [map, setMap] = useState<L.Map | null>(null);

    useEffect(() => {
      console.log('LeafletMap mounted');
      return () => {
        console.log('LeafletMap unmounted');
      };
    }, []);

    useEffect(() => {
      if (map && location) {
        map.setView([location.lat, location.lng], 14, { animate: true });
      }
    }, [map, location]);

    useEffect(() => {
      if (!map) return;
      // Add zoom control at top-right to avoid overlapping other UI
      const zoomControl = L.control.zoom({ position: 'topright' });
      zoomControl.addTo(map);
      return () => {
        try { zoomControl.remove(); } catch (e) { /* noop */ }
      };
    }, [map]);

    return (
      <MapContainer
        center={[location.lat, location.lng]}
        zoom={14}
        style={{ width: '100%', height: '100%' }}
        whenCreated={(m) => setMap(m)}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          eventHandlers={{
            tileerror: () => {
              console.warn('Tile load error - switching to offline fallback');
              try { onTileError(); } catch (e) { /* ignore */ }
            }
          }}
        />

        {/* User marker */}
        <Marker position={[location.lat, location.lng]}>
          <Popup>
            <div className="text-sm">
              <div className="font-semibold">You are here</div>
              <div className="text-xs">{location.lat.toFixed(5)}, {location.lng.toFixed(5)}</div>
            </div>
          </Popup>
        </Marker>

        {/* Vendor markers */}
        {vendors.map((v: Vendor) => {
          const profiles = v.profiles as unknown as { location_lat?: number; location_lng?: number };
          const lat = v.location_lat ?? v.lat ?? profiles?.location_lat;
          const lng = v.location_lng ?? v.lng ?? profiles?.location_lng;
          if (!lat || !lng) return null;
          return (
            <CircleMarker
              key={v.id}
              center={[lat, lng]}
              // @ts-expect-error react-leaflet typing: radius prop exists at runtime
              radius={8}
              pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.9 }}
            >
              <Popup>
                <div className="text-sm">
                  <div className="font-semibold">{v.business_name}</div>
                  {v.distance && <div className="text-xs">{v.distance} km</div>}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    );
  };

  // Simplified UI - cleaner map view
  return (
    <div className="w-full h-full relative rounded-lg overflow-hidden border border-border shadow-lg bg-background">
      {/* Main map area - full screen */}
      <div className="absolute inset-0">
        {/* Keep LeafletMap mounted to avoid remount blinking; toggle visibility via CSS */}
        <div className={useLeaflet ? 'absolute inset-0' : 'absolute inset-0 hidden'}>
          <LeafletMap location={mapLocation} vendors={nearbyVendors} onTileError={() => setUseLeaflet(false)} />
        </div>

        {/* Simple fallback overlayed when Leaflet is not in use */}
        <div className={useLeaflet ? 'absolute inset-0 hidden' : 'absolute inset-0'}>
          <SimpleMap location={mapLocation} vendors={nearbyVendors} />
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1100] pointer-events-none">
            <div className="inline-flex items-center gap-2 bg-yellow-50 text-yellow-800 dark:bg-yellow-900/80 dark:text-yellow-200 px-4 py-2 rounded-lg shadow border border-yellow-200">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Offline or tile error detected — using fallback map view</span>
            </div>
          </div>
        </div>
      </div>

      {/* Compact legend - bottom-left */}
      <div className="absolute bottom-4 left-4 z-[1000]">
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3 rounded-xl shadow-lg text-xs border border-white/40 dark:border-slate-700/50 space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm" />
            <span className="text-foreground font-medium">You</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm" />
            <span className="text-foreground font-medium">Vendors ({nearbyVendors.length})</span>
          </div>
        </div>
      </div>

      {/* Re-center button - bottom-right */}
      <div className="absolute bottom-4 right-4 z-[1000]">
        <Button 
          size="sm" 
          className="shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
          onClick={() => {
            const evt = new CustomEvent('proxiPanTo', { detail: mapLocation });
            window.dispatchEvent(evt);
          }}
        >
          <MapPin className="h-4 w-4 mr-1" />
          Center Map
        </Button>
      </div>

      {/* Loading indicator when fetching vendors */}
      {mapLoading && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000]">
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 py-2 rounded-lg shadow-lg border border-white/40 dark:border-slate-700/50 flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-sm font-medium">Finding nearby vendors...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Map;
