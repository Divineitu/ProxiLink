import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Save, Store, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const VendorSettings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [vendorData, setVendorData] = useState({
    business_name: '',
    category: '',
    description: '',
    phone: '',
    location_lat: '',
    location_lng: '',
    is_active: true
  });
  const [vendorId, setVendorId] = useState('');

  const categories = [
    'Plumbing',
    'Electrical',
    'Carpentry',
    'Cleaning',
    'Catering',
    'Photography',
    'Tech Support',
    'Beauty & Spa',
    'Fitness',
    'Tutoring',
    'Other'
  ];

  useEffect(() => {
    fetchVendorProfile();
  }, []);

  const fetchVendorProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const { data, error } = await supabase
        .from('vendor_profiles')
        .select('*, profiles(phone, location_lat, location_lng)')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setVendorId(data.id);
        setVendorData({
          business_name: data.business_name || '',
          category: data.category || '',
          description: data.description || '',
          phone: (data.profiles as any)?.phone || '',
          location_lat: (data.profiles as any)?.location_lat?.toString() || '',
          location_lng: (data.profiles as any)?.location_lng?.toString() || '',
          is_active: data.is_active !== undefined ? data.is_active : true
        });
      }
    } catch (error) {
      console.error('Error fetching vendor profile:', error);
      toast.error('Failed to load vendor profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!vendorData.business_name || !vendorData.category) {
      toast.error('Business name and category are required');
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // save vendor profile
      const { error: vendorError } = await supabase
        .from('vendor_profiles')
        .update({
          business_name: vendorData.business_name,
          category: vendorData.category,
          description: vendorData.description,
          is_active: vendorData.is_active,
        })
        .eq('id', vendorId);

      if (vendorError) throw vendorError;

      // save phone and location
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          phone: vendorData.phone || null,
          location_lat: vendorData.location_lat ? parseFloat(vendorData.location_lat) : null,
          location_lng: vendorData.location_lng ? parseFloat(vendorData.location_lng) : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      toast.success('Vendor profile updated successfully!');
      setTimeout(() => navigate('/vendor/dashboard'), 1500);
    } catch (error) {
      console.error('Error updating vendor profile:', error);
      toast.error('Failed to update vendor profile');
    } finally {
      setSaving(false);
    }
  };

  const handleGetCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setVendorData({
            ...vendorData,
            location_lat: position.coords.latitude.toString(),
            location_lng: position.coords.longitude.toString()
          });
          toast.success('Location updated!');
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Failed to get location');
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser');
    }
  };

  const handleDeleteVendorAccount = async () => {
    setDeleting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Delete vendor role first
      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', user.id)
        .eq('role', 'vendor');

      if (roleError) throw roleError;

      // Delete all vendor services
      const { error: servicesError } = await supabase
        .from('services')
        .delete()
        .eq('user_id', user.id);

      if (servicesError) console.warn('Error deleting services:', servicesError);

      // Delete vendor profile
      const { error: profileError } = await supabase
        .from('vendor_profiles')
        .delete()
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      toast.success('Vendor account deleted successfully!');
      setDeleteDialogOpen(false);
      
      // Redirect to regular dashboard after a short delay
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (error) {
      console.error('Error deleting vendor account:', error);
      toast.error('Failed to delete vendor account');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
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
            onClick={() => navigate('/vendor/dashboard')}
            className="text-white hover:bg-white/20 h-9 w-9 sm:h-10 sm:w-10"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <h1 className="text-lg sm:text-2xl font-bold">Vendor Settings</h1>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-2xl">
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
              <Store className="h-5 w-5" />
              Business Profile
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Update your business information
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="business_name">Business Name *</Label>
              <Input
                id="business_name"
                placeholder="Your Business Name"
                value={vendorData.business_name}
                onChange={(e) => setVendorData({ ...vendorData, business_name: e.target.value })}
                disabled={saving}
                className="min-h-[44px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={vendorData.category}
                onValueChange={(value) => setVendorData({ ...vendorData, category: value })}
                disabled={saving}
              >
                <SelectTrigger className="min-h-[44px]">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+234 800 000 0000"
                value={vendorData.phone}
                onChange={(e) => setVendorData({ ...vendorData, phone: e.target.value })}
                disabled={saving}
                className="min-h-[44px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Business Description</Label>
              <Textarea
                id="description"
                placeholder="Tell customers about your business..."
                value={vendorData.description}
                onChange={(e) => setVendorData({ ...vendorData, description: e.target.value })}
                disabled={saving}
                rows={4}
              />
            </div>

            {/* Active Status Toggle */}
            <div className="flex items-center justify-between py-4 border-t">
              <div className="space-y-0.5">
                <Label htmlFor="is_active">Active Status</Label>
                <p className="text-sm text-muted-foreground">
                  When inactive, your services won't appear in search results
                </p>
              </div>
              <Switch
                id="is_active"
                checked={vendorData.is_active}
                onCheckedChange={(checked) => setVendorData({ ...vendorData, is_active: checked })}
                disabled={saving}
              />
            </div>

            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <Label>Business Location</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGetCurrentLocation}
                  disabled={saving}
                >
                  Use Current Location
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="location_lat">Latitude</Label>
                  <Input
                    id="location_lat"
                    placeholder="6.5244"
                    value={vendorData.location_lat}
                    onChange={(e) => setVendorData({ ...vendorData, location_lat: e.target.value })}
                    disabled={saving}
                    className="min-h-[44px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location_lng">Longitude</Label>
                  <Input
                    id="location_lng"
                    placeholder="3.3792"
                    value={vendorData.location_lng}
                    onChange={(e) => setVendorData({ ...vendorData, location_lng: e.target.value })}
                    disabled={saving}
                    className="min-h-[44px]"
                  />
                </div>
              </div>
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

        {/* Delete Vendor Account Section */}
        <Card className="mt-6 border-destructive">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Delete Vendor Account
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Permanently remove your vendor account and all associated data
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">This action cannot be undone</p>
                  <p className="text-sm text-muted-foreground">
                    Deleting your vendor account will remove your business profile, all services, and vendor role. 
                    You can create a new vendor account later if needed.
                  </p>
                </div>
              </div>
              
              <Button
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
                className="w-full min-h-[44px]"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Vendor Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Confirm Vendor Account Deletion
            </DialogTitle>
            <DialogDescription className="pt-2">
              Are you absolutely sure you want to delete your vendor account? This will:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Remove your business profile</li>
                <li>Delete all your services</li>
                <li>Remove your vendor role</li>
              </ul>
              <p className="mt-3 font-medium">
                You will be redirected to your user dashboard and can create a new vendor account anytime.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteVendorAccount}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Yes, Delete My Vendor Account
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorSettings;
