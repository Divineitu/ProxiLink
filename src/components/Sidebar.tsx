import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { List, User, CreditCard, Bell, HelpCircle, FileText, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

const Sidebar: React.FC = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="icon" className="fixed top-4 left-4 z-50 h-12 w-12 rounded-full shadow-lg bg-card border-2 border-border hover:shadow-xl transition-shadow text-foreground">
          <List className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full sm:max-w-xs">
        <SheetHeader>
          <SheetTitle className="text-lg">Menu</SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          <Link to="/profile" className="flex items-center gap-3 px-3 py-2 hover:bg-muted rounded">
            <User className="h-5 w-5" />
            <span>Profile</span>
          </Link>

          <Link to="/vendor/dashboard" className="flex items-center gap-3 px-3 py-2 hover:bg-muted rounded">
            <Settings className="h-5 w-5" />
            <span>Vendor Dashboard</span>
          </Link>

          <Link to="/payments" className="flex items-center gap-3 px-3 py-2 hover:bg-muted rounded">
            <CreditCard className="h-5 w-5" />
            <span>Payment Options</span>
          </Link>

          <Link to="/orders" className="flex items-center gap-3 px-3 py-2 hover:bg-muted rounded">
            <FileText className="h-5 w-5" />
            <span>Past Orders</span>
          </Link>

          <Link to="/notifications" className="flex items-center gap-3 px-3 py-2 hover:bg-muted rounded">
            <Bell className="h-5 w-5" />
            <span>Notifications</span>
          </Link>

          <Link to="/about" className="flex items-center gap-3 px-3 py-2 hover:bg-muted rounded">
            <HelpCircle className="h-5 w-5" />
            <span>About</span>
          </Link>

          <Link to="/support" className="flex items-center gap-3 px-3 py-2 hover:bg-muted rounded">
            <Settings className="h-5 w-5" />
            <span>Support</span>
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Sidebar;
