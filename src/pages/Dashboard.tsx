import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Map from "@/components/Map";
import ProfileMenu from "@/components/ProfileMenu";
import ServiceProviderList from "@/components/ServiceProviderList";
import { MapPin, Bell } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";

const Dashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [showProximityAlert, setShowProximityAlert] = useState(false);
  const [nearbyProvider, setNearbyProvider] = useState<any>(null);

  useEffect(() => {
    fetchUserData();
    fetchServices();
    fetchEvents();
    
    // Simulate proximity alert for demo (in production, use geolocation)
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

  const fetchUserData = async () => {
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
  };

  const fetchServices = async () => {
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
  };

  const fetchEvents = async () => {
    const { data } = await supabase
      .from("events")
      .select(`
        *,
        profiles(full_name),
        ngo_profiles(organization_name)
      `)
      .in("status", ["upcoming", "ongoing"])
      .order("event_date", { ascending: true })
      .limit(10);

    setEvents(data || []);
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-background">
      {/* Full-screen Map */}
      <div className="absolute inset-0">
        <Map 
          userLocation={profile?.location_lat && profile?.location_lng ? {
            lat: Number(profile.location_lat),
            lng: Number(profile.location_lng)
          } : undefined} 
        />
      </div>

      {/* Logo/Brand - Top Left */}
      <div className="fixed top-4 left-4 z-50 bg-card/95 backdrop-blur-sm px-4 py-3 rounded-2xl shadow-lg border border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center">
            <MapPin className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="text-lg font-bold">ProxiLink</h1>
        </div>
      </div>

      {/* Profile Menu - Top Right */}
      <ProfileMenu profile={profile} />

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
