import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import demoServices from '@/data/demoServices';
import demoVendors from '@/data/demoVendors';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ChevronUp, MapPin, Star, Phone, DollarSign, Search, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type BaseItem = {
  id?: string;
  type?: string;
  title?: string;
  description?: string;
  price?: number;
  category?: string;
  vendor_id?: string;
  vendor_profiles?: { business_name?: string; location_lat?: number; location_lng?: number };
  profiles?: { avatar_url?: string; location_lat?: number; location_lng?: number; full_name?: string };
  services?: BaseItem[];
  business_name?: string;
  event_date?: string;
  event_type?: string;
  status?: string;
};

interface ServiceProviderListProps {
  services: BaseItem[];
}

const ServiceProviderList = ({ services }: ServiceProviderListProps) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [fullyExpanded, setFullyExpanded] = useState(false);
  const [selectedItem, setSelectedItem] = useState<BaseItem | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const listRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const touchStartY = useRef<number>(0);
  const touchCurrentY = useRef<number>(0);
  const isDragging = useRef<boolean>(false);

  const useDemo = import.meta.env.VITE_USE_DEMO_VENDORS === 'true';

  // If demo mode, group demo services by vendor to show richer vendor cards
  const allProviders = useMemo(() => {
    if (useDemo) {
      // group demoServices by vendor
      const byVendor: Record<string, BaseItem> = {};
      demoServices.forEach((s: BaseItem) => {
        const vendor = demoVendors.find((v: BaseItem) => v.id === s.vendor_id) || ({} as BaseItem);
        const key = s.vendor_id ?? '';
        if (!byVendor[key]) {
          byVendor[key] = {
            id: vendor.id || s.vendor_id,
            business_name: vendor.business_name || 'Unknown Vendor',
            profiles: vendor.profiles || {},
            type: 'vendor',
            services: [],
          };
        }
        byVendor[key].services = byVendor[key].services || [];
        byVendor[key].services!.push({ ...(s as BaseItem) });
      });

    return Object.values(byVendor);
  }

  return services.map((s) => ({ ...s, type: 'service' }));
}, [services, useDemo]);

// Filter providers based on search query
const filteredProviders = useMemo(() => {
  if (!searchQuery.trim()) return allProviders;
  
  const query = searchQuery.toLowerCase();
  return allProviders.filter((item) => {
    const businessName = (item.business_name || '').toLowerCase();
    const title = (item.title || '').toLowerCase();
    const description = (item.description || '').toLowerCase();
    const category = (item.category || '').toLowerCase();
    
    return businessName.includes(query) || 
           title.includes(query) || 
           description.includes(query) ||
           category.includes(query);
  });
}, [allProviders, searchQuery]);  const handleItemClick = (item: BaseItem) => {
    setSelectedItem(item);
    setDetailsOpen(true);

    // If the item has coordinates (vendor card in demo mode), dispatch a pan event for the map to handle
    const coords = item.profiles?.location_lat && item.profiles?.location_lng
      ? { lat: Number(item.profiles.location_lat), lng: Number(item.profiles.location_lng) }
      : item.vendor_profiles?.location_lat && item.vendor_profiles?.location_lng
      ? { lat: Number(item.vendor_profiles.location_lat), lng: Number(item.vendor_profiles.location_lng) }
      : null;

    if (coords && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('proxiPanTo', { detail: coords }));
    }
  };

  // Touch handlers for draggable sheet
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    isDragging.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    touchCurrentY.current = e.touches[0].clientY;
    const deltaY = touchStartY.current - touchCurrentY.current;

    // Expand if dragging up by 50px or more
    if (deltaY > 50 && !isExpanded) {
      setIsExpanded(true);
      isDragging.current = false;
    }
    // Collapse if dragging down by 50px or more when at top of list
    else if (deltaY < -50 && isExpanded && listRef.current?.scrollTop === 0) {
      setIsExpanded(false);
      setFullyExpanded(false);
      isDragging.current = false;
    }
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
  };

  // Expand to full screen when user scrolls to bottom of the provider list
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;

    const onScroll = () => {
      try {
        const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 40;
        if (atBottom && isExpanded && !fullyExpanded) {
          setFullyExpanded(true);
        } else if (!atBottom && fullyExpanded && isExpanded && el.scrollTop <= 40) {
          // allow user to retract from full screen when scrolled to top
          setFullyExpanded(false);
        }
      } catch (e) {
        // ignore
      }
    };

    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, [isExpanded, fullyExpanded]);

  return (
    <>
      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        className={cn(
          "fixed bottom-0 left-0 right-0 bg-card border-t border-border rounded-t-3xl shadow-2xl transition-all duration-300 z-40 overflow-hidden pointer-events-auto",
          isExpanded ? (fullyExpanded ? "h-screen" : "h-[70vh]") : "h-[84px]"
        )}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag Handle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute top-2 left-1/2 transform -translate-x-1/2 w-12 h-1.5 bg-muted-foreground/30 rounded-full hover:bg-muted-foreground/50 transition-colors z-50"
          aria-label="Toggle nearby providers"
        />

        {/* Header - draggable to expand */}
        <div 
          className="p-4 sm:p-6 pb-3 sm:pb-4 cursor-pointer touch-none"
          onClick={() => !isExpanded && setIsExpanded(true)}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-bold truncate">Nearby Providers</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">{filteredProviders.length} services near you</p>

              {!isExpanded && allProviders.length > 0 && (
                <div className="mt-2 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {allProviders.slice(0, 10).map((p, i) => (
                    <div key={p.id || i} className="px-2 py-1 bg-muted/80 dark:bg-muted/30 rounded-full text-[10px] sm:text-xs whitespace-nowrap">
                      {(p.business_name || p.title || p.vendor_profiles?.business_name || '').substring(0, 20)}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                const next = !isExpanded;
                setIsExpanded(next);
                if (!next) setFullyExpanded(false);
                if (next) setFullyExpanded(false);
              }}
              className="rounded-full"
            >
              <ChevronUp 
                className={cn(
                  "h-5 w-5 transition-transform duration-300",
                  isExpanded ? "rotate-180" : ""
                )}
              />
            </Button>
          </div>

          {/* Search Bar - Always visible */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Search services or vendors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full text-sm"
            />
          </div>
        </div>

        {/* Provider List - only render when expanded */}
        {isExpanded && (
          <div ref={listRef} className="overflow-y-auto h-[calc(100%-160px)] px-3 sm:px-6 pb-6 space-y-2 sm:space-y-3">
            {filteredProviders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <MapPin className="h-12 w-12 mb-2 opacity-50" />
                <p>{searchQuery ? 'No matching providers found' : 'No providers found nearby'}</p>
              </div>
              ) : (
                filteredProviders.map((item: BaseItem) => (
                item.type === 'vendor' ? (
                  <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleItemClick(item)}>
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <Avatar className="w-10 h-10 sm:w-12 sm:h-12 shrink-0">
                          <AvatarImage src={item.profiles?.avatar_url} />
                          <AvatarFallback>{item.business_name?.[0] || 'V'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2 mb-1">
                            <h3 className="font-semibold text-sm sm:text-base truncate flex-1">{item.business_name}</h3>
                            <Badge variant="default" className="shrink-0 text-xs">Vendor</Badge>
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1 mb-2">
                            {item.services?.slice(0,2).map((s: BaseItem) => s.title).join(' · ')}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {item.services?.length} services
                          </Badge>
                        </div>
                        <div className="flex flex-col items-end gap-0.5 shrink-0">
                          <div className="flex items-center gap-0.5">
                            <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs sm:text-sm font-medium">4.8</span>
                          </div>
                          <span className="text-[10px] sm:text-xs text-muted-foreground">(23)</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card 
                    key={item.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleItemClick(item)}
                  >
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2 mb-1">
                            <h3 className="font-semibold text-sm sm:text-base truncate flex-1">{item.title}</h3>
                            <Badge variant="default" className="shrink-0 text-xs">Service</Badge>
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1 sm:line-clamp-2 mb-2">
                            {item.description}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                            {item.price && (
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                ₦{item.price}
                              </span>
                            )}
                            {item.category && (
                              <Badge variant="outline" className="text-xs">
                                {item.category}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
                          <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs sm:text-sm font-medium">4.8</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              ))
            )}
          </div>
        )}
      </div>

      {/* Details Sheet */}
      <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
        <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
          {selectedItem && (
            <>
              <SheetHeader>
                <SheetTitle className="text-xl sm:text-2xl">
                  {selectedItem.type === 'vendor' ? selectedItem.business_name : selectedItem.title}
                </SheetTitle>
                {selectedItem.type === 'vendor' && (
                  <Badge className="w-fit">Verified Vendor</Badge>
                )}
              </SheetHeader>
              
              <div className="mt-6 space-y-6">
                {/* Description */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Description</p>
                  <p className="text-sm leading-relaxed">
                    {selectedItem.type === 'vendor' 
                      ? `Professional ${selectedItem.services?.[0]?.category || 'services'} provider offering quality work. ${selectedItem.services?.length || 0} services available.`
                      : (selectedItem.description || 'Quality service provided by experienced professionals.')}
                  </p>
                </div>

                {/* Service/Vendor Details Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {selectedItem.type === 'vendor' ? 'Vendor Information' : 'Service Details'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedItem.type === 'vendor' ? (
                      <>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Services Offered</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedItem.services?.slice(0, 3).map((service: BaseItem, idx: number) => (
                              <Badge key={idx} variant="secondary">{service.title || service.category}</Badge>
                            ))}
                            {(selectedItem.services?.length || 0) > 3 && (
                              <Badge variant="outline">+{(selectedItem.services?.length || 0) - 3} more</Badge>
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Rating</p>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center">
                              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                            </div>
                            <span className="text-sm font-medium">4.8 (23 reviews)</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Location</p>
                          <p className="text-sm flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {selectedItem.profiles?.location_lat ? '2.5 km away' : 'Lagos, Nigeria'}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        {selectedItem.price && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Price</p>
                            <p className="text-2xl font-bold text-primary">₦{selectedItem.price.toLocaleString()}</p>
                          </div>
                        )}
                        {selectedItem.category && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Category</p>
                            <Badge>{selectedItem.category}</Badge>
                          </div>
                        )}
                        {(selectedItem.vendor_profiles?.business_name || selectedItem.business_name) && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Provider</p>
                            <p className="font-medium">{selectedItem.vendor_profiles?.business_name || selectedItem.business_name}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Rating</p>
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">4.8 (23 reviews)</span>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={() => {
                      toast.success('Booking request sent! Vendor will contact you shortly.');
                      setDetailsOpen(false);
                    }}
                  >
                    {selectedItem.type === 'vendor' ? 'Request Services' : 'Book Service'}
                  </Button>
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      size="lg"
                      onClick={async () => {
                        try {
                          const vendorId = selectedItem.type === 'vendor' 
                            ? selectedItem.id 
                            : (selectedItem.vendor_id || selectedItem.vendor_profiles?.user_id);
                          const vendorName = selectedItem.type === 'vendor'
                            ? selectedItem.business_name
                            : (selectedItem.vendor_profiles?.business_name || 'Vendor');

                          if (!vendorId) {
                            toast.error('Vendor information not available');
                            return;
                          }

                          toast.success(`Opening chat with ${vendorName}...`);
                          setDetailsOpen(false);
                          
                          // Navigate to messages with vendor info in state
                          setTimeout(() => {
                            navigate('/messages', { 
                              state: { 
                                vendorId,
                                vendorName,
                                serviceId: selectedItem.id
                              } 
                            });
                          }, 500);
                        } catch (error) {
                          console.error('Error opening chat:', error);
                          toast.error('Failed to open chat');
                        }
                      }}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Chat
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      size="lg"
                      onClick={() => {
                        const vendorName = selectedItem.type === 'vendor'
                          ? selectedItem.business_name
                          : (selectedItem.vendor_profiles?.business_name || 'Vendor');
                        const vendorPhone = selectedItem.profiles?.phone || selectedItem.vendor_profiles?.phone || '+234 XXX XXX XXXX';
                        
                        // Show call dialog
                        const callDialog = document.createElement('div');
                        callDialog.innerHTML = `
                          <div class="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
                            <div class="bg-card rounded-xl shadow-2xl p-6 max-w-sm w-full">
                              <h3 class="text-xl font-bold mb-4">Call ${vendorName}</h3>
                              <p class="text-sm text-muted-foreground mb-6">Choose how you'd like to contact this vendor:</p>
                              <div class="space-y-3">
                                <button class="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-3 rounded-lg font-medium" id="voice-call">
                                  📞 Voice Call
                                </button>
                                <button class="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 py-3 rounded-lg font-medium" id="video-call">
                                  📹 Video Call
                                </button>
                                <button class="w-full border border-border hover:bg-muted py-3 rounded-lg font-medium" id="phone-call">
                                  ☎️ Phone Call (${vendorPhone})
                                </button>
                                <button class="w-full text-muted-foreground hover:text-foreground py-2" id="cancel-call">
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </div>
                        `;
                        document.body.appendChild(callDialog);
                        
                        const handleVoiceCall = () => {
                          document.body.removeChild(callDialog);
                          navigate('/call', { state: { type: 'voice', vendorName, vendorId: selectedItem.id } });
                        };
                        
                        const handleVideoCall = () => {
                          document.body.removeChild(callDialog);
                          navigate('/call', { state: { type: 'video', vendorName, vendorId: selectedItem.id } });
                        };
                        
                        const handlePhoneCall = () => {
                          document.body.removeChild(callDialog);
                          window.location.href = `tel:${vendorPhone}`;
                        };
                        
                        const handleCancel = () => {
                          document.body.removeChild(callDialog);
                        };
                        
                        callDialog.querySelector('#voice-call')?.addEventListener('click', handleVoiceCall);
                        callDialog.querySelector('#video-call')?.addEventListener('click', handleVideoCall);
                        callDialog.querySelector('#phone-call')?.addEventListener('click', handlePhoneCall);
                        callDialog.querySelector('#cancel-call')?.addEventListener('click', handleCancel);
                      }}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </Button>
                  </div>
                  <Button 
                    variant="ghost" 
                    className="w-full" 
                    size="sm"
                    onClick={() => {
                      if (selectedItem.type === 'vendor') {
                        navigate('/vendor-profile/' + selectedItem.id);
                      } else {
                        navigate('/service-profile/' + selectedItem.id);
                      }
                    }}
                  >
                    View Full Profile
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default ServiceProviderList;
