import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ChevronUp, MapPin, Star, Phone, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

interface ServiceProviderListProps {
  services: any[];
  events: any[];
}

const ServiceProviderList = ({ services, events }: ServiceProviderListProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const allProviders = [
    ...services.map(s => ({ ...s, type: 'service' })),
    ...events.map(e => ({ ...e, type: 'event' }))
  ];

  const handleItemClick = (item: any) => {
    setSelectedItem(item);
    setDetailsOpen(true);
  };

  return (
    <>
      {/* Bottom Sheet */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 bg-card border-t border-border rounded-t-3xl shadow-2xl transition-all duration-300 z-40",
          isExpanded ? "h-[70vh]" : "h-[30vh]"
        )}
      >
        {/* Drag Handle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute top-2 left-1/2 transform -translate-x-1/2 w-12 h-1.5 bg-muted-foreground/30 rounded-full hover:bg-muted-foreground/50 transition-colors"
        />

        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Nearby Providers</h2>
              <p className="text-sm text-muted-foreground">
                {allProviders.length} services & events available
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
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
        </div>

        {/* Provider List */}
        <div className="overflow-y-auto h-[calc(100%-100px)] px-6 pb-6 space-y-3">
          {allProviders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <MapPin className="h-12 w-12 mb-2 opacity-50" />
              <p>No providers found nearby</p>
            </div>
          ) : (
            allProviders.map((item) => (
              <Card 
                key={item.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleItemClick(item)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">{item.title}</h3>
                        {item.type === 'service' ? (
                          <Badge variant="default" className="shrink-0">Service</Badge>
                        ) : (
                          <Badge variant="secondary" className="shrink-0">Event</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {item.type === 'service' && item.price && (
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
                    {item.type === 'service' && (
                      <div className="flex items-center gap-1 text-sm shrink-0">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">4.8</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Details Sheet */}
      <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
        <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
          {selectedItem && (
            <>
              <SheetHeader>
                <SheetTitle className="text-2xl">{selectedItem.title}</SheetTitle>
              </SheetHeader>
              
              <div className="mt-6 space-y-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Description</p>
                  <p>{selectedItem.description}</p>
                </div>

                {selectedItem.type === 'service' ? (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Service Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {selectedItem.price && (
                          <div>
                            <p className="text-sm text-muted-foreground">Price</p>
                            <p className="text-2xl font-bold text-primary">₦{selectedItem.price}</p>
                          </div>
                        )}
                        {selectedItem.category && (
                          <div>
                            <p className="text-sm text-muted-foreground">Category</p>
                            <Badge>{selectedItem.category}</Badge>
                          </div>
                        )}
                        {selectedItem.vendor_profiles?.business_name && (
                          <div>
                            <p className="text-sm text-muted-foreground">Provider</p>
                            <p className="font-medium">{selectedItem.vendor_profiles.business_name}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <div className="space-y-2">
                      <Button className="w-full" size="lg">
                        Book Service
                      </Button>
                      <Button variant="outline" className="w-full" size="lg">
                        <Phone className="h-4 w-4 mr-2" />
                        Contact Provider
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Event Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Date</p>
                          <p className="font-medium">
                            {new Date(selectedItem.event_date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        {selectedItem.event_type && (
                          <div>
                            <p className="text-sm text-muted-foreground">Type</p>
                            <Badge>{selectedItem.event_type}</Badge>
                          </div>
                        )}
                        {selectedItem.status && (
                          <div>
                            <p className="text-sm text-muted-foreground">Status</p>
                            <Badge variant="secondary">{selectedItem.status}</Badge>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Button className="w-full" size="lg">
                      Register for Event
                    </Button>
                  </>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default ServiceProviderList;
