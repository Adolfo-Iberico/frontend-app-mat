

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { LoginForm } from './login-form';
import { SignupForm } from '../signup/signup-form';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { completeGoogleSignIn } from '@/lib/actions/auth';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import type { Profile } from '@/lib/types';

function AuthPageComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useAuth();
  const { toast } = useToast();
  const initialTab = searchParams.get('tab') === 'register' ? 'register' : 'login';
  const [tab, setTab] = useState<'login' | 'register'>(initialTab);
  const [next] = useState(() => searchParams.get('next') || '/');
  const handledGoogleCode = useRef<string | null>(null);
  const handledGoogleError = useRef<string | null>(null);

  const handleSuccess = useCallback((role?: Profile['role']) => {
    const destination = next !== '/'
      ? next
      : role === 'admin' || role === 'docente'
        ? '/admin'
        : '/';
    router.replace(destination);
    router.refresh();
  }, [next, router]);

  useEffect(() => {
    const code = searchParams.get('auth_code');
    const googleError = searchParams.get('error');

    if (googleError && handledGoogleError.current !== googleError) {
      handledGoogleError.current = googleError;
      toast({
        title: 'No se pudo iniciar sesión con Google',
        description: googleError === 'inactive'
          ? 'Tu cuenta está inactiva. Contacta al administrador.'
          : 'Inténtalo de nuevo.',
        variant: 'destructive',
      });
      router.replace('/login?tab=login');
      return;
    }

    if (!code || handledGoogleCode.current === code) return;
    handledGoogleCode.current = code;

    const completeSignIn = async () => {
      try {
        const result = await completeGoogleSignIn(code);
        router.replace('/login?tab=login');

        if (!result.success) {
          toast({
            title: 'No se pudo iniciar sesión con Google',
            description: result.error,
            variant: 'destructive',
          });
          return;
        }

        await refresh();
        handleSuccess(result.data?.role);
      } catch (error) {
        router.replace('/login?tab=login');
        toast({
          title: 'No se pudo iniciar sesión con Google',
          description: error instanceof Error ? error.message : 'Inténtalo de nuevo.',
          variant: 'destructive',
        });
      }
    };

    void completeSignIn();
  }, [searchParams, router, refresh, toast, handleSuccess]);

  // Effect to sync tab state with URL without full navigation
  useEffect(() => {
    const newPath = `/login?tab=${tab}`;
    window.history.replaceState({ ...window.history.state, as: newPath, url: newPath }, '', newPath);
  }, [tab]);


  return (
    <div className="flex min-h-screen items-center justify-center p-4 relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute -top-28 -right-24 h-80 w-80 rounded-full bg-primary/20 blur-3xl dark:bg-primary/30" />
      <div aria-hidden className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-accent/20 blur-3xl dark:bg-accent/20" />
      
      <div className="w-full max-w-md">
        <Card className="bg-card/80 dark:bg-card/60 backdrop-blur-xl shadow-lg overflow-hidden">
           <div className="grid grid-cols-2 text-center text-muted-foreground text-sm font-medium bg-muted/50 backdrop-blur">
             <button
              className={`py-3 transition-all relative ${
                tab === "login" ? "text-foreground" : "hover:text-foreground"
              }`}
              onClick={() => setTab("login")}
            >
              <span className="tracking-wide">Iniciar Sesión</span>
              {tab === "login" && (
                <span className="absolute left-4 right-4 -bottom-px h-0.5 bg-primary rounded-full" />
              )}
            </button>
            <button
              className={`py-3 transition-all relative ${
                tab === "register" ? "text-foreground" : "hover:text-foreground"
              }`}
              onClick={() => setTab("register")}
            >
              <span className="tracking-wide">Registrarse</span>
              {tab === "register" && (
                <span className="absolute left-4 right-4 -bottom-px h-0.5 bg-primary rounded-full" />
              )}
            </button>
          </div>
          <CardContent className="p-6 md:p-8">
            {tab === 'login' ? <LoginForm onSuccess={handleSuccess} /> : <SignupForm onSuccess={handleSuccess} />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


export default function LoginPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <AuthPageComponent />
    </Suspense>
  )
}
