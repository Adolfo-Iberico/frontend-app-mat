
'use client';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Settings,
  BookOpen,
  ChevronDown,
  ClipboardCheck,
  MessageSquare,
  Newspaper,
  LogOut,
  Home,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/logo';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { profile, signOut } = useAuth();
  const router = useRouter();

  const isAdmin = profile?.role === 'admin';
  const isTeacher = profile?.role === 'docente';

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="none">
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <Logo className="h-6 w-6" />
            <h1 className="text-xl font-bold font-headline">Aulamate</h1>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === '/admin'}
                tooltip="Dashboard"
              >
                <Link href="/admin">
                  <LayoutDashboard />
                  Dashboard
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {isTeacher && (
              <>
                <SidebarMenuItem>
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                         <SidebarMenuButton
                            className="w-full justify-between"
                            isActive={pathname.startsWith('/admin/courses') || pathname.startsWith('/admin/questions')}
                        >
                            <BookOpen />
                            <div className='flex items-center gap-2 justify-between w-full'>
                               <span>Contenido</span>
                               <ChevronDown className="h-4 w-4" />
                            </div>
                        </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <SidebarMenuSub>
                            <SidebarMenuSubItem>
                                <SidebarMenuSubButton asChild isActive={pathname.startsWith('/admin/courses')}>
                                    <Link href="/admin/courses">Gestionar Lecciones</Link>
                                </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                            <SidebarMenuSubItem>
                                <SidebarMenuSubButton asChild isActive={pathname.startsWith('/admin/questions')}>
                                    <Link href="/admin/questions">
                                        <span className="flex items-center gap-2">
                                            <MessageSquare className="w-4 h-4" />
                                            Foro de discusión
                                        </span>
                                    </Link>
                                </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                        </SidebarMenuSub>
                    </CollapsibleContent>
                  </Collapsible>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/students')}>
                    <Link href="/admin/students"><Users /> Seguimiento de estudiantes</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/reports')}>
                    <Link href="/admin/reports"><ClipboardCheck /> Reportes académicos</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </>
            )}

            {isAdmin && (
              <>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/reports')}>
                    <Link href="/admin/reports"><ClipboardCheck /> Reportes académicos</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith('/admin/users')}
                    tooltip="Usuarios"
                  >
                    <Link href="/admin/users">
                      <Users />
                      Usuarios
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith('/admin/news')}
                    tooltip="Anuncios"
                  >
                    <Link href="/admin/news">
                      <Newspaper />
                      Anuncios
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith('/admin/settings')}
                    tooltip="Ajustes"
                  >
                    <Link href="/admin/settings">
                      <Settings />
                      Ajustes
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </>
            )}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
           <div className="flex flex-col gap-2">
                <Button variant="ghost" asChild>
                    <Link href="/">
                        <Home className="mr-2 h-4 w-4" /> Ir al Inicio
                    </Link>
                </Button>
                <Button variant="destructive" onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
                </Button>
           </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
