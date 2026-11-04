
'use client';

import { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Bell, CheckCheck } from 'lucide-react';
import type { AuthUser, Notification } from '@/lib/types';
import { getUnreadNotifications, markNotificationsAsRead } from '@/app/actions';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface NotificationBellProps {
    user: AuthUser;
}

export function NotificationBell({ user }: NotificationBellProps) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [hasUnread, setHasUnread] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [isOpen, setIsOpen] = useState(false);

    const fetchNotifications = async () => {
        if (!user) return;
        const data = await getUnreadNotifications(user.id);
        setNotifications(data);
        setHasUnread(data.length > 0);
    };

    // Este efecto se ejecuta una vez para ver si hay notificaciones al cargar la página
    useEffect(() => {
        if (user?.id) {
            getUnreadNotifications(user.id).then(data => {
                if (data.length > 0) {
                    setHasUnread(true);
                }
            });
        }
    }, [user?.id]);
    
    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (open) {
            fetchNotifications();
        }
    }

    const handleMarkAllAsRead = () => {
        if (notifications.length === 0) return;

        startTransition(async () => {
            const readIds = notifications.map(n => n.id);
            if (readIds.length > 0) {
                await markNotificationsAsRead(readIds);
                setHasUnread(false);
                setNotifications([]); // Limpia la vista
                setIsOpen(false); // Cierra el popover
            }
        });
    };

    return (
        <Popover open={isOpen} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    {hasUnread && (
                        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-destructive animate-pulse" />
                    )}
                    <Bell className="h-5 w-5" />
                    <span className="sr-only">Notificaciones</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0">
                <div className="p-4 font-medium border-b">
                    <h4>Notificaciones</h4>
                </div>
                <div className="max-h-80 overflow-y-auto">
                    {notifications.length > 0 ? (
                        <ul className="divide-y">
                            {notifications.map(notification => (
                                <li key={notification.id} className="p-4 hover:bg-muted/50">
                                    <Link href={notification.link || '#'} className="block" onClick={() => setIsOpen(false)}>
                                        <p className="text-sm">{notification.message}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: es })}
                                        </p>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center p-8">No tienes notificaciones nuevas.</p>
                    )}
                </div>
                 {notifications.length > 0 && (
                    <div className="p-2 border-t text-center">
                         <Button variant="ghost" size="sm" className="w-full text-muted-foreground" onClick={handleMarkAllAsRead} disabled={isPending}>
                            <CheckCheck className="mr-2 h-4 w-4" /> Marcar todas como leídas
                        </Button>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}
