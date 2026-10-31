
'use client';

import { useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send, Loader2, MoreVertical, Trash2, Medal } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { postQuestion, postAnswer, deleteAnswer, getQuestionsByCourseId } from '@/app/actions';
import type { Question, Answer } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { AlertModal } from '@/components/modals/alert-modal';
import Link from 'next/link';

interface QAndASectionProps {
  lessonId?: string;
  courseId: string;
}

export function QAndASection({ lessonId, courseId }: QAndASectionProps) {
  const { toast } = useToast();
  const { user, profile, initials } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isPostingQuestion, setIsPostingQuestion] = useState(false);
  const [isPostingAnswer, setIsPostingAnswer] = useState<string | null>(null); // questionId
  const [isDeleting, setIsDeleting] = useState<string | null>(null); // answerId

  const [newQuestionContent, setNewQuestionContent] = useState('');
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const [deleteAlert, setDeleteAlert] = useState<{ isOpen: boolean; type: 'answer'; id: string | null }>({ isOpen: false, type: 'answer', id: null });


  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
        // El "curso" de la UI es la lección real del backend: los hilos
        // siempre se consultan por el id de la lección.
        const questionsData = await getQuestionsByCourseId(courseId);
        setQuestions(questionsData);
    } catch (error) {
        console.error(error);
        toast({ title: "Error", description: "No se pudieron cargar las preguntas.", variant: "destructive" });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if(user && courseId) {
      fetchQuestions();
    }
  }, [courseId, user]);

  const handlePostQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionContent.trim() || !user || !profile || !lessonId) return;
    setIsPostingQuestion(true);

    const result = await postQuestion({
      lessonId: lessonId,
      course_id: courseId,
      userId: user.id,
      title: newQuestionContent.substring(0, 50) + '...',
      content: newQuestionContent,
    });

    setIsPostingQuestion(false);
    if (result.success) {
        setNewQuestionContent('');
        // Recargar para mostrar el hilo con los datos del backend.
        fetchQuestions();
    } else {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };

  const handlePostAnswer = async (questionId: string) => {
    if (!replyContent.trim() || !user || !profile) return;
    setIsPostingAnswer(questionId);

    const isInstructor = ['admin', 'docente'].includes(profile.role);

    const tempId = `temp-a-${Date.now()}`;
    const newAnswer: Answer = {
        id: tempId,
        question_id: questionId,
        user_id: user.id,
        author: {
            name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
            avatarUrl: profile.avatar_url || '',
            isInstructor: isInstructor
        },
        content: replyContent,
        created_at: new Date().toISOString(),
        votes: 0,
    };

    setQuestions(prev => prev.map(q => q.id === questionId ? { ...q, answers: [...(q.answers || []), newAnswer] } : q));
    setReplyContent('');
    setActiveReplyId(null);

    const result = await postAnswer({
      question_id: questionId,
      user_id: user.id,
      content: replyContent,
    });

    setIsPostingAnswer(null);
    if (result.success) {
        if (result.data) {
            const returnedAnswer = result.data as Answer;
            setQuestions(prev => prev.map(q => q.id === questionId ? { ...q, answers: q.answers.map(a => a.id === tempId ? returnedAnswer : a) } : q));
        }
    } else {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
        setQuestions(prev => prev.map(q => q.id === questionId ? { ...q, answers: q.answers.filter(a => a.id !== tempId) } : q));
    }
  };

  const confirmDelete = async () => {
    if (!deleteAlert.id || !user) return;
    setIsDeleting(deleteAlert.id);
    setDeleteAlert({ isOpen: false, type: 'answer', id: null });

    let originalQuestions = questions;

    setQuestions(prev => prev.map(q => ({ ...q, answers: q.answers.filter(a => a.id !== deleteAlert.id) })));
    const result = await deleteAnswer({ answerId: deleteAlert.id, userId: user.id });

    setIsDeleting(null);
    if (!result.success) {
      toast({ title: "Error", description: result.error, variant: "destructive" });
      setQuestions(originalQuestions); // Revert on failure
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Preguntas y Respuestas</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-16">
          <Loader2 className="w-8 h-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
    <AlertModal
        isOpen={deleteAlert.isOpen}
        onClose={() => setDeleteAlert({ isOpen: false, type: 'answer', id: null })}
        onConfirm={confirmDelete}
        loading={!!isDeleting}
      />
    <Card>
      <CardHeader>
        <CardTitle>Preguntas y Respuestas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Formulario de pregunta: todos los usuarios autenticados pueden abrir hilos */}
        {lessonId && (
            <div className="flex gap-4">
            <Avatar>
                <AvatarImage src={profile?.avatar_url || ''} alt={profile?.first_name || ''} />
                <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <form onSubmit={handlePostQuestion} className="flex-1 space-y-2">
                <div className="relative">
                <Textarea
                    placeholder="Escribe tu pregunta o comentario..."
                    value={newQuestionContent}
                        onChange={(e) => setNewQuestionContent(e.target.value)}
                        disabled={isPostingQuestion}
                        required
                        rows={2}
                        className="pr-12"
                    />
                    <Button type="submit" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8" disabled={isPostingQuestion || !newQuestionContent.trim()}>
                        {isPostingQuestion ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                </div>
            </form>
            </div>
        )}

        {/* Questions List */}
        <div className="space-y-6">
          {questions.length > 0 ? (
            questions.map((question) => (
              <div key={question.id} className="flex gap-4">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={question.author?.avatarUrl || ''} alt={question.author?.name} />
                    <AvatarFallback>{question.author?.name?.substring(0, 2) || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <div className="bg-muted/50 p-4 rounded-lg">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-sm">{question.author?.name || 'Anónimo'}</span>
                                <span className="text-xs text-muted-foreground">&bull; {formatDistanceToNow(new Date(question.created_at), { addSuffix: true, locale: es })}</span>
                                {!lessonId && question.lesson && (
                                     <Link href={`/learn/${question.lesson.id}`} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
                                        <MessageSquare className="w-3 h-3" />
                                        <span>en: {question.lesson.title}</span>
                                    </Link>
                                )}
                            </div>
                        </div>
                        <p className="mt-3 text-sm">{question.content}</p>
                    </div>

                    <div className="flex items-center gap-4 mt-2 pl-2 text-sm">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                             <MessageSquare className="h-4 w-4" />
                             <span>{question.votes || 0} respuestas</span>
                        </span>
                        <Button variant="ghost" size="sm" onClick={() => setActiveReplyId(activeReplyId === question.id ? null : question.id)}>
                            Responder
                        </Button>
                    </div>

                    {/* Replies/Answers */}
                    <div className="mt-4 space-y-4 pl-8 border-l-2 border-border/50">
                        {question.answers?.map((answer) => (
                             <div key={answer.id} className="flex gap-3">
                                 <Avatar className="h-8 w-8">
                                    <AvatarImage src={answer.author?.avatarUrl || ''} alt={answer.author?.name} />
                                    <AvatarFallback>{answer.author?.name?.substring(0, 2) || 'A'}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="bg-muted/30 p-3 rounded-lg">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-sm">{answer.author?.name || 'Anónimo'}</span>
                                                {answer.author?.isInstructor && (
                                                    <span className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">
                                                        <Medal className="w-3 h-3" />
                                                        Docente
                                                    </span>
                                                )}
                                                <span className="text-xs text-muted-foreground">&bull; {formatDistanceToNow(new Date(answer.created_at), { addSuffix: true, locale: es })}</span>
                                            </div>
                                            {user?.id === answer.user_id && (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6"><MoreVertical className="h-4 w-4" /></Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent>
                                                        <DropdownMenuItem onClick={() => setDeleteAlert({ isOpen: true, type: 'answer', id: answer.id })} className="text-destructive">
                                                            <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                        </div>
                                          <p className="mt-2 text-sm">{answer.content}</p>
                                     </div>
                                 </div>
                             </div>
                         ))}

                         {/* Reply Form */}
                        {activeReplyId === question.id && (
                           <div className="flex gap-4 pt-2">
                                <Avatar className="w-8 h-8">
                                <AvatarImage src={profile?.avatar_url || ''} alt={profile?.first_name || ''} />
                                <AvatarFallback>{initials}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-2">
                                <Textarea
                                    placeholder="Escribe tu respuesta..."
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    disabled={!!isPostingAnswer}
                                    rows={2}
                                />
                                <div className="flex justify-end gap-2">
                                     <Button variant="ghost" size="sm" onClick={() => setActiveReplyId(null)}>Cancelar</Button>
                                    <Button size="sm" onClick={() => handlePostAnswer(question.id)} disabled={!!isPostingAnswer || !replyContent.trim()}>
                                        {isPostingAnswer === question.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                                        Responder
                                    </Button>
                                </div>
                                </div>
                           </div>
                        )}
                    </div>

                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Aún no hay preguntas.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
    </>
  );
}
