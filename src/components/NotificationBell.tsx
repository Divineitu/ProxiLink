import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import NotificationCenter from './NotificationCenter';
import useNotifications from '@/hooks/useNotifications';

const NotificationBell: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { unreadCount } = useNotifications();

  return (
    <div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            size="icon"
            className="relative h-10 w-10 rounded-full shadow bg-card border border-border hover:shadow-lg transition-shadow text-foreground"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5 text-foreground" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1">{unreadCount}</Badge>
            )}
          </Button>
        </SheetTrigger>

        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Notifications</SheetTitle>
          </SheetHeader>
          <NotificationCenter onClose={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default NotificationBell;
