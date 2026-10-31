

'use client'

import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { getGoogleSignInUrl, signIn } from '@/lib/actions/auth'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { Loader2, User, Eye, EyeOff } from 'lucide-react'
import { ForgotPasswordModal } from './forgot-password-modal'
import type { Profile } from '@/lib/types'

const formSchema = z.object({
  email: z.string().email({ message: 'Por favor, introduce un correo electrónico válido.' }),
  password: z.string().min(1, { message: 'La contraseña es requerida.' }),
})

interface LoginFormProps {
  onSuccess?: (role?: Profile['role']) => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { toast } = useToast()
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPasswordModalOpen, setForgotPasswordModalOpen] = useState(false);
  const [isGoogleLoading, setGoogleLoading] = useState(false);
  const { refresh } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const result = await signIn(values)

    if (!result.success) {
      toast({
        title: 'Error de autenticación',
        description: result.error,
        variant: 'destructive',
      })
      return
    }

    toast({
        title: 'Éxito',
        description: 'Has iniciado sesión correctamente.',
        variant: 'success',
    });


    await refresh();
    onSuccess?.(result.data?.role);
  }

  async function onGoogleSignIn() {
    setGoogleLoading(true);
    try {
      window.location.assign(await getGoogleSignInUrl());
    } catch (error) {
      setGoogleLoading(false);
      toast({
        title: 'No se pudo iniciar sesión con Google',
        description: error instanceof Error ? error.message : 'Inténtalo de nuevo.',
        variant: 'destructive',
      });
    }
  }

  return (
    <>
      <ForgotPasswordModal open={isForgotPasswordModalOpen} onOpenChange={setForgotPasswordModalOpen} />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
           <div className="mx-auto mb-2 h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <User className="h-5 w-5" />
           </div>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo electrónico</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="tucorreo@ejemplo.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between items-baseline">
                  <FormLabel>Contraseña</FormLabel>
                   <button type="button" onClick={() => setForgotPasswordModalOpen(true)} className="text-sm text-primary hover:underline">¿Olvidaste tu contraseña?</button>
                </div>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      {...field}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute inset-y-0 right-0 h-full px-3 text-muted-foreground hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full mt-2" disabled={form.formState.isSubmitting || isGoogleLoading}>
            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Iniciar Sesión
          </Button>
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">O continúa con</span>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={onGoogleSignIn}
            disabled={form.formState.isSubmitting || isGoogleLoading}
          >
            {isGoogleLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <span aria-hidden="true" className="mr-2 font-bold text-base text-blue-600">G</span>
            )}
            Continuar con Google
          </Button>
        </form>
      </Form>
    </>
  )
}
