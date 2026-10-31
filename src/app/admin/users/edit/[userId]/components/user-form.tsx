
'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { type Profile } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { updateUserRole, setUserActive } from '@/app/actions';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';

const formSchema = z.object({
  role: z.enum(['user', 'docente']),
});

type UserFormValues = z.infer<typeof formSchema>;

interface UserFormProps {
  initialData: Profile;
}

export const UserForm: React.FC<UserFormProps> = ({ initialData }) => {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: initialData.role === 'admin' ? 'docente' : initialData.role,
    },
  });

  const onSubmit = async (data: UserFormValues) => {
    setIsLoading(true);
    const result = await updateUserRole(initialData.id, data.role);
    setIsLoading(false);

    if (result.success) {
      toast({
        variant: 'success',
        title: 'Éxito',
        description: 'El rol del usuario ha sido actualizado.',
      });
      router.push('/admin/users');
      router.refresh();
    } else {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
       <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
                <CardTitle>Información del Usuario</CardTitle>
                <CardDescription>
                Aquí puedes ver la información del usuario y cambiar su rol.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-2">
                    <Label>Nombre Completo</Label>
                    <Input disabled value={`${initialData.first_name || ''} ${initialData.last_name || ''}`} />
                </div>
                 <div className="grid gap-2">
                    <Label>Correo Electrónico</Label>
                    <Input disabled value={initialData.email || 'No disponible'} />
                </div>
                {initialData.role === 'admin' && (
                  <div className="grid gap-2">
                      <Label>Rol</Label>
                      <Badge className="w-fit">Administrador (no editable)</Badge>
                  </div>
                )}
                {initialData.role !== 'admin' && (
                  <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                      <FormItem>
                      <FormLabel>Rol</FormLabel>
                      <Select
                          disabled={isLoading}
                          onValueChange={field.onChange}
                          value={field.value}
                      >
                          <FormControl>
                          <SelectTrigger>
                              <SelectValue placeholder="Selecciona un rol" />
                          </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                          <SelectItem value="docente">Docente</SelectItem>
                          <SelectItem value="user">Estudiante</SelectItem>
                          </SelectContent>
                      </Select>
                      <FormMessage />
                      </FormItem>
                  )}
                  />
                )}
                <div className="grid gap-2">
                    <Label>Estado de la cuenta</Label>
                    <div className="flex items-center gap-3">
                      <Badge variant={initialData.is_active === false ? 'destructive' : 'default'}>
                        {initialData.is_active === false ? 'Inactiva' : 'Activa'}
                      </Badge>
                      {initialData.role !== 'admin' && (
                        <Button
                          type="button"
                          variant={initialData.is_active === false ? 'default' : 'outline'}
                          size="sm"
                          disabled={isLoading}
                          onClick={async () => {
                            setIsLoading(true);
                            const result = await setUserActive(initialData.id, initialData.is_active === false);
                            setIsLoading(false);
                            if (result.success) {
                              toast({
                                variant: 'success',
                                title: 'Éxito',
                                description: initialData.is_active === false
                                  ? 'La cuenta fue activada.'
                                  : 'La cuenta fue desactivada y sus sesiones revocadas.',
                              });
                              router.refresh();
                            } else {
                              toast({ title: 'Error', description: result.error, variant: 'destructive' });
                            }
                          }}
                        >
                          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          {initialData.is_active === false ? 'Activar cuenta' : 'Desactivar cuenta'}
                        </Button>
                      )}
                    </div>
                </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
                <Button type="submit" disabled={isLoading || !form.formState.isDirty}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Guardar Cambios
                </Button>
            </CardFooter>
        </form>
       </Form>
    </Card>
  );
};
