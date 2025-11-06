import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Users, Briefcase, Heart } from "lucide-react";

const Signup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Basic info
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"youth" | "vendor" | "ngo">("youth");

  // Role-specific info
  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [impactArea, setImpactArea] = useState("");
  const [description, setDescription] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create profile
        const { error: profileError } = await supabase
          .from("profiles")
          .insert({
            id: authData.user.id,
            full_name: fullName,
            phone: phone,
          });

        if (profileError) throw profileError;

        // Assign role
        const { error: roleError } = await supabase
          .from("user_roles")
          .insert({
            user_id: authData.user.id,
            role: role,
          });

        if (roleError) throw roleError;

        // Create role-specific profile
        if (role === "vendor") {
          const { error } = await supabase.from("vendor_profiles").insert({
            user_id: authData.user.id,
            business_name: businessName,
            category: category,
            description: description,
          });
          if (error) throw error;
        } else if (role === "ngo") {
          const { error } = await supabase.from("ngo_profiles").insert({
            user_id: authData.user.id,
            organization_name: organizationName,
            impact_area: impactArea,
            description: description,
          });
          if (error) throw error;
        }

        toast.success("Account created successfully!");
        
        // Redirect based on role
        if (role === "vendor") {
          navigate("/vendor/dashboard");
        } else if (role === "ngo") {
          navigate("/ngo/dashboard");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-2xl shadow-soft">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-10 h-10 bg-gradient-hero rounded-lg flex items-center justify-center">
              <MapPin className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold">ProxiLink</span>
          </div>
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>
            {step === 1 ? "Choose your role to get started" : "Complete your profile"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-6">
            {step === 1 && (
              <>
                <div className="space-y-4">
                  <Label>Select Your Role</Label>
                  <RadioGroup value={role} onValueChange={(value: any) => setRole(value)}>
                    <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:border-primary">
                      <RadioGroupItem value="youth" id="youth" />
                      <Label htmlFor="youth" className="flex items-center gap-3 cursor-pointer flex-1">
                        <Users className="h-5 w-5 text-primary" />
                        <div>
                          <div className="font-medium">Youth User</div>
                          <div className="text-sm text-muted-foreground">Looking for jobs, gigs, and events</div>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:border-primary">
                      <RadioGroupItem value="vendor" id="vendor" />
                      <Label htmlFor="vendor" className="flex items-center gap-3 cursor-pointer flex-1">
                        <Briefcase className="h-5 w-5 text-secondary" />
                        <div>
                          <div className="font-medium">MSME / Vendor</div>
                          <div className="text-sm text-muted-foreground">Offering services and products</div>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:border-primary">
                      <RadioGroupItem value="ngo" id="ngo" />
                      <Label htmlFor="ngo" className="flex items-center gap-3 cursor-pointer flex-1">
                        <Heart className="h-5 w-5 text-accent" />
                        <div>
                          <div className="font-medium">NGO / Community Organization</div>
                          <div className="text-sm text-muted-foreground">Broadcasting events and campaigns</div>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+234 800 000 0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>

                <Button
                  type="button"
                  className="w-full"
                  onClick={() => setStep(2)}
                >
                  Continue
                </Button>
              </>
            )}

            {step === 2 && (
              <>
                {role === "vendor" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="businessName">Business Name</Label>
                      <Input
                        id="businessName"
                        placeholder="Your Business Name"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        placeholder="e.g., Food, Technology, Fashion"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                      />
                    </div>
                  </>
                )}

                {role === "ngo" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="organizationName">Organization Name</Label>
                      <Input
                        id="organizationName"
                        placeholder="Your Organization Name"
                        value={organizationName}
                        onChange={(e) => setOrganizationName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="impactArea">Impact Area</Label>
                      <Input
                        id="impactArea"
                        placeholder="e.g., Health, Education, Environment"
                        value={impactArea}
                        onChange={(e) => setImpactArea(e.target.value)}
                        required
                      />
                    </div>
                  </>
                )}

                {(role === "vendor" || role === "ngo") && (
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Tell us about your business or organization"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                    />
                  </div>
                )}

                {role === "youth" && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">You're all set! Click below to create your account.</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? "Creating Account..." : "Create Account"}
                  </Button>
                </div>
              </>
            )}
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </div>

          <div className="mt-4 text-center">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
              ← Back to home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
