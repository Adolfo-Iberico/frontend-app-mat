
'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Profile } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { updateProfile, adminUpdateUser } from '@/app/actions';
import { useRouter } from 'next/navigation';

const profileFormSchema = z.object({
  first_name: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres.' }),
  last_name: z.string().optional(),
  grade: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileFormProps {
  profile: Profile;
  userId: string;
  isAdmin?: boolean;
}

export function ProfileForm({ profile, userId, isAdmin = false }: ProfileFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      first_name: profile.first_name || '',
      last_name: profile.last_name || '',
      grade: profile.grade || '',
    },
    mode: 'onChange',
  });

  async function onSubmit(data: ProfileFormValues) {
    setIsLoading(true);

    const formData = new FormData();
    formData.append('first_name', data.first_name);
    if (data.last_name) formData.append('last_name', data.last_name);
    if (data.grade) formData.append('grade', data.grade);

    const result = isAdmin
      ? await adminUpdateUser(userId, formData)
      : await updateProfile(userId, formData);

    setIsLoading(false);

    if (result.success) {
      toast({
        title: 'Éxito',
        description: 'Tu perfil ha sido actualizado correctamente.',
        variant: 'success'
      });

      if (isAdmin) {
        router.push('/admin/users');
      }

      router.refresh();
      form.reset(data);
    } else {
      toast({
        title: 'Error',
        description: result.error || 'No se pudo actualizar tu perfil. Inténtalo de nuevo.',
        variant: 'destructive',
      });
    }
  }

  const isSaveDisabled = isLoading || !form.formState.isDirty;
  const initials = `${profile.first_name?.[0] || 'N'}${profile.last_name?.[0] || 'N'}`;

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
           <CardHeader>
            <CardTitle>Información Personal</CardTitle>
            <CardDescription>Actualiza tu información personal. Haz clic en guardar cuando termines.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormItem>
              <FormLabel>Avatar</FormLabel>
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile.avatar_url || undefined} alt="Avatar" />
                  <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                </Avatar>
                <FormDescription>
                  El avatar se gestiona desde tu cuenta institucional.
                </FormDescription>
              </div>
            </FormItem>

            <div className="grid md:grid-cols-2 gap-4">
               <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre(s)</FormLabel>
                    <FormControl>
                      <Input placeholder="Tu nombre" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apellido(s)</FormLabel>
                    <FormControl>
                      <Input placeholder="Tus apellidos" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <FormItem>
                <FormLabel>Institución</FormLabel>
                <FormControl>
                  <Input value={profile.institution || 'Sin configurar'} readOnly />
                </FormControl>
                <FormDescription>La institución se administra desde la configuración general.</FormDescription>
              </FormItem>
              <FormField
                control={form.control}
                name="grade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grado escolar</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: 3ro" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormDescription>Si eres estudiante, indica tu grado (1ro–5to).</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button type="submit" disabled={isSaveDisabled}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Cambios
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
