import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Users, Briefcase, Heart, Activity, LogOut } from "lucide-react";
import { toast } from "sonner";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ users: 0, vendors: 0, ngos: 0, services: 0, events: 0 });
  const [users, setUsers] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [ngos, setNgos] = useState<any[]>([]);

  useEffect(() => {
    checkAdminAccess();
    fetchStats();
    fetchUsers();
    fetchVendors();
    fetchNgos();
  }, []);

  const checkAdminAccess = async () => {
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
  };

  const fetchStats = async () => {
    const [usersCount, vendorsCount, ngosCount, servicesCount, eventsCount] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("vendor_profiles").select("*", { count: "exact", head: true }),
      supabase.from("ngo_profiles").select("*", { count: "exact", head: true }),
      supabase.from("services").select("*", { count: "exact", head: true }),
      supabase.from("events").select("*", { count: "exact", head: true })
    ]);

    setStats({
      users: usersCount.count || 0,
      vendors: vendorsCount.count || 0,
      ngos: ngosCount.count || 0,
      services: servicesCount.count || 0,
      events: eventsCount.count || 0
    });
  };

  const fetchUsers = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);
    setUsers(data || []);
  };

  const fetchVendors = async () => {
    const { data } = await supabase
      .from("vendor_profiles")
      .select("*, profiles(*)")
      .order("created_at", { ascending: false })
      .limit(10);
    setVendors(data || []);
  };

  const fetchNgos = async () => {
    const { data } = await supabase
      .from("ngo_profiles")
      .select("*, profiles(*)")
      .order("created_at", { ascending: false })
      .limit(10);
    setNgos(data || []);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-hero text-white p-4 sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <Button variant="ghost" onClick={handleLogout} className="text-white hover:bg-white/20">
            <LogOut className="h-5 w-5 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Users</CardDescription>
              <CardTitle className="text-3xl">{stats.users}</CardTitle>
            </CardHeader>
            <CardContent>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Vendors</CardDescription>
              <CardTitle className="text-3xl">{stats.vendors}</CardTitle>
            </CardHeader>
            <CardContent>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>NGOs</CardDescription>
              <CardTitle className="text-3xl">{stats.ngos}</CardTitle>
            </CardHeader>
            <CardContent>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Services</CardDescription>
              <CardTitle className="text-3xl">{stats.services}</CardTitle>
            </CardHeader>
            <CardContent>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Events</CardDescription>
              <CardTitle className="text-3xl">{stats.events}</CardTitle>
            </CardHeader>
            <CardContent>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </div>

        {/* Data Tables */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="vendors">Vendors</TabsTrigger>
            <TabsTrigger value="ngos">NGOs</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            {users.map((user) => (
              <Card key={user.id}>
                <CardHeader>
                  <CardTitle>{user.full_name}</CardTitle>
                  <CardDescription>{user.phone}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="vendors" className="space-y-4">
            {vendors.map((vendor) => (
              <Card key={vendor.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{vendor.business_name}</CardTitle>
                      <CardDescription>{vendor.category}</CardDescription>
                    </div>
                    <Badge variant={vendor.verification_status ? "default" : "secondary"}>
                      {vendor.verification_status ? "Verified" : "Pending"}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="ngos" className="space-y-4">
            {ngos.map((ngo) => (
              <Card key={ngo.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{ngo.organization_name}</CardTitle>
                      <CardDescription>{ngo.impact_area}</CardDescription>
                    </div>
                    <Badge variant={ngo.verification_status ? "default" : "secondary"}>
                      {ngo.verification_status ? "Verified" : "Pending"}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
