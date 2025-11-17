import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Map from "@/components/Map";
import ProfileMenu from "@/components/ProfileMenu";
import NotificationBell from '@/components/NotificationBell';
import Sidebar from '@/components/Sidebar';
import ServiceProviderList from "@/components/ServiceProviderList";
import { useGeolocation } from "@/hooks/useGeolocation";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { MapPin, Bell } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const navigate = useNavigate();
  const { location, requestLocation, error: geoError } = useGeolocation();
  const { subscribed, loading: pushLoading, subscribeToPushNotifications, unsubscribeFromPushNotifications } = usePushNotifications();
  type Profile = { id?: string; business_name?: string; location_lat?: number; location_lng?: number };
  // vendor_profiles shape can vary depending on Supabase relation shape
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type ServiceItem = { id?: string; vendor_profiles?: any; description?: string; title?: string; price?: number };
  type EventItem = { id?: string; event_date?: string; event_type?: string; status?: string };
  const [profile, setProfile] = useState<Profile | null>(null);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [showProximityAlert, setShowProximityAlert] = useState(false);
  const [nearbyProvider, setNearbyProvider] = useState<ServiceItem | null>(null);

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

    // Request location permission on dashboard load
    const timer = setTimeout(() => {
      if (!location) {
        requestLocation();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [fetchUserData, location, requestLocation]);

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

  const fetchEvents = useCallback(async () => {
    const { data } = await supabase
      .from("events")
      .select(`
        *,
        profiles(full_name)
      `)
      .in("status", ["upcoming", "ongoing"])
      .order("event_date", { ascending: true })
      .limit(10);

    setEvents(data || []);
  }, []);

  return (
    <div className="min-h-screen w-full bg-background">
      {/* Top header in normal flow so it doesn't overlap the map */}
      <div className="container mx-auto px-4 py-4">
        <div className="bg-card/95 backdrop-blur-sm px-4 py-3 rounded-2xl shadow-lg border border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold">ProxiLink</h1>
              <p className="text-sm text-muted-foreground">{profile?.business_name || 'Vendor'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <NotificationBell />
            <ProfileMenu profile={profile} />
          </div>
        </div>
      </div>

      {/* Sidebar trigger (hamburger) */}
      <Sidebar />

      {/* Fullscreen Map */}
      <div className="w-full h-screen">
        {/* debug: log map render to console without returning a node */}
        {typeof window !== 'undefined' && (() => { console.log('Rendering Map container with profile location:', profile?.location_lat, profile?.location_lng); return null; })()}
        <Map 
          userLocation={profile?.location_lat && profile?.location_lng ? {
            lat: Number(profile.location_lat),
            lng: Number(profile.location_lng)
          } : undefined} 
        />
      </div>

      {/* (Old fixed header removed; notification and profile moved to overlay header) */}

      {/* Proximity Alert - Top Center */}
      {showProximityAlert && nearbyProvider && (
        <Card className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-card/95 backdrop-blur-sm shadow-strong border-primary/20 max-w-sm animate-fade-in">
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Bell className="h-5 w-5 text-primary animate-pulse" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm mb-1">
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
      <ServiceProviderList services={services} events={events} />
    </div>
  );
};

export default Dashboard;
