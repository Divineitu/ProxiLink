import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, MapPin, Star, Phone, Mail, MessageCircle, Clock, CheckCircle, Package } from 'lucide-react';
import { toast } from 'sonner';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

interface VendorData {
  id: string;
  user_id: string;
  business_name: string;
  category: string;
  description?: string;
  location_lat?: number;
  location_lng?: number;
  phone?: string;
  email?: string;
  rating?: number;
  total_reviews?: number;
  profile?: {
    full_name: string;
    phone?: string;
  };
}

interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  created_at: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  user: {
    full_name: string;
  };
}

const VendorProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [vendor, setVendor] = useState<VendorData | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    if (id) {
      fetchVendorData();
    }
  }, [id]);

  const fetchVendorData = async () => {
    try {
      // Fetch vendor profile
      const { data: vendorData, error: vendorError } = await supabase
        .from('vendor_profiles')
        .select(`
          *,
          profile:profiles(full_name, phone)
        `)
        .eq('id', id)
        .single();

      if (vendorError) throw vendorError;
      setVendor(vendorData);

      // Fetch vendor services
      const { data: servicesData } = await supabase
        .from('services')
        .select('*')
        .eq('vendor_id', id)
        .order('created_at', { ascending: false })
        .limit(10);

      setServices(servicesData || []);

      // TODO: Fetch reviews when review system is implemented
      // For now, use demo reviews
      setReviews([]);
    } catch (error) {
      console.error('Error fetching vendor data:', error);
      toast.error('Failed to load vendor profile');
    } finally {
      setLoading(false);
    }
  };

  const handleContactVendor = () => {
    if (!vendor) return;
    navigate(`/messages?vendor=${vendor.id}&name=${vendor.business_name}`);
  };

  const handleRequestService = () => {
    toast.success('Service request feature coming soon!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading vendor profile...</p>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">Vendor not found</p>
            <Button onClick={() => navigate('/services')}>Browse Services</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const mapCenter = {
    lat: vendor.location_lat || 6.5244,
    lng: vendor.location_lng || 3.3792
  };

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
          <h1 className="text-lg sm:text-2xl font-bold truncate">{vendor.business_name}</h1>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-4xl space-y-4 sm:space-y-6">
        {/* Vendor Header Card */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <Avatar className="h-20 w-20 sm:h-24 sm:w-24 mx-auto sm:mx-0">
                <AvatarFallback className="text-2xl sm:text-3xl font-bold bg-primary/10 text-primary">
                  {vendor.business_name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center sm:text-left space-y-2">
                <div>
                  <h2 className="text-2xl font-bold">{vendor.business_name}</h2>
                  <Badge variant="secondary" className="mt-2">
                    {vendor.category}
                  </Badge>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{vendor.rating || '4.5'}</span>
                    <span>({vendor.total_reviews || 0} reviews)</span>
                  </div>
                </div>
                {vendor.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{vendor.description}</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t">
              <Button onClick={handleContactVendor} className="w-full">
                <MessageCircle className="h-4 w-4 mr-2" />
                Message
              </Button>
              <Button onClick={handleRequestService} variant="outline" className="w-full">
                <Package className="h-4 w-4 mr-2" />
                Request Service
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="services" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-4">
            {services.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No services listed yet</p>
                </CardContent>
              </Card>
            ) : (
              services.map((service) => (
                <Card key={service.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{service.title}</CardTitle>
                        <CardDescription className="mt-1">{service.category}</CardDescription>
                      </div>
                      <Badge variant="outline" className="text-lg font-bold whitespace-nowrap">
                        ₦{service.price.toLocaleString()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">{service.description}</p>
                    <Button 
                      size="sm" 
                      className="mt-3" 
                      onClick={() => navigate(`/service/${service.id}`)}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {vendor.description && (
                  <div>
                    <h4 className="font-semibold mb-2">About</h4>
                    <p className="text-sm text-muted-foreground">{vendor.description}</p>
                  </div>
                )}

                <div className="space-y-3 pt-3 border-t">
                  <div className="flex items-center gap-3 text-sm">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Category:</span>
                    <span className="text-muted-foreground">{vendor.category}</span>
                  </div>
                  
                  {vendor.profile?.phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Phone:</span>
                      <a href={`tel:${vendor.profile.phone}`} className="text-primary hover:underline">
                        {vendor.profile.phone}
                      </a>
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Availability:</span>
                    <Badge variant="secondary">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Available
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location Map */}
            {vendor.location_lat && vendor.location_lng && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full h-64 rounded-lg overflow-hidden">
                    <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}>
                      <GoogleMap
                        mapContainerStyle={{ width: '100%', height: '100%' }}
                        center={mapCenter}
                        zoom={14}
                      >
                        <Marker position={mapCenter} />
                      </GoogleMap>
                    </LoadScript>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-4">
            {reviews.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-2">No reviews yet</p>
                  <p className="text-sm text-muted-foreground">Be the first to review this vendor!</p>
                </CardContent>
              </Card>
            ) : (
              reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {review.user.full_name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold">{review.user.full_name}</h4>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-muted-foreground'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{review.comment}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(review.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VendorProfile;
