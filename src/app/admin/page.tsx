
'use client';

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { getPlatformStats } from '@/app/actions';
import type { PlatformStats } from '@/lib/types';
import Link from 'next/link';

function DashboardSkeleton() {
    return (
        <>
            <div className="mb-8">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-5 w-1/2 mt-2" />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                           <Skeleton className="h-4 w-1/2" />
                           <Skeleton className="h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-3/4" />
                            <Skeleton className="h-4 w-1/2 mt-1" />
                        </CardContent>
                    </Card>
                ))}
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-8">
                <Card className="col-span-4">
                    <CardHeader>
                        <Skeleton className="h-6 w-1/3" />
                    </CardHeader>
                    <CardContent className="pl-2">
                        <Skeleton className="h-[350px] w-full" />
                    </CardContent>
                </Card>
                <Card className="col-span-4 lg:col-span-3">
                    <CardHeader>
                        <Skeleton className="h-6 w-1/3" />
                        <Skeleton className="h-4 w-2/3" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                             <div key={i} className="flex items-center space-x-4">
                                 <Skeleton className="h-10 w-10 rounded-full" />
                                 <div className="space-y-2">
                                     <Skeleton className="h-4 w-[150px]" />
                                     <Skeleton className="h-4 w-[100px]" />
                                 </div>
                             </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

export default function AdminPage() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { profile, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    const checkAuthAndFetchData = async () => {
        if (!profile) {
            router.push('/login?next=/admin');
            return;
        }
         if (!['admin', 'docente'].includes(profile.role)) {
            router.push('/');
            return;
        }

        try {
            const fetchedStats = await getPlatformStats();
            if (fetchedStats) {
                setStats(fetchedStats);
            }
        } catch (error) {
            console.error('Failed to fetch dashboard stats', error);
        } finally {
            setLoading(false);
        }
    };
    checkAuthAndFetchData();
  }, [router, profile, authLoading]);

  if (loading || authLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <>
        <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl font-headline">Dashboard</h1>
            <p className="text-muted-foreground">
                Un resumen de la plataforma según tu rol ({stats?.role === 'admin' ? 'administrador' : 'docente'}).
            </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {(stats?.cards ?? []).map(card => (
                <Card key={card.label}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{card.label}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{card.value}</div>
                        <p className="text-xs text-muted-foreground">{card.hint}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-8">
            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>{stats?.chartTitle ?? 'Lecciones por unidad'}</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={stats?.chart ?? []}>
                        <XAxis
                        dataKey="name"
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        />
                        <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                        />
                        <Tooltip />
                        <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}/>
                    </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            <Card className="col-span-4 lg:col-span-3">
                <CardHeader>
                    <CardTitle>{stats?.recentTitle ?? 'Recientes'}</CardTitle>
                    <CardDescription>
                        Los últimos registros de la plataforma.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                   {(stats?.recentItems ?? []).length > 0 ? (
                       <div className="space-y-4">
                           {stats?.recentItems.map(item => (
                               <div key={item.id} className="flex items-center">
                                   <div className="h-10 w-10 bg-muted rounded-md flex items-center justify-center mr-4 text-primary font-bold">
                                       {item.title.substring(0, 1).toUpperCase()}
                                   </div>
                                   <div className="flex-1 min-w-0">
                                       <Link href={item.href} className="font-medium hover:underline text-sm block truncate">
                                           {item.title}
                                       </Link>
                                       {item.subtitle && (
                                           <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
                                       )}
                                   </div>
                               </div>
                           ))}
                       </div>
                   ) : (
                       <p className="text-sm text-muted-foreground text-center py-8">Sin registros recientes.</p>
                   )}
                </CardContent>
            </Card>
        </div>
    </>
  );
}
