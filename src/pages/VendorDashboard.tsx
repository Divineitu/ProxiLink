import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import NotificationBell from '@/components/NotificationBell';
import { usePushNotifications } from "@/hooks/usePushNotifications";
import Map from "@/components/Map";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Package, TrendingUp, MapPin, LogOut, BarChart3, Eye, Users, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const VendorDashboard = () => {
  const navigate = useNavigate();
  const { subscribed, loading: pushLoading, subscribeToPushNotifications, unsubscribeFromPushNotifications } = usePushNotifications();
  const [loading, setLoading] = useState(true);
  type VendorService = { id?: string; title?: string; description?: string; status?: string; service_type?: string; price?: number };
  const [services, setServices] = useState<VendorService[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  type VendorProfile = { id?: string; business_name?: string; location_lat?: number; location_lng?: number; category?: string };
  const [vendorProfile, setVendorProfile] = useState<VendorProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'services' | 'map'>('dashboard');

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [price, setPrice] = useState("");
  const [locationLat, setLocationLat] = useState("");
  const [locationLng, setLocationLng] = useState("");

  const fetchServices = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch services");
    } else {
      setServices(data || []);
    }
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      // Add small delay to ensure session is established
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/login");
        return;
      }

      // Check if user has vendor role
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .single();

      // If no role found yet (timing issue), still allow access for new signups
      if (!roleData && !roleError) {
        // No role data, but no error - might be a new user, wait a bit more
        await new Promise(resolve => setTimeout(resolve, 1000));
        const { data: roleData2 } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .single();
        
        if (roleData2?.role !== "vendor") {
          toast.error("Access denied. Vendor role required.");
          navigate("/dashboard");
          setLoading(false);
          return;
        }
      } else if (roleError) {
        toast.error("Access denied. Vendor role required.");
        navigate("/dashboard");
        setLoading(false);
        return;
      } else if (roleData?.role !== "vendor") {
        toast.error("Access denied. Vendor role required.");
        navigate("/dashboard");
        setLoading(false);
        return;
      }

      // Fetch vendor profile
      const { data: profile } = await supabase
        .from("vendor_profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      setVendorProfile(profile);

      // Fetch vendor's services
      fetchServices(session.user.id);
    } catch (error) {
      console.error("Auth check error:", error);
      toast.error("Error loading vendor dashboard");
      navigate("/login");
    } finally {
      setLoading(false);
    }
  }, [fetchServices, navigate]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase.from("services").insert([{
      user_id: session.user.id,
      title,
      description,
      category,
      service_type: serviceType,
      price: price ? parseFloat(price) : null,
      location_lat: parseFloat(locationLat),
      location_lng: parseFloat(locationLng),
      status: "active",
    }]);

    if (error) {
      toast.error("Failed to create service");
    } else {
      toast.success("Service created successfully!");
      setShowCreateForm(false);
      resetForm();
      fetchServices(session.user.id);
    }

    setLoading(false);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory("");
    setServiceType("");
    setPrice("");
    setLocationLat("");
    setLocationLng("");
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const handleToggleStatus = async (serviceId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      const { error } = await supabase
        .from("services")
        .update({ status: newStatus })
        .eq("id", serviceId);

      if (error) throw error;
      toast.success(`Service ${newStatus === "active" ? "activated" : "deactivated"}!`);
      fetchServices((await supabase.auth.getSession()).data.session?.user.id || "");
    } catch (err) {
      toast.error("Failed to update service status");
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    try {
      const { error } = await supabase.from("services").delete().eq("id", serviceId);

      if (error) throw error;
      toast.success("Service deleted successfully!");
      fetchServices((await supabase.auth.getSession()).data.session?.user.id || "");
    } catch (err) {
      toast.error("Failed to delete service");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  const activeServices = services.filter(s => s.status === "active").length;
  const vendorLocation = vendorProfile ? { lat: Number(vendorProfile.location_lat || 6.5244), lng: Number(vendorProfile.location_lng || 3.3792) } : undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="bg-card/80 border-b backdrop-blur-sm sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">ProxiLink Vendor Hub</h1>
              <p className="text-sm text-muted-foreground">{vendorProfile?.business_name || "Vendor"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <Button
              onClick={() => subscribed ? unsubscribeFromPushNotifications() : subscribeToPushNotifications()}
              disabled={pushLoading}
              variant={subscribed ? "default" : "outline"}
              size="sm"
              title={subscribed ? "Disable push notifications" : "Enable push notifications"}
            >
              {pushLoading ? "..." : (subscribed ? "🔔 On" : "🔕 Off")}
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-card/50 border-b sticky top-16 z-30">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 py-2">
            <Button
              variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('dashboard')}
              className="gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </Button>
            <Button
              variant={activeTab === 'services' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('services')}
              className="gap-2"
            >
              <Package className="h-4 w-4" />
              Services
            </Button>
            <Button
              variant={activeTab === 'map' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('map')}
              className="gap-2"
            >
              <MapPin className="h-4 w-4" />
              My Location
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-4xl font-bold">{activeServices}</div>
                      <p className="text-xs text-muted-foreground mt-1">Active right now</p>
                    </div>
                    <Zap className="h-8 w-8 text-blue-500/40" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-4xl font-bold">{services.length}</div>
                      <p className="text-xs text-muted-foreground mt-1">All time</p>
                    </div>
                    <Package className="h-8 w-8 text-green-500/40" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-2xl font-bold line-clamp-1">{vendorProfile?.category || "N/A"}</div>
                      <p className="text-xs text-muted-foreground mt-1">Your specialty</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-purple-500/40" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-orange-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Visibility</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-2xl font-bold">100%</div>
                      <p className="text-xs text-muted-foreground mt-1">Profile complete</p>
                    </div>
                    <Eye className="h-8 w-8 text-orange-500/40" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Business Summary</CardTitle>
                <CardDescription>Overview of your vendor profile</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Business Name</p>
                    <p className="font-semibold">{vendorProfile?.business_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <p className="font-semibold">{vendorProfile?.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge className="mt-1">{services.length > 0 ? 'Active' : 'Setup Required'}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Services Listed</p>
                    <p className="font-semibold">{services.length} services</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Add New Service</CardTitle>
                  <CardDescription>Expand your offerings</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => { setActiveTab('services'); setShowCreateForm(true); }} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Service
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">View on Map</CardTitle>
                  <CardDescription>See your location</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => setActiveTab('map')} variant="outline" className="w-full">
                    <MapPin className="h-4 w-4 mr-2" />
                    View Location
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">My Services</h2>
              <Button onClick={() => setShowCreateForm(!showCreateForm)}>
                <Plus className="h-4 w-4 mr-2" />
                {showCreateForm ? "Cancel" : "Create New Service"}
              </Button>
            </div>

            {/* Create Service Form */}
            {showCreateForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Create New Service</CardTitle>
                  <CardDescription>Add a new service or product to your offerings</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateService} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Service Title</Label>
                        <Input
                          id="title"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="e.g., Professional Photography"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Input
                          id="category"
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          placeholder="e.g., Photography, Catering"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="serviceType">Service Type</Label>
                        <Select value={serviceType} onValueChange={setServiceType}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="service">Service</SelectItem>
                            <SelectItem value="product">Product</SelectItem>
                            <SelectItem value="gig">Gig</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="price">Price (₦)</Label>
                        <Input
                          id="price"
                          type="number"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          placeholder="e.g., 50000"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe your service in detail"
                        rows={4}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="locationLat">Location Latitude</Label>
                        <Input
                          id="locationLat"
                          type="number"
                          step="any"
                          value={locationLat}
                          onChange={(e) => setLocationLat(e.target.value)}
                          placeholder="e.g., 6.5244"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="locationLng">Location Longitude</Label>
                        <Input
                          id="locationLng"
                          type="number"
                          step="any"
                          value={locationLng}
                          onChange={(e) => setLocationLng(e.target.value)}
                          placeholder="e.g., 3.3792"
                          required
                        />
                      </div>
                    </div>

                    <Button type="submit" disabled={loading} className="w-full">
                      {loading ? "Creating..." : "Create Service"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Services List */}
            {services.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No services yet. Create your first service!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => (
                  <Card key={service.id} className={service.status === 'inactive' ? 'opacity-60' : ''}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg line-clamp-2">{service.title}</CardTitle>
                        <Badge variant={service.status === "active" ? "default" : "secondary"} className="shrink-0">
                          {service.status}
                        </Badge>
                      </div>
                      <CardDescription>{service.category}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{service.description}</p>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs text-muted-foreground capitalize">{service.service_type}</span>
                        {service.price && (
                          <span className="text-lg font-bold text-primary">₦{service.price.toLocaleString()}</span>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleStatus(service.id, service.status)}
                          className="w-full"
                        >
                          {service.status === "active" ? "Deactivate" : "Activate"}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteService(service.id)}
                          className="w-full"
                        >
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Map Tab */}
        {activeTab === 'map' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Your Location</h2>
              <Card>
                <CardContent className="p-0">
                  {vendorLocation ? (
                    <div className="h-[500px] rounded-lg overflow-hidden">
                      <Map userLocation={vendorLocation} />
                    </div>
                  ) : (
                    <div className="h-[500px] flex items-center justify-center bg-muted/20">
                      <div className="text-center">
                        <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Location not set</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Location Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Latitude</p>
                    <p className="font-mono text-sm">{vendorProfile?.location_lat || "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Longitude</p>
                    <p className="font-mono text-sm">{vendorProfile?.location_lng || "Not set"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorDashboard;
