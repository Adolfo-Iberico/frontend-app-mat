

'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import type { AuthUser, Profile } from "@/lib/types";
import Link from "next/link";
import { Gem, User as UserIcon, LogOut, Home, Award, Trophy } from 'lucide-react';


interface UserNavProps {
    user: AuthUser | null;
    profile: Profile | null;
    initials: string;
    isAdminPanel?: boolean;
}

export function UserNav({ user, profile, initials, isAdminPanel = false }: UserNavProps) {
    const router = useRouter();
    const { signOut } = useAuth();

    const handleSignOut = async () => {
        await signOut();
        router.push('/');
        router.refresh();
    }

  const firstName = profile?.first_name;
  const lastName = profile?.last_name;
  const email = user?.email;
  const role = profile?.role;
  const avatarUrl = profile?.avatar_url;


  if (!user || !profile) {
    return null;
  }


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={avatarUrl || ''} alt="Avatar de usuario" />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{firstName} {lastName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isAdminPanel ? (
          <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  <span>Ir a la Página Principal</span>
                </Link>
              </DropdownMenuItem>
          </DropdownMenuGroup>
        ) : (
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Mi Perfil</span>
              </Link>
            </DropdownMenuItem>
            {role === 'user' && (
              <>
                <DropdownMenuItem asChild>
                  <Link href="/achievements">
                    <Award className="mr-2 h-4 w-4" />
                    <span>Insignias y Logros</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/leaderboard">
                    <Trophy className="mr-2 h-4 w-4" />
                    <span>Ranking</span>
                  </Link>
                </DropdownMenuItem>
              </>
            )}
            {role && ['admin', 'docente'].includes(role) && (
              <DropdownMenuItem asChild>
                  <Link href="/admin">
                    <Gem className="mr-2 h-4 w-4" />
                    <span>Panel de Admin</span>
                  </Link>
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
