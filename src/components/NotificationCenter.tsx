import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import useNotifications from '@/hooks/useNotifications';
import { format } from 'date-fns';

const NotificationCenter: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const { notifications, loading, markAsRead, markAllRead } = useNotifications();
  const navigate = useNavigate();

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 sm:mb-6 mt-2 gap-2 flex-wrap">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => markAllRead()} 
          className="text-xs sm:text-sm px-3 py-1.5"
        >
          Mark all read
        </Button>
        {onClose && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onClose} 
            className="text-xs sm:text-sm px-3 py-1.5"
          >
            Close
          </Button>
        )}
      </div>

      {loading && <p className="text-sm text-muted-foreground py-4">Loading...</p>}

      <div className="space-y-3 overflow-y-auto flex-1 pr-2">
        {notifications.length === 0 && !loading && (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center">
              <p className="text-sm text-muted-foreground">No notifications yet.</p>
            </CardContent>
          </Card>
        )}

        {notifications.map((n) => (
          <Card 
            key={n.id} 
            className={`transition-opacity ${
              n.is_read ? 'opacity-60' : 'bg-card shadow-md border-primary/20'
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-sm sm:text-base font-semibold leading-tight break-words flex-1">
                  {n.title}
                </CardTitle>
                {!n.is_read && (
                  <Badge variant="default" className="shrink-0 text-xs">New</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed break-words">
                {n.content}
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 pt-2 border-t">
                <p className="text-xs text-muted-foreground shrink-0">
                  {n.created_at ? format(new Date(n.created_at), 'PP p') : ''}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  {n.notification_type === 'welcome' && (
                    <Button 
                      size="sm" 
                      variant="default"
                      className="text-xs h-8"
                      onClick={() => { 
                        navigate('/services'); 
                        if (onClose) onClose(); 
                      }}
                    >
                      View Services
                    </Button>
                  )}
                  {!n.is_read && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="text-xs h-8"
                      onClick={() => markAsRead(n.id)}
                    >
                      Mark read
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default NotificationCenter;
