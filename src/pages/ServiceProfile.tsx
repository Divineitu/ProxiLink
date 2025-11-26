import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Phone, MapPin, Star, Calendar, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import ReviewForm from '@/components/ReviewForm';

type Service = {
  id?: string;
  title?: string;
  description?: string;
  vendor_profiles?: { business_name?: string };
  profiles?: { avatar_url?: string; full_name?: string };
  price?: number;
  radius_meters?: number;
  category?: string;
};

type Review = {
  id?: string | number;
  rating?: number;
  profiles?: { avatar_url?: string; full_name?: string };
  comment?: string;
};

const ServiceProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [vendorPhone, setVendorPhone] = useState<string | null>(null);

  const startConversation = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to message vendors');
        navigate('/login');
        return;
      }

      if (!vendorId) {
        toast.error('Vendor information not available');
        return;
      }

      // Check if conversation already exists
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .eq('user_id', user.id)
        .eq('vendor_id', vendorId)
        .single();

      if (existingConv) {
        // Navigate to existing conversation
        navigate('/messages');
        return;
      }

      // Create new conversation
      const { data: newConv, error } = await supabase
        .from('conversations')
        .insert({
          user_id: user.id,
          vendor_id: vendorId,
          service_id: id,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Conversation started!');
      navigate('/messages');
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast.error('Failed to start conversation');
    }
  };

  const fetchServiceDetails = useCallback(async () => {
    const { data, error } = await supabase
      .from("services")
      .select(`
        *,
        profiles(full_name, avatar_url, phone),
        vendor_profiles(business_name)
      `)
      .eq("id", id)
      .single();

    if (error) {
      toast.error("Failed to load service details");
      navigate("/dashboard");
    } else {
      setService(data);
      setVendorId((data as any).vendor_id || null);
      setVendorPhone((data as any).profiles?.phone || null);
    }
    setLoading(false);
  }, [id, navigate]);

  const fetchReviews = useCallback(async () => {
    const { data } = await supabase
      .from("reviews")
      .select(`
        *,
        profiles(full_name, avatar_url)
      `)
      .eq("service_id", id)
      .order("created_at", { ascending: false })
      .limit(5);

    setReviews(data || []);
  }, [id]);

  useEffect(() => {
    fetchServiceDetails();
    fetchReviews();
  }, [fetchServiceDetails, fetchReviews]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!service) return null;

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + (r.rating ?? 0), 0) / reviews.length).toFixed(1)
    : "N/A";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-hero text-white p-4 sticky top-0 z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/dashboard")}
          className="text-white hover:bg-white/20"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>

      <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Service Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={service.profiles?.avatar_url} />
                <AvatarFallback>{service.vendor_profiles?.business_name?.[0] || "S"}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-2xl mb-1">{service.title}</CardTitle>
                <CardDescription className="text-base">
                  {service.vendor_profiles?.business_name}
                </CardDescription>
                <div className="flex items-center gap-4 mt-2">
                  <Badge variant="secondary">{service.category}</Badge>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    <span className="font-medium">{avgRating}</span>
                    <span className="text-muted-foreground">({reviews.length})</span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">{service.description}</p>
            </div>
            {service.price && (
              <div>
                <h3 className="font-semibold mb-1">Price</h3>
                <p className="text-2xl font-bold text-primary">₦{service.price}</p>
              </div>
            )}
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">Within {(service.radius_meters / 1000).toFixed(1)}km radius</span>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-3">
          <Button size="lg" className="w-full" onClick={startConversation}>
            <MessageSquare className="h-5 w-5 mr-2" />
            Message
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="w-full"
            onClick={() => {
              if (vendorPhone) {
                window.location.href = `tel:${vendorPhone}`;
              } else {
                toast.error('Phone number not available');
              }
            }}
            disabled={!vendorPhone}
          >
            <Phone className="h-5 w-5 mr-2" />
            Call
          </Button>
          <Button size="lg" variant="outline" className="w-full">
            <Calendar className="h-5 w-5 mr-2" />
            Book
          </Button>
        </div>

        {/* Reviews */}
        <Card>
          <CardHeader>
            <CardTitle>Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            {reviews.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No reviews yet</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-border last:border-0 pb-4 last:pb-0">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={review.profiles?.avatar_url} />
                        <AvatarFallback>{review.profiles?.full_name?.[0] || "U"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium">{review.profiles?.full_name}</p>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-primary text-primary" />
                            <span className="text-sm font-medium">{review.rating}</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Review submission form */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Leave a review</h3>
              <ReviewForm serviceId={String(id)} onSubmitted={() => fetchReviews()} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ServiceProfile;
