import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Briefcase, Calendar, Bell, LogOut, User, Search } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

const Dashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchUserData();
    fetchServices();
    fetchEvents();
    fetchNotifications();
  }, []);

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

  const fetchNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    setNotifications(data || []);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const filteredServices = services.filter(service =>
    service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.event_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-hero rounded-lg flex items-center justify-center">
                <MapPin className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">ProxiLink</h1>
                <p className="text-sm text-muted-foreground">Youth Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => navigate("/profile")}>
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {profile?.full_name}!</h2>
          <p className="text-muted-foreground">Discover opportunities and events happening around you</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for jobs, services, or events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Notifications */}
        {notifications.length > 0 && (
          <Card className="mb-6 bg-accent/10 border-accent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Recent Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notifications.slice(0, 3).map((notif) => (
                  <div key={notif.id} className="flex items-start gap-3 p-3 bg-card rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{notif.title}</p>
                      <p className="text-sm text-muted-foreground">{notif.content}</p>
                    </div>
                    {!notif.is_read && (
                      <Badge variant="default" className="bg-primary">New</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs for Services and Events */}
        <Tabs defaultValue="services" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="services">
              <Briefcase className="h-4 w-4 mr-2" />
              Jobs & Services
            </TabsTrigger>
            <TabsTrigger value="events">
              <Calendar className="h-4 w-4 mr-2" />
              Events
            </TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="space-y-4">
            {filteredServices.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No services found nearby</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {filteredServices.map((service) => (
                  <Card key={service.id} className="hover:shadow-soft transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl">{service.title}</CardTitle>
                          <CardDescription>
                            by {service.vendor_profiles?.business_name || service.profiles?.full_name}
                          </CardDescription>
                        </div>
                        <Badge>{service.service_type}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">{service.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <Badge variant="outline">{service.category}</Badge>
                        {service.price && (
                          <span className="font-medium text-primary">₦{service.price}</span>
                        )}
                      </div>
                      <Button className="w-full mt-4" variant="outline">View Details</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="events" className="space-y-4">
            {filteredEvents.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No events scheduled nearby</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {filteredEvents.map((event) => (
                  <Card key={event.id} className="hover:shadow-soft transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl">{event.title}</CardTitle>
                          <CardDescription>
                            by {event.ngo_profiles?.organization_name || event.profiles?.full_name}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary">{event.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">{event.description}</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{new Date(event.event_date).toLocaleDateString()}</span>
                        </div>
                        <Badge variant="outline">{event.event_type}</Badge>
                      </div>
                      <Button className="w-full mt-4">Register for Event</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
