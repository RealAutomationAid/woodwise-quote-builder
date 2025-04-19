import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, CheckCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  user_id: string;
  type: string;
  message: string;
  quote_id: string | null;
  status: 'unread' | 'read';
  created_at: string;
}

export function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  // Fetch existing notifications
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await (supabase as any)
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setNotifications(data || []);
    })();
  }, [user]);

  // Subscribe to realtime inserts
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`notifications_user_${user.id}`)
      .on('postgres_changes', { schema: 'public', table: 'notifications', event: 'INSERT', filter: `user_id=eq.${user.id}` }, payload => {
        setNotifications(prev => [payload.new as Notification, ...prev]);
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAllRead = async () => {
    if (!user) return;
    // Update on server
    await (supabase as any)
      .from('notifications')
      .update({ status: 'read' })
      .eq('user_id', user.id)
      .eq('status', 'unread');
    // Update locally
    setNotifications(prev => prev.map(n => ({ ...n, status: 'read' })));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative p-2 text-woodwise-text hover:text-woodwise-accent">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-destructive text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
              {unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 p-2 space-y-1">
        <div className="flex items-center justify-between px-2">
          <span className="font-semibold">Notifications</span>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-sm text-primary">Mark all read</button>
          )}
        </div>
        <div className="max-h-64 overflow-y-auto">
          {notifications.length === 0 && (
            <p className="p-2 text-sm text-muted-foreground">No notifications.</p>
          )}
          {notifications.map(n => (
            <DropdownMenuItem key={n.id} className="flex items-start space-x-2 p-2">
              <div className="flex-1">
                <p className={n.status === 'unread' ? 'font-medium' : 'text-sm'}>{n.message}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                </p>
              </div>
              {n.status === 'read' && <CheckCircle className="h-4 w-4 text-green-500" />}
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 