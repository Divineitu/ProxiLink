import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import demoServices from '@/data/demoServices';
import demoVendors from '@/data/demoVendors';
import { supabase } from '@/integrations/supabase/client';
import { useGeolocation } from '@/hooks/useGeolocation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, DollarSign } from 'lucide-react';
import { findNearbyVendors } from '@/lib/proximity';

const ServiceList = () => {
  const navigate = useNavigate();
  const { location } = useGeolocation();
  type ServiceItem = { id?: string; title?: string; description?: string; category?: string; price?: number; location_lat?: number; location_lng?: number; vendor?: Record<string, unknown>; vendor_profiles?: Record<string, unknown> };
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [allServices, setAllServices] = useState<ServiceItem[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [proximityFilter, setProximityFilter] = useState('50'); // km
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const useDemo = import.meta.env.VITE_USE_DEMO_VENDORS === 'true';
    if (useDemo) {
      // join demo services with vendor info
      const joined = demoServices.map((s: unknown) => {
        const _s = s as unknown as ServiceItem & { vendor_id?: string };
        const vendor = demoVendors.find((v: unknown) => (v as unknown as { id?: string }).id === _s.vendor_id) as Record<string, unknown> | undefined;
        return { ..._s, vendor } as ServiceItem;
      });
      setAllServices(joined);
      setServices(joined);
      const cats = [...new Set(joined.map((s) => s.category))].filter(Boolean);
      setCategories(cats as string[]);
      return;
    }

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
        const distance = Math.sqrt(
          Math.pow(s.location_lat - location.lat, 2) + Math.pow(s.location_lng - location.lng, 2)
        ) * 111; // rough km conversion
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
    <div className="min-h-screen bg-muted/30">
      <div className="sticky top-0 z-40 bg-card border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold mb-4">Available Services</h1>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category-filter">Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger id="category-filter">
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
              <Label htmlFor="proximity-filter">Radius (km)</Label>
              <Input
                id="proximity-filter"
                type="number"
                min="0"
                max="200"
                value={proximityFilter}
                onChange={(e) => setProximityFilter(e.target.value)}
                placeholder="50"
              />
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setCategoryFilter('');
                  setProximityFilter('50');
                }}
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
                  <p className="text-sm text-muted-foreground">{s.description}</p>
                  <div className="text-xs text-muted-foreground border-t pt-3">
                    <p className="font-medium mb-1">
                      {String(s.vendor?.business_name ?? s.vendor_profiles?.business_name ?? 'Unknown Vendor')}
                    </p>
                    <p className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Lat: {s.location_lat?.toFixed(4)}, Lng: {s.location_lng?.toFixed(4)}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleCenterMap(s)}
                    className="w-full mt-2"
                  >
                    View on Map
                  </Button>
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
