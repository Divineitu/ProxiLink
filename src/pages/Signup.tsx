import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";

const Signup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("");
  
  // Role-specific fields
  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [impactArea, setImpactArea] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const role = searchParams.get("role");
    if (role) {
      setSelectedRole(role);
    } else {
      navigate("/role-selection");
    }
  }, [searchParams, navigate]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/`;
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: redirectUrl
        },
      });

      if (signUpError) throw signUpError;

      if (authData.user) {
        // Create profile
        const { error: profileError } = await supabase.from("profiles").insert({
          id: authData.user.id,
          full_name: fullName,
          phone: phone,
        });

        if (profileError) throw profileError;

        // Assign role
        const { error: roleError } = await supabase.from("user_roles").insert([{
          user_id: authData.user.id,
          role: selectedRole as any,
        }]);

        if (roleError) throw roleError;

        // Create role-specific profile
        if (selectedRole === "vendor") {
          const { error } = await supabase.from("vendor_profiles").insert({
            user_id: authData.user.id,
            business_name: businessName || fullName,
            category: category || "general",
            description: description,
          });
          if (error) throw error;
        } else if (selectedRole === "ngo") {
          const { error } = await supabase.from("ngo_profiles").insert({
            user_id: authData.user.id,
            organization_name: organizationName || fullName,
            impact_area: impactArea || "community",
            description: description,
          });
          if (error) throw error;
        }

        toast.success("Account created successfully!");
        
        // Redirect based on role
        if (selectedRole === "vendor") {
          navigate("/vendor/dashboard");
        } else if (selectedRole === "ngo") {
          navigate("/ngo/dashboard");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = () => {
    const roleMap: Record<string, { label: string; color: string }> = {
      user: { label: "User", color: "bg-primary" },
      vendor: { label: "Vendor", color: "bg-secondary" },
      ngo: { label: "NGO", color: "bg-accent" }
    };
    return roleMap[selectedRole] || roleMap.user;
  };

  const role = getRoleBadge();

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-hero rounded-lg flex items-center justify-center">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold">ProxiLink</span>
          </div>
          <div className="flex items-center justify-between">
            <CardTitle>Create Account</CardTitle>
            <Badge className={role.color}>{role.label}</Badge>
          </div>
          <CardDescription>Sign up to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+234 800 000 0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {/* Role-specific fields */}
            {selectedRole === "vendor" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    placeholder="Your Business"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    placeholder="e.g., Food, Tech, Fashion"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Tell us about your business"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>
              </>
            )}

            {selectedRole === "ngo" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="organizationName">Organization Name</Label>
                  <Input
                    id="organizationName"
                    placeholder="Your Organization"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="impactArea">Impact Area</Label>
                  <Input
                    id="impactArea"
                    placeholder="e.g., Health, Education"
                    value={impactArea}
                    onChange={(e) => setImpactArea(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Tell us about your organization"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>
              </>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Sign Up"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm space-y-2">
            <button
              onClick={() => navigate("/role-selection")}
              className="text-muted-foreground hover:text-foreground block w-full"
            >
              Change role
            </button>
            <div>
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
