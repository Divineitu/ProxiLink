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
    <div className="w-full max-w-md">
      <div className="flex items-center justify-between mb-4 mt-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => markAllRead()}>
            Mark all read
          </Button>
          <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
        </div>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading...</p>}

  <div className="space-y-3">
        {notifications.length === 0 && !loading && (
          <Card>
            <CardContent>
              <p className="text-sm text-muted-foreground">No notifications yet.</p>
            </CardContent>
          </Card>
        )}

        {notifications.map((n) => (
          <Card key={n.id} className={`${n.is_read ? 'opacity-70' : 'bg-card/95'}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{n.title}</CardTitle>
                {!n.is_read && <Badge variant="secondary">New</Badge>}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">{n.content}</p>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{n.created_at ? format(new Date(n.created_at), 'PP p') : ''}</p>
                <div className="flex items-center gap-2">
                  {/* If this is a welcome notification, show a CTA to view nearby services */}
                  {n.notification_type === 'welcome' && (
                    <Button size="sm" onClick={() => { navigate('/services'); if (onClose) onClose(); }}>
                      View nearby services
                    </Button>
                  )}
                  {!n.is_read && (
                    <Button size="sm" onClick={() => markAsRead(n.id)}>
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
