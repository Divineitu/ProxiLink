import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { List, User, CreditCard, Bell, HelpCircle, FileText, Settings, MessageSquare, LogOut, Store, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const [isVendor, setIsVendor] = useState(false);
  const [vendorDialogOpen, setVendorDialogOpen] = useState(false);
  const [creatingVendor, setCreatingVendor] = useState(false);
  const [vendorData, setVendorData] = useState({
    business_name: '',
    category: '',
    description: ''
  });

  useEffect(() => {
    checkVendorStatus();
  }, []);

  const checkVendorStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('vendor_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setIsVendor(true);
      }
    } catch (error) {
      console.log('User is not a vendor');
    }
  };

  const handleBecomeVendor = async () => {
    if (!vendorData.business_name || !vendorData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    setCreatingVendor(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error: vendorError } = await supabase
        .from('vendor_profiles')
        .insert({
          user_id: user.id,
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
        .eq('user_id', user.id)
        .eq('role', 'vendor')
        .maybeSingle();

      if (!existingRole) {
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: user.id,
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

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('rememberMe');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('proxilink_last_location');
      localStorage.removeItem('proxilink_location_permission');
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="icon" className="fixed top-4 left-4 z-50 h-11 w-11 sm:h-12 sm:w-12 rounded-full shadow-lg bg-card border-2 border-border hover:shadow-xl transition-shadow text-foreground">
          <List className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] sm:w-full sm:max-w-xs">
        <SheetHeader>
          <SheetTitle className="text-base sm:text-lg">Menu</SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-2 sm:space-y-4">
          <Link to="/profile" className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted rounded text-sm">
            <User className="h-5 w-5 shrink-0" />
            <span>Profile</span>
          </Link>

          {isVendor && (
            <Link to="/vendor/dashboard" className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted rounded text-sm">
              <Store className="h-5 w-5 shrink-0" />
              <span>Vendor Dashboard</span>
            </Link>
          )}

          {!isVendor && (
            <button 
              onClick={() => setVendorDialogOpen(true)}
              className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted rounded text-sm w-full text-left"
            >
              <Briefcase className="h-5 w-5 shrink-0" />
              <span>Become a Vendor</span>
            </button>
          )}

          <Link to="/payments" className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted rounded text-sm">
            <CreditCard className="h-5 w-5 shrink-0" />
            <span>Payment Options</span>
          </Link>

          <Link to="/orders" className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted rounded text-sm">
            <FileText className="h-5 w-5 shrink-0" />
            <span>Past Orders</span>
          </Link>

          <Link to="/notifications" className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted rounded text-sm">
            <Bell className="h-5 w-5 shrink-0" />
            <span>Notifications</span>
          </Link>

          <Link to="/messages" className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted rounded text-sm">
            <MessageSquare className="h-5 w-5 shrink-0" />
            <span>Messages</span>
          </Link>

          <Link to="/about" className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted rounded text-sm">
            <HelpCircle className="h-5 w-5 shrink-0" />
            <span>About</span>
          </Link>

          <Link to="/support" className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted rounded text-sm">
            <Settings className="h-5 w-5 shrink-0" />
            <span>Support</span>
          </Link>

          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted rounded text-sm w-full text-left text-destructive hover:text-destructive"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </SheetContent>

      {/* Become a Vendor Dialog */}
      <Dialog open={vendorDialogOpen} onOpenChange={setVendorDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Become a Vendor</DialogTitle>
            <DialogDescription>
              Set up your vendor profile to start offering services on ProxiLink
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="business_name">Business Name *</Label>
              <Input
                id="business_name"
                placeholder="Enter your business name"
                value={vendorData.business_name}
                onChange={(e) => setVendorData({ ...vendorData, business_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Input
                id="category"
                placeholder="e.g., Plumbing, Electrical, Catering"
                value={vendorData.category}
                onChange={(e) => setVendorData({ ...vendorData, category: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Tell customers about your services"
                value={vendorData.description}
                onChange={(e) => setVendorData({ ...vendorData, description: e.target.value })}
                rows={3}
              />
            </div>
            <Button 
              onClick={handleBecomeVendor} 
              disabled={creatingVendor || !vendorData.business_name || !vendorData.category}
              className="w-full"
            >
              {creatingVendor ? 'Creating...' : 'Create Vendor Profile'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Sheet>
  );
};

export default Sidebar;
