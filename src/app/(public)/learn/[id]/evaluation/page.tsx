'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, XCircle, RotateCw } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { Course, EvaluationQuestion, EvaluationSubmissionResult } from '@/lib/types';
import { getCourseById, getEvaluationQuestions, submitEvaluation } from '@/app/actions';
import { notFound, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

/** Nota mínima para aprobar en la escala vigesimal (0–20). */
const PASSING_SCORE = 11;

function EvaluationSkeleton() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
      <Card className="w-full max-w-3xl shadow-2xl">
        <CardHeader className="text-center">
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-1/2 mx-auto mt-2" />
          <div className="pt-4 space-y-2">
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-4 w-1/4 mx-auto" />
          </div>
        </CardHeader>
        <CardContent className="px-6 py-8 sm:px-8 space-y-6">
          <Skeleton className="h-6 w-full mb-6" />
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 bg-background border rounded-lg p-4">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-5 flex-1" />
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Skeleton className="h-10 w-36" />
        </CardFooter>
      </Card>
    </div>
  );
}

export default function EvaluationPage() {
  const params = useParams();
  const courseId = params.id as string;
  const { profile, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [course, setCourse] = useState<Course | null>(null);
  const [questions, setQuestions] = useState<EvaluationQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<EvaluationSubmissionResult | null>(null);

  const isStaff = ['admin', 'docente'].includes(profile?.role ?? '');

  useEffect(() => {
    const fetchCourseAndQuestions = async () => {
      setLoading(true);
      const courseData = await getCourseById(courseId);
      if (courseData) {
        setCourse(courseData as Course);
      }

      const existingQuestions = await getEvaluationQuestions(courseId);
      setQuestions(existingQuestions);
      setLoading(false);
    };
    fetchCourseAndQuestions();
  }, [courseId]);

  if (loading || authLoading) {
    return <EvaluationSkeleton />;
  }

  if (!course) {
    notFound();
  }

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
        <Card className="w-full max-w-2xl text-center shadow-2xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold font-headline">Evaluación no disponible</CardTitle>
            <CardDescription>Lección: {course.title}</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Esta lección todavía no tiene una evaluación publicada.</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button asChild variant="outline">
              <Link href={`/learn/${courseId}`}>Volver a la lección</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const handleAnswerChange = (questionId: string, value: string) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleSubmit = async () => {
    // El docente/admin solo previsualiza: no envía respuestas.
    if (isStaff) {
      toast({
        title: 'Vista previa',
        description: 'Los docentes no rinden evaluaciones. Esta es solo una vista previa con las respuestas correctas.',
      });
      return;
    }

    setIsSubmitting(true);
    const answers = questions
      .filter(question => selectedAnswers[question.id])
      .map(question => ({ question_id: question.id, answer: selectedAnswers[question.id] }));

    const submission = await submitEvaluation(courseId, answers);

    if ('success' in submission && submission.success) {
      setResult(submission);
    } else {
      toast({
        title: 'No se pudo enviar la evaluación',
        description: 'error' in submission ? submission.error : 'Inténtalo de nuevo.',
        variant: 'destructive',
      });
    }
    setIsSubmitting(false);
  };

  const handleRetry = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setResult(null);
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const isPassed = (result?.score ?? 0) >= PASSING_SCORE;

  // ---- Pantalla de resultados (calificación del servidor) ----
  if (result) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
        <Card className="w-full max-w-2xl text-center shadow-2xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold font-headline">Resultados de la Evaluación</CardTitle>
            <CardDescription>Lección: {course.title}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div
              className={cn(
                'flex flex-col items-center justify-center p-6 rounded-lg',
                isPassed ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
              )}
            >
              {isPassed ? (
                <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
              ) : (
                <XCircle className="w-16 h-16 text-red-500 mb-4" />
              )}
              <p className="text-4xl font-bold">{result.score.toFixed(1)} / 20</p>
              <p className="text-muted-foreground text-lg">
                {result.correctAnswers} de {result.totalQuestions} respuestas correctas
              </p>
            </div>
            {result.gradingWarning && (
              <Alert>
                <AlertTitle>Calificación parcial</AlertTitle>
                <AlertDescription>
                  Una respuesta de texto abierto no pudo calificarse automáticamente y quedó sin puntos. Contacta a tu docente para revisarla.
                </AlertDescription>
              </Alert>
            )}
            {result.answers && result.answers.length > 0 && (
              <div className="space-y-3 text-left">
                <h2 className="text-lg font-semibold">Revisión de respuestas</h2>
                {result.answers.map((answer, index) => (
                  <div key={answer.questionId || index} className="rounded-lg border p-4">
                    <p className="font-medium">{index + 1}. {answer.question}</p>
                    <p className={answer.isCorrect ? 'mt-2 text-green-700 dark:text-green-400' : 'mt-2 text-destructive'}>
                      Tu respuesta: {answer.answer || 'Sin respuesta'}
                      {answer.isCorrect ? ' · Correcta' : ' · Incorrecta'}
                    </p>
                    {!answer.isCorrect && answer.correctAnswer && (
                      <p className="mt-1 text-sm">Respuesta correcta: {answer.correctAnswer}</p>
                    )}
                    {answer.explanation && (
                      <p className="mt-2 text-sm text-muted-foreground">Explicación: {answer.explanation}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
            <Alert variant={isPassed ? 'default' : 'destructive'} className={cn(isPassed && 'border-green-500')}>
              <AlertTitle className="text-xl font-bold">
                {isPassed ? '¡Felicidades, has aprobado!' : 'Necesitas mejorar'}
              </AlertTitle>
              <AlertDescription className="text-base mt-2">
                {isPassed
                  ? 'Superaste la evaluación de esta lección. ¡Sigue con la siguiente!'
                  : `Necesitas al menos ${PASSING_SCORE}/20 para aprobar. Repasa la lección y vuelve a intentarlo.`}
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-center gap-4">
            <Button onClick={handleRetry} variant="outline" size="lg">
              <RotateCw className="mr-2 h-5 w-5" /> Volver a intentar
            </Button>
            <Button asChild size="lg">
              <Link href={`/learn/${courseId}`}>Volver a la lección</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // ---- Vista previa para docentes (con respuestas correctas) ----
  if (isStaff) {
    return (
      <div className="flex items-start justify-center min-h-screen bg-muted/40 p-4 py-10">
        <Card className="w-full max-w-3xl shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl sm:text-3xl font-bold font-headline">Vista previa de la Evaluación</CardTitle>
            <CardDescription>
              Lección: {course.title} · {questions.length} preguntas · los estudiantes no ven las respuestas
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 py-8 sm:px-8 space-y-6">
            {questions.map((question, index) => (
              <div key={question.id} className="bg-background border rounded-lg p-4">
                <p className="font-semibold mb-3">
                  {index + 1}. {question.question_text}
                </p>
                {question.options.length > 0 ? (
                  <ul className="space-y-1">
                    {question.options.map(option => (
                      <li
                        key={`${question.id}-${option.value}`}
                        className={cn(
                          'text-sm px-3 py-2 rounded',
                          question.correct_answer === option.value
                            ? 'bg-green-100 dark:bg-green-900/40 font-semibold'
                            : 'bg-muted/50'
                        )}
                      >
                        {option.label}. {option.value}
                        {question.correct_answer === option.value && ' ✓'}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm px-3 py-2 rounded bg-green-100 dark:bg-green-900/40 font-semibold">
                    Respuesta: {question.correct_answer} ✓
                  </p>
                )}
                {question.explanation && (
                  <p className="text-xs text-muted-foreground mt-2">Explicación: {question.explanation}</p>
                )}
              </div>
            ))}
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button asChild variant="outline">
              <Link href={`/learn/${courseId}`}>Volver a la lección</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // ---- Cuestionario para estudiantes ----
  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
      <Card className="w-full max-w-3xl shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl sm:text-3xl font-bold font-headline">Evaluación de la Lección</CardTitle>
          <CardDescription>Lección: {course.title}</CardDescription>
          <div className="pt-4">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground mt-2">
              Pregunta {currentQuestionIndex + 1} de {questions.length}
            </p>
          </div>
        </CardHeader>
        <CardContent className="px-6 py-8 sm:px-8">
          <h3 className="text-lg sm:text-xl font-semibold mb-6">{currentQuestion.question_text}</h3>
          {currentQuestion.options.length > 0 ? (
            <RadioGroup
              value={selectedAnswers[currentQuestion.id] || ''}
              onValueChange={value => handleAnswerChange(currentQuestion.id, value)}
              className="space-y-4"
            >
              {currentQuestion.options.map(option => (
                <div
                  key={`${currentQuestion.id}-${option.value}`}
                  className="flex items-center space-x-3 bg-background border rounded-lg p-4 transition-colors hover:bg-muted/50 has-[:checked]:bg-primary/10 has-[:checked]:border-primary"
                >
                  <RadioGroupItem value={option.value} id={`q-${currentQuestion.id}-${option.label}`} />
                  <Label htmlFor={`q-${currentQuestion.id}-${option.label}`} className="text-base cursor-pointer flex-1">
                    {option.label}. {option.value}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          ) : (
            <Input
              placeholder="Escribe tu respuesta..."
              value={selectedAnswers[currentQuestion.id] ?? ''}
              onChange={e => handleAnswerChange(currentQuestion.id, e.target.value)}
              className="text-base"
            />
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          {currentQuestionIndex > 0 ? (
            <Button variant="outline" onClick={() => setCurrentQuestionIndex(prev => prev - 1)}>
              Anterior
            </Button>
          ) : (
            <span />
          )}
          {currentQuestionIndex < questions.length - 1 ? (
            <Button onClick={handleNext} disabled={!selectedAnswers[currentQuestion.id]}>
              Siguiente Pregunta
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || Object.keys(selectedAnswers).length !== questions.length}
            >
              {isSubmitting ? 'Calificando...' : 'Finalizar y Calificar'}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
