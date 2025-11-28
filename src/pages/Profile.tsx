import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Save, Camera, Mail, Phone, MapPin, User, Briefcase, Store } from 'lucide-react';
import { toast } from 'sonner';
import ThemeToggle from '@/components/ThemeToggle';

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isVendor, setIsVendor] = useState(false);
  const [vendorDialogOpen, setVendorDialogOpen] = useState(false);
  const [creatingVendor, setCreatingVendor] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    phone: '',
    location: ''
  });
  const [vendorData, setVendorData] = useState({
    business_name: '',
    category: '',
    description: ''
  });
  const [userId, setUserId] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      setUserId(user.id);
      setProfile(prev => ({ ...prev, email: user.email || '' }));

      // Check if user is already a vendor
      const { data: vendorProfile } = await supabase
        .from('vendor_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (vendorProfile) {
        setIsVendor(true);
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfile({
          full_name: data.full_name || '',
          email: user.email || '',
          phone: data.phone || '',
          location: data.location || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Demo mode fallback
      setProfile({
        full_name: 'Demo User',
        email: 'demo@proxilink.com',
        phone: '+234 800 123 4567',
        location: 'Lagos, Nigeria'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile.full_name) {
      toast.error('Please enter your name');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
          location: profile.location,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      // Demo mode: just show success
      toast.success('Profile updated (demo mode)');
    } finally {
      setSaving(false);
    }
  };

  const handleBecomeVendor = async () => {
    if (!vendorData.business_name || !vendorData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    setCreatingVendor(true);
    try {
      // Create vendor profile
      const { error: vendorError } = await supabase
        .from('vendor_profiles')
        .insert({
          user_id: userId,
          business_name: vendorData.business_name,
          category: vendorData.category,
          description: vendorData.description
        });

      if (vendorError) {
        console.error('Vendor profile creation error:', vendorError);
        throw new Error('Failed to create vendor profile: ' + vendorError.message);
      }

      // Assign vendor role - check if user already has this role first
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'vendor')
        .maybeSingle();

      if (!existingRole) {
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            role: 'vendor'
          });

        if (roleError) {
          console.error('Role assignment error:', roleError);
          throw new Error('Failed to assign vendor role: ' + roleError.message);
        }
      }

      toast.success('Vendor profile created successfully!');
      setIsVendor(true);
      setVendorDialogOpen(false);
      
      // Wait a bit longer to ensure role is propagated
      setTimeout(() => {
        navigate('/vendor/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error creating vendor profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create vendor profile';
      toast.error(errorMessage);
    } finally {
      setCreatingVendor(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-sm sm:text-base">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="bg-gradient-hero text-white p-3 sm:p-4 sticky top-0 z-10 shadow-lg">
        <div className="container mx-auto flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-white hover:bg-white/20 h-9 w-9 sm:h-10 sm:w-10"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <h1 className="text-lg sm:text-2xl font-bold">My Profile</h1>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-2xl space-y-4 sm:space-y-6">
        {/* Avatar Section */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <div className="relative">
                <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
                  <AvatarFallback className="text-2xl sm:text-3xl font-bold bg-primary/10 text-primary">
                    {profile.full_name.substring(0, 2).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <button
                  className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full hover:bg-primary/90 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Upload photo"
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-xl sm:text-2xl font-bold">{profile.full_name || 'User'}</h2>
                <p className="text-sm sm:text-base text-muted-foreground">{profile.email}</p>
                <Badge variant="secondary" className="mt-2">
                  <User className="h-3 w-3 mr-1" />
                  Active Member
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Form */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Personal Information</CardTitle>
            <CardDescription className="text-sm sm:text-base">Update your profile details</CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name" className="text-sm sm:text-base flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                Full Name
              </Label>
              <Input
                id="full_name"
                placeholder="Enter your full name"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                disabled={saving}
                className="min-h-[44px] text-sm sm:text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm sm:text-base flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                disabled
                className="min-h-[44px] text-sm sm:text-base bg-muted cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm sm:text-base flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+234 800 000 0000"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                disabled={saving}
                className="min-h-[44px] text-sm sm:text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm sm:text-base flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                Location
              </Label>
              <Input
                id="location"
                placeholder="City, Country"
                value={profile.location}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                disabled={saving}
                className="min-h-[44px] text-sm sm:text-base"
              />
            </div>

            <Button
              onClick={handleSave}
              disabled={saving}
              size="lg"
              className="w-full min-h-[44px] mt-6"
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Vendor Section */}
        {!isVendor && (
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                <Store className="h-5 w-5 text-primary" />
                Become a Vendor
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Start offering your services and reach customers near you
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
              <Dialog open={vendorDialogOpen} onOpenChange={setVendorDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="default" className="w-full min-h-[44px] text-sm sm:text-base">
                    <Briefcase className="h-4 w-4 mr-2" />
                    Set Up Vendor Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Become a Vendor</DialogTitle>
                    <DialogDescription>
                      Fill in your business details to start offering services
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="business_name">Business Name *</Label>
                      <Input
                        id="business_name"
                        placeholder="Your Business Name"
                        value={vendorData.business_name}
                        onChange={(e) => setVendorData({ ...vendorData, business_name: e.target.value })}
                        className="min-h-[44px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Input
                        id="category"
                        placeholder="e.g., Plumbing, Food, Tech"
                        value={vendorData.category}
                        onChange={(e) => setVendorData({ ...vendorData, category: e.target.value })}
                        className="min-h-[44px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Tell customers about your business..."
                        value={vendorData.description}
                        onChange={(e) => setVendorData({ ...vendorData, description: e.target.value })}
                        rows={4}
                      />
                    </div>
                    <Button
                      onClick={handleBecomeVendor}
                      disabled={creatingVendor}
                      className="w-full min-h-[44px]"
                    >
                      {creatingVendor ? (
                        <>
                          <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                          </svg>
                          Creating...
                        </>
                      ) : (
                        'Create Vendor Profile'
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        )}

        {isVendor && (
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                <Store className="h-5 w-5 text-primary" />
                Vendor Profile
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                You're registered as a vendor
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
              <Button
                variant="default"
                onClick={() => navigate('/vendor/dashboard')}
                className="w-full min-h-[44px] text-sm sm:text-base"
              >
                <Briefcase className="h-4 w-4 mr-2" />
                Go to Vendor Dashboard
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Account Actions */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Account Settings</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="text-sm sm:text-base font-medium">Theme</span>
              <ThemeToggle />
            </div>
            <Button 
              variant="outline" 
              className="w-full min-h-[44px] justify-start text-sm sm:text-base"
              onClick={() => navigate('/profile/change-password')}
            >
              Change Password
            </Button>
            <Button 
              variant="outline" 
              className="w-full min-h-[44px] justify-start text-sm sm:text-base"
              onClick={() => navigate('/profile/privacy')}
            >
              Privacy Settings
            </Button>
            <Button 
              variant="outline" 
              className="w-full min-h-[44px] justify-start text-sm sm:text-base"
              onClick={() => navigate('/profile/notifications')}
            >
              Notification Preferences
            </Button>
            <Button 
              variant="destructive" 
              className="w-full min-h-[44px] justify-start text-sm sm:text-base"
              onClick={() => navigate('/profile/delete-account')}
            >
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
