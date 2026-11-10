
'use client';

import { getCourseById, getQuizQuestionsByCourseId, saveQuizQuestions } from '@/app/actions';
import { notFound, useParams } from 'next/navigation';
import { Heading } from '@/components/ui/heading';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, PlusCircle, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEffect, useState } from 'react';
import type { Course } from '@/lib/types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface EditorQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

const emptyQuestion = (): EditorQuestion => ({
  question: '',
  options: ['', '', '', ''],
  correctAnswer: '',
});

export default function CourseEvaluationPage() {
    const params = useParams();
    const courseId = params.courseId as string;
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [questions, setQuestions] = useState<EditorQuestion[]>([emptyQuestion()]);
    const { toast } = useToast();

    useEffect(() => {
        const fetchCourseAndQuestions = async () => {
            setLoading(true);
            const courseData = await getCourseById(courseId);
            if (courseData) {
                setCourse(courseData as Course);
            }
            const existingQuestions = await getQuizQuestionsByCourseId(courseId);
            if (existingQuestions.length > 0) {
                setQuestions(
                    existingQuestions.map(q => ({
                        question: q.question,
                        options: Array.isArray(q.options) ? q.options : [],
                        correctAnswer: q.correctAnswer ?? '',
                    }))
                );
            }
            setLoading(false);
        };
        fetchCourseAndQuestions();
    }, [courseId]);

    const handleQuestionChange = (index: number, value: string) => {
        const newQuestions = [...questions];
        newQuestions[index].question = value;
        setQuestions(newQuestions);
    };

    const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options[oIndex] = value;
        setQuestions(newQuestions);
    };

    const handleCorrectAnswerChange = (qIndex: number, value: string) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].correctAnswer = value;
        setQuestions(newQuestions);
    };

    const addQuestion = () => {
        if (questions.length < 10) {
            setQuestions([...questions, emptyQuestion()]);
        }
    };

    const removeQuestion = (index: number) => {
        if (questions.length > 1) {
            setQuestions(questions.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);
        const result = await saveQuizQuestions(courseId, questions);

        if (result.success) {
            toast({
                variant: 'success',
                title: 'Evaluación guardada',
                description: 'Las preguntas se sincronizaron con la evaluación de la lección.'
            });
        } else {
             toast({
                variant: 'destructive',
                title: 'Error',
                description: result.error
            });
        }
        setIsSubmitting(false);
    }

    if (loading) {
        return <div className="flex items-center justify-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (!course) {
        notFound();
    }

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between">
                    <div>
                        <Button asChild variant="outline" size="sm" className="mb-4">
                           <Link href={`/admin/courses/${courseId}`}>
                               <ArrowLeft className="mr-2 h-4 w-4" />
                               Volver a la lección
                           </Link>
                        </Button>
                        <Heading
                            title={`Evaluación: ${course.title}`}
                            description="Crea y gestiona las preguntas de la evaluación de esta lección. La calificación es automática en el servidor (escala 0–20)."
                        />
                    </div>
                </div>
                <Separator className="mt-6" />

                <Card className="mt-8">
                    <CardHeader>
                        <CardTitle>Constructor de la evaluación</CardTitle>
                        <CardDescription>
                            Añade hasta 10 preguntas. Cada pregunta de opción múltiple debe tener 4 alternativas y una respuesta correcta.
                            Para preguntas de respuesta corta, deja las alternativas vacías: el estudiante escribirá su respuesta.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                       <form onSubmit={handleSubmit} className="space-y-8">
                            {questions.map((q, qIndex) => (
                                <div key={qIndex} className="p-6 border rounded-lg bg-muted/50 relative">
                                    <h3 className="font-semibold mb-4 text-lg">{`Pregunta ${qIndex + 1}`}</h3>
                                     {questions.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute top-4 right-4 text-destructive hover:bg-destructive/10"
                                            onClick={() => removeQuestion(qIndex)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor={`question-${qIndex}`}>Enunciado de la pregunta</Label>
                                            <Textarea
                                                id={`question-${qIndex}`}
                                                placeholder={`Ej: Resuelve 2x + 6 = 14`}
                                                value={q.question}
                                                onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Alternativas de respuesta</Label>
                                            <RadioGroup
                                                value={q.correctAnswer}
                                                onValueChange={(value) => handleCorrectAnswerChange(qIndex, value)}
                                                className="space-y-2"
                                            >
                                                {q.options.map((opt, oIndex) => (
                                                    <div key={oIndex} className="flex items-center gap-2">
                                                         <RadioGroupItem value={opt} id={`q${qIndex}-o${oIndex}`} />
                                                         <Input
                                                            id={`q${qIndex}-o${oIndex}-input`}
                                                            placeholder={`Opción ${String.fromCharCode(65 + oIndex)} (vacío = pregunta abierta)`}
                                                            value={opt}
                                                            onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                                        />
                                                    </div>
                                                ))}
                                            </RadioGroup>
                                             <p className="text-xs text-muted-foreground">Selecciona el círculo junto a la respuesta correcta.</p>
                                        </div>
                                    </div>
                                </div>
                            ))

                            }

                             <div className="flex items-center gap-4 pt-4">
                                <Button type="button" variant="outline" onClick={addQuestion} disabled={questions.length >= 10}>
                                    <PlusCircle className="h-4 w-4 mr-2"/>
                                    Añadir otra pregunta
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                     {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Guardar evaluación
                                </Button>
                            </div>
                       </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
