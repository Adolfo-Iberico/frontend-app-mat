
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Menu,
  Search,
  User,
  Book,
  Newspaper,
  Award,
  Trophy,
} from 'lucide-react';
import { UserNav } from '@/components/user-nav';
import { useAuth } from '@/hooks/use-auth';
import { ThemeToggle } from '../theme-toggle';
import { HeaderAuthModal } from './header-auth-modal';
import { useState, useRef, useEffect } from 'react';
import { Logo } from '../logo';
import { useRouter } from 'next/navigation';
import { getPublicCourses } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import type { Course } from '@/lib/types';
import { NotificationBell } from '../notification-bell';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

function SearchBar({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (isOpen: boolean) => void }) {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { toast } = useToast();
  const searchRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchRef, setIsOpen]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (!query) return;

    const courses = await getPublicCourses();

    let bestMatch: { course: Partial<Course>; score: number } | null = null;

    for (const course of courses) {
      const title = course.title?.toLowerCase() || '';
      const description = course.description?.toLowerCase() || '';
      let score = 0;

      if (title === query) {
        score = 100;
      } else if (title.startsWith(query)) {
        score = 50;
      } else if (title.includes(query)) {
        score = 20;
      }

      if (description.includes(query)) {
        score += 10;
      }

      if (score > 0) {
        if (!bestMatch || score > bestMatch.score) {
          bestMatch = { course, score };
        }
      }
    }

    setIsOpen(false);
    if (bestMatch) {
      router.push(`/courses/${bestMatch.course.id}`);
      setSearchQuery('');
    } else {
      toast({
        title: 'Búsqueda sin resultados',
        description: `No se encontró ninguna lección para "${searchQuery}".`,
        variant: 'destructive',
      });
    }
  };

  return (
    <form
      ref={searchRef}
      onSubmit={handleSearch}
      className={cn(
        'relative flex items-center transition-all duration-300 ease-in-out',
        isOpen ? 'w-full max-w-sm' : 'w-10'
      )}
    >
      <Input
        ref={inputRef}
        type="search"
        placeholder="Buscar lecciones..."
        className={cn(
          'h-10 pl-9 transition-all duration-300 ease-in-out',
          isOpen ? 'w-full opacity-100' : 'w-0 opacity-0'
        )}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        disabled={!isOpen}
      />
      <Button
        type={isOpen ? 'submit' : 'button'}
        variant="ghost"
        size="icon"
        className="absolute left-0 top-1/2 -translate-y-1/2 h-10 w-10 text-muted-foreground z-10"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Buscar"
      >
        <Search className="h-5 w-5" />
      </Button>
    </form>
  );
}

export function Header() {
  const { user, profile, initials } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <>
      <HeaderAuthModal open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} />
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-4 lg:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Alternar menú de navegación</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetTitle className="sr-only">Menú de Navegación</SheetTitle>
              <SheetDescription className="sr-only">
                Menú principal de navegación para explorar el sitio.
              </SheetDescription>
              <nav className="mt-8 grid gap-6 text-lg font-medium">
                <Link
                  href="/"
                  className="flex items-center gap-2 text-lg font-semibold"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Logo className="h-6 w-6" />
                  <span className="text-foreground">Aulamate</span>
                </Link>
                <Link
                  href="/courses"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Lecciones
                </Link>
                <Link
                  href="/paths"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Unidades
                </Link>
                <Link
                  href="/news"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Novedades
                </Link>
                {isClient && user && (
                  <Link
                    href="/my-courses"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Mis Lecciones
                  </Link>
                )}
                {isClient && user && profile?.role === 'user' && (
                  <>
                    <Link
                      href="/achievements"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Insignias
                    </Link>
                    <Link
                      href="/leaderboard"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Ranking
                    </Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>

          <Link
            href="/"
            className="mr-6 flex items-center gap-2 text-xl font-bold"
          >
            <Logo className="h-6 w-6" />
            <span className="hidden text-foreground sm:inline">Aulamate</span>
          </Link>

          <nav className="hidden flex-row items-center gap-5 text-sm lg:flex lg:gap-6">
            <Link
              href="/courses"
              className="font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Lecciones
            </Link>
            <Link
              href="/paths"
              className="font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Unidades
            </Link>
            <Link
              href="/news"
              className="font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Novedades
            </Link>
            {isClient && user && (
              <Link
                href="/my-courses"
                className="font-medium text-muted-foreground transition-colors hover:text-primary flex items-center gap-1"
              >
                <Book className="w-4 h-4" />
                Mis Lecciones
              </Link>
            )}
            {isClient && user && profile?.role === 'user' && (
              <>
                <Link
                  href="/achievements"
                  className="font-medium text-muted-foreground transition-colors hover:text-primary flex items-center gap-1"
                >
                  <Award className="w-4 h-4" />
                  Insignias
                </Link>
                <Link
                  href="/leaderboard"
                  className="font-medium text-muted-foreground transition-colors hover:text-primary flex items-center gap-1"
                >
                  <Trophy className="w-4 h-4" />
                  Ranking
                </Link>
              </>
            )}
          </nav>

          <div className="flex flex-1 items-center justify-end gap-1 sm:gap-2">
            <div className={cn("flex-1 justify-end ml-4", isSearchOpen ? "flex" : "hidden sm:flex")}>
                <SearchBar isOpen={isSearchOpen} setIsOpen={setIsSearchOpen} />
            </div>

            <div className={cn("flex items-center gap-1 sm:gap-2 transition-all duration-300", isSearchOpen ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100")}>
                <ThemeToggle />
            </div>

            {isClient && user && <NotificationBell user={user} />}

            {isClient && user ? (
              <UserNav user={user} profile={profile} initials={initials} />
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsAuthModalOpen(true)}
              >
                <User className="h-5 w-5" />
                <span className="sr-only">Iniciar Sesión</span>
              </Button>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
