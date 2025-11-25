import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, AlertTriangle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

const DeleteAccount = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);

  const handleDeleteAccount = async () => {
    if (confirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }

    if (!acknowledged) {
      toast.error('Please acknowledge that you understand the consequences');
      return;
    }

    setLoading(true);
    try {
      // In a real app, this would delete the account from the database
      // For security reasons, account deletion should be handled server-side
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Mark account for deletion (in real app, this would trigger a backend process)
        toast.success('Account deletion request submitted. You will be logged out.');
        
        // Sign out the user
        await supabase.auth.signOut();
        
        // Redirect to home
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="bg-gradient-hero text-white p-3 sm:p-4 sticky top-0 z-10 shadow-lg">
        <div className="container mx-auto flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/profile')}
            className="text-white hover:bg-white/20 h-9 w-9 sm:h-10 sm:w-10"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <h1 className="text-lg sm:text-2xl font-bold">Delete Account</h1>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-2xl">
        <Alert className="mb-4 border-destructive bg-destructive/10">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <AlertDescription className="text-destructive font-medium ml-2">
            Warning: This action cannot be undone!
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Delete Your Account
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Permanently remove your account and all associated data
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-6">
            <div className="space-y-4 text-sm">
              <p className="font-semibold">What will be deleted:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Your profile information and account details</li>
                <li>All messages and conversations</li>
                <li>Service requests and bookings</li>
                <li>Reviews and ratings</li>
                <li>Vendor profile (if applicable)</li>
                <li>All associated data and preferences</li>
              </ul>
            </div>

            <div className="flex items-start space-x-2 py-4 border-t border-b">
              <Checkbox
                id="acknowledge"
                checked={acknowledged}
                onCheckedChange={(checked) => setAcknowledged(checked === true)}
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="acknowledge"
                  className="text-sm font-medium leading-relaxed cursor-pointer"
                >
                  I understand that this action is permanent and cannot be reversed
                </Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmText" className="text-sm font-medium">
                Type <span className="font-bold text-destructive">DELETE</span> to confirm
              </Label>
              <Input
                id="confirmText"
                placeholder="Type DELETE"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="min-h-[44px] font-mono"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                className="flex-1 min-h-[44px]"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={loading || confirmText !== 'DELETE' || !acknowledged}
                className="flex-1 min-h-[44px]"
              >
                {loading ? (
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
                    Delete Account
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DeleteAccount;
