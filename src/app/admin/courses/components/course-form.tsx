

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { Course } from '@/lib/types';
import { createCourse, updateCourse, deleteCourse } from '@/app/actions';
import { Switch } from '@/components/ui/switch';

const formSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  description: z.string().min(1, 'La descripción es requerida'),
  content: z.string().min(1, 'El contenido de la lección es requerido'),
  category: z.string().min(1, 'La unidad temática es requerida'),
  topic: z.string().optional(),
  grade: z.string().min(1, 'El grado es requerido'),
  level: z.enum(['Principiante', 'Intermedio', 'Avanzado']),
  estimated_time: z.coerce.number().min(1, 'Duración en minutos').max(999).optional(),
  tags: z.string().optional(),
  is_active: z.boolean().default(true),
});

type CourseFormValues = z.infer<typeof formSchema>;

interface CourseFormProps {
  initialData: Course | null;
  categories: string[];
}

export const CourseForm: React.FC<CourseFormProps> = ({
  initialData,
  categories,
}) => {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const title = initialData ? 'Editar Lección' : 'Crear Lección';
  const description = initialData
    ? 'Edita los detalles de la lección.'
    : 'Publica una nueva lección para tus estudiantes.';
  const toastMessage = initialData ? 'Lección actualizada.' : 'Lección creada.';
  const action = initialData ? 'Guardar cambios' : 'Crear lección';

  const defaultValues: CourseFormValues = initialData
    ? {
        title: initialData.title,
        description: initialData.description,
        content: initialData.long_description ?? '',
        category: initialData.category ?? '',
        topic: initialData.topic ?? '',
        grade: initialData.grade ?? '',
        level: (['Principiante', 'Intermedio', 'Avanzado'].includes(initialData.level)
          ? initialData.level
          : 'Principiante') as CourseFormValues['level'],
        estimated_time: initialData.estimatedTime ?? undefined,
        tags: (initialData.tags ?? []).join(', '),
        is_active: initialData.is_active ?? true,
      }
    : {
        title: '',
        description: '',
        content: '',
        category: '',
        topic: '',
        grade: '',
        level: 'Principiante' as const,
        estimated_time: 30,
        tags: '',
        is_active: true,
      };

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = async (data: CourseFormValues) => {
    try {
      setLoading(true);
      const payload = {
        title: data.title,
        description: data.description,
        content: data.content,
        category: data.category,
        topic: data.topic ?? '',
        grade: data.grade,
        level: data.level,
        estimated_time: data.estimated_time ?? '',
        tags: data.tags ?? '',
        is_active: data.is_active,
      };

      const result = initialData
        ? await updateCourse(params.courseId as string, payload)
        : await createCourse(payload);

      if (!result.success) {
        throw new Error(result.error || 'No se pudo guardar la lección.');
      }

      toast({
        variant: 'success',
        title: 'Éxito',
        description: toastMessage,
      });
      router.push('/admin/courses');
      router.refresh();
    } catch (error: unknown) {
      const err = error as Error;
      toast({
        variant: 'destructive',
        title: 'Algo salió mal.',
        description: err.message || 'No se pudo guardar la lección.',
      });
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      const result = await deleteCourse(params.courseId as string);
      if (!result.success) {
        throw new Error(result.error);
      }
      router.refresh();
      router.push('/admin/courses');
      toast({
        title: 'Lección Eliminada',
        description: 'La lección ha sido eliminada permanentemente.',
      });
    } catch (error: unknown) {
      toast({
        variant: 'destructive',
        title: 'No se pudo eliminar',
        description: error instanceof Error ? error.message : 'Inténtalo de nuevo.',
      });
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
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
            onClick={() => setOpen(true)}
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
          <div className="md:grid md:grid-cols-3 gap-8">
             <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Ej: Ecuaciones Lineales"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-col rounded-lg border p-4">
                  <div className='flex items-center justify-between'>
                    <FormLabel>Publicada</FormLabel>
                     <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </div>
                  <FormDescription>
                    {field.value ? 'La lección está publicada y visible para los estudiantes.' : 'La lección está oculta (borrador).'}
                  </FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="md:col-span-3">
                  <FormLabel>Descripción Corta</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Una descripción breve para las tarjetas de lección."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem className="md:col-span-3">
                  <FormLabel>Contenido (HTML)</FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={loading}
                      rows={10}
                      placeholder="<h2>Tema</h2><p>Explica aquí la lección...</p>"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormDescription>
                    Puedes usar etiquetas HTML sencillas: h2, h3, p, strong, em, ul, li, code.
                    El backend lo sanitiza automáticamente.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unidad temática</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una unidad" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                      {field.value && !categories.includes(field.value) && (
                        <SelectItem value={field.value}>{field.value}</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tema (opcional)</FormLabel>
                   <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Ej: Ecuaciones"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="grade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grado escolar</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un grado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1ro">1° de secundaria</SelectItem>
                      <SelectItem value="2do">2° de secundaria</SelectItem>
                      <SelectItem value="3ro">3° de secundaria</SelectItem>
                      <SelectItem value="4to">4° de secundaria</SelectItem>
                      <SelectItem value="5to">5° de secundaria</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Solo los estudiantes de este grado verán la lección.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nivel de dificultad</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un nivel" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="Principiante">Principiante</SelectItem>
                        <SelectItem value="Intermedio">Intermedio</SelectItem>
                        <SelectItem value="Avanzado">Avanzado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="estimated_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duración estimada (min)</FormLabel>
                   <FormControl>
                    <Input
                      type="number"
                      disabled={loading}
                      placeholder="30"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Etiquetas (separadas por coma)</FormLabel>
                   <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="algebra, ecuaciones"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
