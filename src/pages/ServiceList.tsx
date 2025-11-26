import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useGeolocation } from '@/hooks/useGeolocation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, DollarSign } from 'lucide-react';

const ServiceList = () => {
  const navigate = useNavigate();
  const { location } = useGeolocation();
  type ServiceItem = { id?: string; title?: string; description?: string; category?: string; price?: number; location_lat?: number; location_lng?: number; vendor?: Record<string, unknown>; vendor_profiles?: Record<string, unknown> };
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [allServices, setAllServices] = useState<ServiceItem[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [proximityFilter, setProximityFilter] = useState('10'); // Default to 10km
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data, error } = await supabase.from('services').select('*, vendor_profiles(*)');
        if (error) throw error;
        const typed = (data as unknown as ServiceItem[]) || [];
        setAllServices(typed);
        setServices(typed);
        const cats = [...new Set(typed.map((s) => s.category))].filter(Boolean);
        setCategories(cats as string[]);
      } catch (err) {
        console.error('Error fetching services', err);
      }
    };

    fetchServices();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = allServices;

    // Category filter
    if (categoryFilter) {
      filtered = filtered.filter((s) => s.category === categoryFilter);
    }

    // Proximity filter (if location available)
    if (location && parseInt(proximityFilter) > 0) {
      const radiusKm = parseInt(proximityFilter);
      filtered = filtered.filter((s) => {
        if (!s.location_lat || !s.location_lng) return false;
        
        // Calculate distance using Haversine formula
        const R = 6371; // Earth's radius in km
        const dLat = (s.location_lat - location.lat) * Math.PI / 180;
        const dLon = (s.location_lng - location.lng) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(location.lat * Math.PI / 180) * Math.cos(s.location_lat * Math.PI / 180) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        
        return distance <= radiusKm;
      });
    }

    setServices(filtered);
  }, [categoryFilter, proximityFilter, location, allServices]);

  const handleCenterMap = (service: { location_lat?: number; location_lng?: number }) => {
    // dispatch event to pan map to service location
    window.dispatchEvent(new CustomEvent('proxiPanTo', { detail: { lat: service.location_lat, lng: service.location_lng } }));
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="sticky top-0 z-40 bg-card border-b shadow-lg">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <h1 className="text-lg sm:text-2xl font-bold mb-3 sm:mb-4">Available Services</h1>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="category-filter" className="text-sm sm:text-base">Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger id="category-filter" className="min-h-[44px] text-sm sm:text-base">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="proximity-filter" className="text-sm sm:text-base">Distance Range</Label>
              <Select value={proximityFilter} onValueChange={setProximityFilter}>
                <SelectTrigger id="proximity-filter" className="min-h-[44px] text-sm sm:text-base">
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 km</SelectItem>
                  <SelectItem value="10">10 km</SelectItem>
                  <SelectItem value="20">20 km</SelectItem>
                  <SelectItem value="50">50 km</SelectItem>
                  <SelectItem value="100">100 km</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setCategoryFilter('');
                  setProximityFilter('10');
                }}
                className="w-full md:w-auto min-h-[44px] text-sm sm:text-base"
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <p className="text-sm text-muted-foreground mb-6">
          Showing {services.length} service{services.length !== 1 ? 's' : ''}
          {location && <span> within {proximityFilter}km of your location</span>}
        </p>

        {services.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No services match your filters.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s) => (
              <Card key={s.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{s.title}</CardTitle>
                      <CardDescription>{s.category}</CardDescription>
                    </div>
                    {s.price && (
                      <div className="text-lg font-bold text-primary flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {s.price}
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">{s.description}</p>
                  <div className="text-xs border-t pt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-muted-foreground">Vendor:</span>
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-sm font-semibold"
                        onClick={() => {
                          const vendorId = s.vendor_profiles?.id || s.vendor?.id;
                          if (vendorId) navigate(`/vendor/${vendorId}`);
                        }}
                      >
                        {String(s.vendor?.business_name ?? s.vendor_profiles?.business_name ?? 'Unknown Vendor')}
                      </Button>
                    </div>
                    {s.location_lat && s.location_lng && (
                      <p className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>Location: {s.location_lat.toFixed(4)}, {s.location_lng.toFixed(4)}</span>
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => navigate(`/service/${s.id}`)}
                      className="flex-1"
                    >
                      View Details
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCenterMap(s)}
                    >
                      <MapPin className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceList;
