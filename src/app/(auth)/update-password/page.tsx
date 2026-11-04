
'use client';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { updatePassword } from '@/lib/actions/auth';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, KeyRound, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const formSchema = z.object({
  currentPassword: z.string().min(1, { message: 'Ingresa tu contraseña actual.' }),
  password: z.string().min(8, { message: 'La contraseña debe tener al menos 8 caracteres.' }),
});

export default function UpdatePasswordPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentPassword: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const result = await updatePassword({
      currentPassword: values.currentPassword,
      newPassword: values.password,
    });

    if (!result.success) {
      toast({
        title: 'Error al actualizar',
        description: result.error,
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: '¡Contraseña Actualizada!',
      description: 'Tu contraseña ha sido cambiada con éxito. Las otras sesiones fueron cerradas.',
      variant: 'success',
    });

    setTimeout(() => router.push('/'), 2000);
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 auth-body-bg-themed">
      <Card className="w-full max-w-md">
         <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <KeyRound className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-bold">Crea tu Nueva Contraseña</CardTitle>
            <CardDescription>Asegúrate de que sea segura y fácil de recordar.</CardDescription>
        </CardHeader>
        <CardContent>
             <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                    control={form.control}
                    name="currentPassword"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Contraseña Actual</FormLabel>
                        <FormControl>
                            <Input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                {...field}
                            />
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
                        <FormLabel>Nueva Contraseña</FormLabel>
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
                                {showPassword ? <EyeOff className="w-5 w-5" /> : <Eye className="w-5 h-5" />}
                            </Button>
                            </div>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <Button type="submit" className="w-full mt-2" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Actualizar Contraseña
                    </Button>
                </form>
            </Form>
        </CardContent>
      </Card>
    </div>
  );
}
