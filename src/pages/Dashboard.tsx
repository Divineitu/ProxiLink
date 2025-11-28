import { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import MapWrapper from "@/components/MapWrapper";
import NotificationBell from '@/components/NotificationBell';
import Sidebar from '@/components/Sidebar';
import ServiceProviderList from "@/components/ServiceProviderList";
import RadiusSlider from "@/components/RadiusSlider";
import { useGeolocation } from "@/hooks/useGeolocation";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { MapPin, Bell } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const { location, requestLocation, error: geoError } = useGeolocation();
  const { subscribed, loading: pushLoading, subscribeToPushNotifications, unsubscribeFromPushNotifications } = usePushNotifications();
  type Profile = { id?: string; business_name?: string; location_lat?: number; location_lng?: number };
  // vendor_profiles shape can vary depending on Supabase relation shape
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type ServiceItem = { id?: string; vendor_profiles?: any; description?: string; title?: string; price?: number };
  const [profile, setProfile] = useState<Profile | null>(null);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [showProximityAlert, setShowProximityAlert] = useState(false);
  const [nearbyProvider, setNearbyProvider] = useState<ServiceItem | null>(null);
  const [shouldExpandProviders, setShouldExpandProviders] = useState(false);
  const [radiusKm, setRadiusKm] = useState(0.01); // Default 10 meters

  const fetchUserData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/login");
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    setProfile(data);
  }, [navigate]);
  
  

  useEffect(() => {
    fetchUserData();

    // check if we need to expand providers list
    if (routerLocation.state?.expandProviders) {
      setShouldExpandProviders(true);
      // clear state so it doesn't keep expanding
      window.history.replaceState({}, document.title);
    }

    // Request location permission on dashboard load
    const timer = setTimeout(() => {
      if (!location) {
        requestLocation();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [fetchUserData, location, requestLocation, routerLocation.state]);

  // Simulate proximity alert for demo (in production, use geolocation)
  useEffect(() => {
    const alertTimer = setTimeout(() => {
      if (services.length > 0) {
        setNearbyProvider(services[0]);
        setShowProximityAlert(true);
        toast.success(`📍 ${services[0].vendor_profiles?.business_name || "A service provider"} is nearby!`, {
          duration: 5000,
        });
      }
    }, 5000);

    return () => clearTimeout(alertTimer);
  }, [services]);

  // Update user location in database when geolocation changes
  useEffect(() => {
    const updateLocationInDatabase = async () => {
      if (location && profile) {
        try {
          await supabase
            .from("profiles")
            .update({
              location_lat: location.lat,
              location_lng: location.lng,
              last_location_update: new Date().toISOString(),
            })
            .eq("id", profile.id);
        } catch (error) {
          console.error("Failed to update location:", error);
        }
      }
    };

    updateLocationInDatabase();
  }, [location, profile]);

  const fetchServices = useCallback(async () => {
    const { data } = await supabase
      .from("services")
      .select(`
        *,
        profiles(full_name),
        vendor_profiles(business_name)
      `)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(10);

    setServices(data || []);
  }, []);

  return (
    <div className="min-h-screen w-full bg-background">
      {/* Floating header over map */}
      <div className="fixed top-0 left-0 right-0 z-50 px-4 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 ml-12 sm:ml-14">
            <img src="/ProxiLink Logo.png" alt="ProxiLink" className="h-8 sm:h-10 w-auto" />
            <h1 className="text-lg sm:text-xl font-bold text-white drop-shadow-lg">ProxiLink</h1>
          </div>
          <NotificationBell />
        </div>
      </div>

      {/* Sidebar trigger (hamburger) */}
      <Sidebar />

      {/* Fullscreen Map */}
      <div className="w-full h-screen">
        <MapWrapper 
          userLocation={profile?.location_lat && profile?.location_lng ? {
            lat: Number(profile.location_lat),
            lng: Number(profile.location_lng)
          } : undefined}
          radiusKm={radiusKm}
        />
      </div>

      {/* Radius Slider - Top Right */}
      <div className="fixed top-20 right-4 z-40 w-56">
        <RadiusSlider value={radiusKm} onChange={setRadiusKm} />
      </div>

      {/* (Old fixed header removed; notification and profile moved to overlay header) */}

      {/* Proximity Alert - Top Center */}
      {showProximityAlert && nearbyProvider && (
        <Card className="fixed top-20 sm:top-4 left-2 right-2 sm:left-1/2 sm:right-auto sm:transform sm:-translate-x-1/2 z-50 bg-card/95 backdrop-blur-sm shadow-strong border-primary/20 max-w-sm mx-auto animate-fade-in">
          <div className="p-3 sm:p-4">
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-primary animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-xs sm:text-sm mb-1">
                  {nearbyProvider.vendor_profiles?.business_name} is nearby!
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {nearbyProvider.description}
                </p>
              </div>
              <button
                onClick={() => setShowProximityAlert(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Service Provider List - Bottom Sheet */}
      <ServiceProviderList 
        services={services} 
        initialExpanded={shouldExpandProviders}
        onExpandChange={() => setShouldExpandProviders(false)}
      />
    </div>
  );
};

export default Dashboard;
