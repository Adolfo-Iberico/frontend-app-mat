
'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { AlertModal } from '@/components/modals/alert-modal';
import { ArrowLeft, FileText, Link as LinkIcon, Loader2, Paperclip, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { notFound } from 'next/navigation';
import { getCourseById, createLesson, deleteLesson, updateLesson, getLessonResources, importLessonResources } from '@/app/actions';
import type { Course, LessonResource } from '@/lib/types';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useForm } from 'react-hook-form';

const contentSchema = z.object({
  content: z.string().min(1, { message: 'El contenido no puede estar vacío.' }),
});

const resourceSchema = z.object({
  title: z.string().min(1, { message: 'El título es requerido.' }),
  type: z.enum(['pdf', 'video', 'image', 'link', 'audio']),
  url: z.string().url({ message: 'Debe ser una URL válida (incluye https://).' }),
});

type ContentFormValues = z.infer<typeof contentSchema>;
type ResourceFormValues = z.infer<typeof resourceSchema>;

export default function CourseContentPage() {
    const params = useParams();
    const courseId = params.courseId as string;
    const { toast } = useToast();
    const [course, setCourse] = useState<Course | null>(null);
    const [resources, setResources] = useState<LessonResource[]>([]);
    const [loading, setLoading] = useState(true);
    const [savingContent, setSavingContent] = useState(false);
    const [addingResource, setAddingResource] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [resourceToDelete, setResourceToDelete] = useState<string | null>(null);

    const contentForm = useForm<ContentFormValues>({
        resolver: zodResolver(contentSchema),
        defaultValues: { content: '' },
    });

    const resourceForm = useForm<ResourceFormValues>({
        resolver: zodResolver(resourceSchema),
        defaultValues: { title: '', type: 'link', url: '' },
    });

    const fetchData = async () => {
        setLoading(true);
        const courseData = await getCourseById(courseId);
        if (courseData) {
            setCourse(courseData as Course);
            contentForm.reset({ content: courseData.long_description ?? '' });
        }
        const resourcesData = await getLessonResources(courseId);
        setResources(resourcesData);
        setLoading(false);
    };

    useEffect(() => {
        if (courseId) {
            fetchData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseId]);

    const handleImportResources = async () => {
        setAddingResource(true);
        const result = await importLessonResources(courseId);
        if (result.success) {
            toast({ variant: 'success', title: 'Recursos importados.', description: result.message });
            const resourcesData = await getLessonResources(courseId);
            setResources(resourcesData);
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        }
        setAddingResource(false);
    };

    const handleSaveContent = async (values: ContentFormValues) => {
        setSavingContent(true);
        const formData = new FormData();
        formData.append('content', values.content);
        const result = await updateLesson(`content-${courseId}`, courseId, formData);
        if (result.success) {
            toast({ variant: 'success', title: 'Contenido actualizado.' });
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        }
        setSavingContent(false);
    };

    const handleAddResource = async (values: ResourceFormValues) => {
        setAddingResource(true);
        const formData = new FormData();
        formData.append('title', values.title);
        formData.append('type', values.type);
        formData.append('url', values.url);
        const result = await createLesson(courseId, formData);
        if (result.success) {
            toast({ variant: 'success', title: 'Recurso añadido.' });
            resourceForm.reset();
            const resourcesData = await getLessonResources(courseId);
            setResources(resourcesData);
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        }
        setAddingResource(false);
    };

    const handleDeleteResource = async () => {
        if (!resourceToDelete) return;
        setAddingResource(true);
        const result = await deleteLesson(resourceToDelete, courseId);
        if (result.success) {
            toast({ variant: 'success', title: 'Recurso eliminado.' });
            const resourcesData = await getLessonResources(courseId);
            setResources(resourcesData);
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        }
        setResourceToDelete(null);
        setDeleteModalOpen(false);
        setAddingResource(false);
    };

    if (loading) return <div className="flex items-center justify-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    if (!course) notFound();

    return (
        <>
        <AlertModal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} onConfirm={handleDeleteResource} loading={addingResource} />
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <Button asChild variant="outline" size="sm" className="mb-4">
                    <Link href="/admin/courses"><ArrowLeft className="mr-2 h-4 w-4" />Volver a Lecciones</Link>
                </Button>
                <Heading title={`Contenido: ${course.title}`} description="Edita el contenido de la lección y gestiona sus recursos adjuntos." />
                <Separator className="mt-6" />

                <Card className="mt-8">
                    <CardHeader>
                        <CardTitle>Contenido de la lección (HTML)</CardTitle>
                        <CardDescription>
                            Texto principal que ven los estudiantes en el reproductor. El backend lo sanitiza automáticamente.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...contentForm}>
                            <form onSubmit={contentForm.handleSubmit(handleSaveContent)} className="space-y-4">
                                <FormField
                                    control={contentForm.control}
                                    name="content"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Contenido</FormLabel>
                                            <FormControl>
                                                <Textarea rows={14} placeholder="<h2>Tema</h2><p>...</p>" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" disabled={savingContent}>
                                    {savingContent && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Guardar contenido
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recursos adjuntos</CardTitle>
                        <CardDescription>
                            PDF, videos, imágenes, audios o enlaces que complementan la lección. Deben ser URLs públicas (https://...).
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <Form {...resourceForm}>
                            <form onSubmit={resourceForm.handleSubmit(handleAddResource)} className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-3">
                                    <FormField
                                        control={resourceForm.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Título</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Ej: Guía de Álgebra" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={resourceForm.control}
                                        name="type"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tipo</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="pdf">PDF</SelectItem>
                                                        <SelectItem value="video">Video</SelectItem>
                                                        <SelectItem value="image">Imagen</SelectItem>
                                                        <SelectItem value="audio">Audio</SelectItem>
                                                        <SelectItem value="link">Enlace</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={resourceForm.control}
                                        name="url"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>URL</FormLabel>
                                                <FormControl>
                                                    <Input type="url" placeholder="https://..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button type="submit" disabled={addingResource}>
                                        {addingResource && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        <Paperclip className="mr-2 h-4 w-4" />
                                        Añadir recurso
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        disabled={addingResource}
                                        onClick={handleImportResources}
                                    >
                                        {addingResource && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Sincronizar Archivos Locales
                                    </Button>
                                </div>

                            </form>
                        </Form>

                        <div>
                            <h3 className="font-semibold mb-4 text-lg">Recursos actuales</h3>
                            <div className="space-y-3">
                                {resources.length > 0 ? (
                                    resources.map((resource, index) => (
                                        <div key={resource.id ?? `res-${index}`} className="flex items-center justify-between p-4 border rounded-lg bg-background">
                                            <div className="flex items-center gap-4 min-w-0">
                                                {resource.type === 'pdf' ? (
                                                    <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                                ) : (
                                                    <LinkIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                                )}
                                                <div className="min-w-0">
                                                    <p className="font-medium truncate">{index + 1}. {resource.title}</p>
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        <span className="uppercase">{resource.type}</span> · {resource.url}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    onClick={() => { setResourceToDelete(resource.id ?? `resource-${index}-${courseId}`); setDeleteModalOpen(true); }}
                                                    disabled={addingResource}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center">
                                        Esta lección aún no tiene recursos adjuntos.
                                    </p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
        </>
    );
}
