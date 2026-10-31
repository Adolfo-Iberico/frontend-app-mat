
'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Trash, Loader2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/heading';
import { AlertModal } from '@/components/modals/alert-modal';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { NewsArticle } from '@/lib/types';
import { createNewsArticle, updateNewsArticle, deleteNewsArticle } from '@/app/actions';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const formSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  description: z.string().min(1, 'El contenido del anuncio es requerido'),
  type: z.enum(['info', 'warning', 'success']),
  is_active: z.boolean().default(true),
});

type NewsFormValues = z.input<typeof formSchema>;

interface NewsFormProps {
  initialData: (NewsArticle & { isActive?: boolean; type?: string }) | null;
}

export const NewsForm: React.FC<NewsFormProps> = ({ initialData }) => {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const title = initialData ? 'Editar Anuncio' : 'Crear Anuncio';
  const description = initialData
    ? 'Edita los detalles del anuncio global.'
    : 'Publica un anuncio visible para todos los usuarios; opcionalmente se notifica en la app.';
  const toastMessage = initialData ? 'Anuncio actualizado.' : 'Anuncio creado.';
  const action = initialData ? 'Guardar cambios' : 'Crear anuncio';

  const form = useForm<NewsFormValues>({
    resolver: zodResolver(formSchema, undefined, { raw: true }),
    defaultValues: initialData
      ? {
          title: initialData.title,
          description: initialData.description,
          type: (['info', 'warning', 'success'].includes(initialData.type ?? '')
            ? initialData.type
            : 'info') as NewsFormValues['type'],
          is_active: initialData.isActive ?? true,
        }
      : {
          title: '',
          description: '',
          type: 'info' as const,
          is_active: true,
        },
  });

  const onSubmit = async (values: NewsFormValues) => {
    try {
      setLoading(true);
      const data = formSchema.parse(values);
      const payload = {
        title: data.title,
        description: data.description,
        type: data.type,
        is_active: data.is_active,
      };

      const result = initialData
        ? await updateNewsArticle(params.newsId as string, payload)
        : await createNewsArticle(payload);

      if (!result.success) {
        throw new Error(result.error || 'No se pudo guardar el anuncio.');
      }

      toast({
        variant: 'success',
        title: 'Éxito',
        description: toastMessage,
      });
      router.push('/admin/news');
      router.refresh();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Algo salió mal.',
        description: error instanceof Error ? error.message : 'No se pudo guardar el anuncio.',
      });
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      const result = await deleteNewsArticle(params.newsId as string);
      if (!result.success) throw new Error(result.error);
      router.refresh();
      router.push('/admin/news');
      toast({
        title: 'Anuncio Eliminado',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Algo salió mal.',
        description: error instanceof Error ? error.message : 'No se pudo eliminar el anuncio.',
      });
    } finally {
      setLoading(false);
      setOpenDeleteModal(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
        {initialData && (
          <Button
            disabled={loading}
            variant="destructive"
            size="sm"
            onClick={() => setOpenDeleteModal(true)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full"
        >
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Ej: Nuevas lecciones de Trigonometría"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contenido del anuncio</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={5}
                      disabled={loading}
                      placeholder="Escribe el mensaje que verán todos los usuarios..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de aviso</FormLabel>
                    <Select
                      disabled={loading}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="info">Información</SelectItem>
                        <SelectItem value="warning">Advertencia</SelectItem>
                        <SelectItem value="success">Éxito</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-col rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <FormLabel>Visible</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </div>
                    <FormDescription>
                      {field.value
                        ? 'El anuncio está activo y visible en Novedades.'
                        : 'El anuncio está oculto (borrador).'}
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>
          </div>
          <Button disabled={loading} className="ml-auto" type="submit">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {action}
          </Button>
        </form>
      </Form>
    </>
  );
};
