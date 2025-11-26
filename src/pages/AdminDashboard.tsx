import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Users, Briefcase, Activity, LogOut, Shield, CheckCircle, XCircle, 
  Trash2, MapPin, DollarSign, TrendingUp, AlertTriangle, Eye, Ban,
  BarChart3, PieChart, LineChart 
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { GoogleMap, LoadScript, Marker, InfoWindow } from "@react-google-maps/api";

const AdminDashboard = () => {
  const navigate = useNavigate();
  type UserProfile = { id?: string; full_name?: string; phone?: string; created_at?: string; location_lat?: number; location_lng?: number };
  type VendorProfile = { id?: string; business_name?: string; category?: string; verification_status?: boolean; created_at?: string; user_id?: string };

  const [stats, setStats] = useState({ 
    users: 0, 
    vendors: 0, 
    services: 0, 
    events: 0,
    pendingVendors: 0,
    revenue: 0 
  });
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [vendors, setVendors] = useState<VendorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string; type: 'user' | 'vendor' }>({ 
    open: false, 
    id: '', 
    type: 'user' 
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [vendorCategoryData, setVendorCategoryData] = useState<any[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

  const checkAdminAccess = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/login");
      return;
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    const isAdmin = roles?.some(r => r.role === "admin");
    if (!isAdmin) {
      toast.error("Access denied");
      navigate("/dashboard");
    }
  }, [navigate]);

  const fetchStats = useCallback(async () => {
    const [usersCount, vendorsCount, servicesCount, eventsCount, pendingVendors] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("vendor_profiles").select("*", { count: "exact", head: true }),
      supabase.from("services").select("*", { count: "exact", head: true }),
      supabase.from("events").select("*", { count: "exact", head: true }),
      supabase.from("vendor_profiles").select("*", { count: "exact", head: true }).eq("verification_status", false)
    ]);

    setStats({
      users: usersCount.count || 0,
      vendors: vendorsCount.count || 0,
      services: servicesCount.count || 0,
      events: eventsCount.count || 0,
      pendingVendors: pendingVendors.count || 0,
      revenue: 0 // Placeholder for future payment integration
    });
  }, []);

  const fetchUsers = useCallback(async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);
    setUsers(data || []);
  }, []);

  const fetchVendors = useCallback(async () => {
    const { data } = await supabase
      .from("vendor_profiles")
      .select("*, profiles(*)")
      .order("created_at", { ascending: false })
      .limit(10);
    setVendors(data || []);
  }, []);

  const fetchAnalyticsData = useCallback(async () => {
    // get user growth for last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { data: recentUsers } = await supabase
      .from("profiles")
      .select("created_at")
      .gte("created_at", sevenDaysAgo.toISOString());

    // Group by day
    const growthData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const count = recentUsers?.filter(u => 
        new Date(u.created_at!).toDateString() === date.toDateString()
      ).length || 0;
      return { date: dateStr, users: count };
    });
    setChartData(growthData);

    // get vendor categories
    const { data: allVendors } = await supabase
      .from("vendor_profiles")
      .select("category");

    const categoryMap = new Map<string, number>();
    allVendors?.forEach(v => {
      const cat = v.category || 'Other';
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
    });

    const catData = Array.from(categoryMap.entries()).map(([name, value]) => ({
      name,
      value
    }));
    setVendorCategoryData(catData);
  }, []);

  useEffect(() => {
    const initialize = async () => {
      await checkAdminAccess();
      await Promise.all([fetchStats(), fetchUsers(), fetchVendors(), fetchAnalyticsData()]);
      setLoading(false);
    };
    initialize();
  }, [checkAdminAccess, fetchStats, fetchUsers, fetchVendors, fetchAnalyticsData]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const handleVerifyVendor = async (vendorId: string) => {
    try {
      const { error } = await supabase
        .from("vendor_profiles")
        .update({ verification_status: true })
        .eq("id", vendorId);

      if (error) throw error;

      toast.success("Vendor verified successfully");
      await Promise.all([fetchStats(), fetchVendors()]);
    } catch (error) {
      console.error("Error verifying vendor:", error);
      toast.error("Failed to verify vendor");
    }
  };

  const handleUnverifyVendor = async (vendorId: string) => {
    try {
      const { error } = await supabase
        .from("vendor_profiles")
        .update({ verification_status: false })
        .eq("id", vendorId);

      if (error) throw error;

      toast.success("Vendor verification removed");
      await Promise.all([fetchStats(), fetchVendors()]);
    } catch (error) {
      console.error("Error unverifying vendor:", error);
      toast.error("Failed to remove verification");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userId);

      if (error) throw error;

      toast.success("User deleted successfully");
      setDeleteDialog({ open: false, id: '', type: 'user' });
      await Promise.all([fetchStats(), fetchUsers()]);
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    }
  };

  const handleDeleteVendor = async (vendorId: string) => {
    try {
      const { error } = await supabase
        .from("vendor_profiles")
        .delete()
        .eq("id", vendorId);

      if (error) throw error;

      toast.success("Vendor deleted successfully");
      setDeleteDialog({ open: false, id: '', type: 'vendor' });
      await Promise.all([fetchStats(), fetchVendors()]);
    } catch (error) {
      console.error("Error deleting vendor:", error);
      toast.error("Failed to delete vendor");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-sm sm:text-base">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="bg-gradient-hero text-white p-3 sm:p-4 sticky top-0 z-10 shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Activity className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
            <h1 className="text-lg sm:text-2xl font-bold truncate">Admin Dashboard</h1>
          </div>
          <Button 
            variant="ghost" 
            onClick={handleLogout} 
            className="text-white hover:bg-white/20 min-h-[44px] text-xs sm:text-sm"
            size="sm"
          >
            <LogOut className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="p-3 sm:p-4 pb-2">
              <CardDescription className="text-xs sm:text-sm">Total Users</CardDescription>
              <CardTitle className="text-2xl sm:text-3xl">{stats.users}</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <Users className="h-4 w-4 text-blue-500" />
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="p-3 sm:p-4 pb-2">
              <CardDescription className="text-xs sm:text-sm">Vendors</CardDescription>
              <CardTitle className="text-2xl sm:text-3xl">{stats.vendors}</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <Briefcase className="h-4 w-4 text-purple-500" />
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="p-3 sm:p-4 pb-2">
              <CardDescription className="text-xs sm:text-sm">Services</CardDescription>
              <CardTitle className="text-2xl sm:text-3xl">{stats.services}</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <Activity className="h-4 w-4 text-green-500" />
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="p-3 sm:p-4 pb-2">
              <CardDescription className="text-xs sm:text-sm">Events</CardDescription>
              <CardTitle className="text-2xl sm:text-3xl">{stats.events}</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <MapPin className="h-4 w-4 text-orange-500" />
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow border-yellow-200 bg-yellow-50/50">
            <CardHeader className="p-3 sm:p-4 pb-2">
              <CardDescription className="text-xs sm:text-sm">Pending Approvals</CardDescription>
              <CardTitle className="text-2xl sm:text-3xl">{stats.pendingVendors}</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="p-3 sm:p-4 pb-2">
              <CardDescription className="text-xs sm:text-sm">Revenue</CardDescription>
              <CardTitle className="text-2xl sm:text-3xl">₦{stats.revenue.toLocaleString()}</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </CardContent>
          </Card>
        </div>

        {/* Data Tables */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-auto">
            <TabsTrigger value="users" className="min-h-[44px] text-sm sm:text-base">
              <Users className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Users</span>
              <span className="sm:hidden">Users</span>
            </TabsTrigger>
            <TabsTrigger value="vendors" className="min-h-[44px] text-sm sm:text-base">
              <Briefcase className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Vendors</span>
              <span className="sm:hidden">Vendors</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="min-h-[44px] text-sm sm:text-base">
              <BarChart3 className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Analytics</span>
              <span className="sm:hidden">Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-3 sm:space-y-4 mt-4 sm:mt-6">
            <ScrollArea className="h-[calc(100vh-400px)] sm:h-auto">
              <div className="space-y-3 sm:space-y-4">
                {users.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 sm:py-12 text-center">
                      <Users className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 text-muted-foreground opacity-50" />
                      <p className="text-sm sm:text-base text-muted-foreground">No users found</p>
                    </CardContent>
                  </Card>
                ) : (
                  users.map((user) => (
                    <Card key={user.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="p-3 sm:p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base sm:text-lg truncate">{user.full_name || 'Unnamed User'}</CardTitle>
                            <CardDescription className="text-xs sm:text-sm truncate">{user.phone || 'No phone'}</CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            {user.created_at && (
                              <Badge variant="secondary" className="text-xs whitespace-nowrap hidden sm:inline-flex">
                                {new Date(user.created_at).toLocaleDateString()}
                              </Badge>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toast.info("View user details (Coming soon)")}
                              className="min-h-[36px] min-w-[36px] p-0"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteDialog({ open: true, id: user.id || '', type: 'user' })}
                              className="min-h-[36px] min-w-[36px] p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="vendors" className="space-y-3 sm:space-y-4 mt-4 sm:mt-6">
            <ScrollArea className="h-[calc(100vh-400px)] sm:h-auto">
              <div className="space-y-3 sm:space-y-4">
                {vendors.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 sm:py-12 text-center">
                      <Briefcase className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 text-muted-foreground opacity-50" />
                      <p className="text-sm sm:text-base text-muted-foreground">No vendors found</p>
                    </CardContent>
                  </Card>
                ) : (
                  vendors.map((vendor) => (
                    <Card key={vendor.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="p-3 sm:p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base sm:text-lg truncate">{vendor.business_name || 'Unnamed Business'}</CardTitle>
                            <CardDescription className="text-xs sm:text-sm truncate">{vendor.category || 'Uncategorized'}</CardDescription>
                            {vendor.created_at && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Joined {new Date(vendor.created_at).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={vendor.verification_status ? "default" : "secondary"} className="text-xs whitespace-nowrap">
                              {vendor.verification_status ? "Verified" : "Pending"}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3 flex-wrap">
                          {!vendor.verification_status && (
                            <Button
                              size="sm"
                              onClick={() => handleVerifyVendor(vendor.id || '')}
                              className="min-h-[36px] text-xs"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verify
                            </Button>
                          )}
                          {vendor.verification_status && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUnverifyVendor(vendor.id || '')}
                              className="min-h-[36px] text-xs"
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Unverify
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toast.info("View vendor details (Coming soon)")}
                            className="min-h-[36px] text-xs"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setDeleteDialog({ open: true, id: vendor.id || '', type: 'vendor' })}
                            className="min-h-[36px] text-xs text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </CardHeader>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4 mt-6">
            {/* User Growth Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  User Growth (Last 7 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="users" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Vendor Categories Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Vendors by Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPie>
                    <Pie
                      data={vendorCategoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {vendorCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RechartsPie>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* User Locations Map */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  User Locations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full rounded-lg overflow-hidden">
                  <LoadScript googleMapsApiKey={GOOGLE_MAPS_KEY}>
                    <GoogleMap
                      mapContainerStyle={{ width: '100%', height: '100%' }}
                      center={{ lat: 6.5244, lng: 3.3792 }} // Lagos, Nigeria
                      zoom={11}
                    >
                      {users.filter(u => u.location_lat && u.location_lng).map((user) => (
                        <Marker
                          key={user.id}
                          position={{ lat: user.location_lat!, lng: user.location_lng! }}
                          onClick={() => setSelectedMarker(user.id || null)}
                        >
                          {selectedMarker === user.id && (
                            <InfoWindow onCloseClick={() => setSelectedMarker(null)}>
                              <div>
                                <h3 className="font-bold">{user.full_name || 'User'}</h3>
                                <p className="text-sm text-muted-foreground">{user.phone}</p>
                              </div>
                            </InfoWindow>
                          )}
                        </Marker>
                      ))}
                    </GoogleMap>
                  </LoadScript>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this {deleteDialog.type} and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteDialog.type === 'user') {
                  handleDeleteUser(deleteDialog.id);
                } else {
                  handleDeleteVendor(deleteDialog.id);
                }
              }}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminDashboard;
