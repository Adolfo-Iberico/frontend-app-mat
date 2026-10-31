
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MessageSquare, Lock, Trash2, Loader2 } from 'lucide-react';
import type { Question } from '@/lib/types';
import { closeThread, deleteAnswer } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface QuestionsClientProps {
  threads: Question[];
  canClose: boolean;
}

export const QuestionsClient: React.FC<QuestionsClientProps> = ({ threads, canClose }) => {
  const { toast } = useToast();
  const [items, setItems] = useState<Question[]>(threads);
  const [selected, setSelected] = useState<Question | null>(null);
  const [pending, setPending] = useState(false);

  const handleCloseThread = async (thread: Question) => {
    setPending(true);
    const result = await closeThread(thread.id);
    setPending(false);
    if (result.success) {
      toast({ variant: 'success', title: 'Hilo cerrado.' });
      setItems(prev =>
        prev.map(item => (item.id === thread.id ? { ...item, status: 'closed' } : item))
      );
      setSelected(prev => (prev && prev.id === thread.id ? { ...prev, status: 'closed' } : prev));
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
  };

  const handleDeletePost = async (threadId: string, answerId: string) => {
    setPending(true);
    const result = await deleteAnswer({ answerId });
    setPending(false);
    if (result.success) {
      toast({ variant: 'success', title: 'Respuesta eliminada.' });
      const updateThread = (thread: Question): Question =>
        thread.id === threadId
          ? { ...thread, answers: thread.answers.filter(answer => answer.id !== answerId) }
          : thread;
      setItems(prev => prev.map(updateThread));
      setSelected(prev => (prev ? updateThread(prev) : prev));
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
  };

  return (
    <>
      <Heading
        title="Foro de discusión"
        description="Hilos de preguntas y respuestas sobre las lecciones. Puedes cerrar hilos y moderar respuestas."
      />
      <Separator className="my-6" />

      {items.length > 0 ? (
        <div className="space-y-4">
          {items.map(thread => (
            <Card key={thread.id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold truncate">{thread.title}</p>
                      {thread.status === 'closed' ? (
                        <Badge variant="secondary" className="gap-1">
                          <Lock className="w-3 h-3" /> Cerrado
                        </Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                          Abierto
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {thread.lesson ? `Lección: ${thread.lesson.title} · ` : ''}
                      Autor: {thread.author.name} ·{' '}
                      {formatDistanceToNow(new Date(thread.created_at), { addSuffix: true, locale: es })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MessageSquare className="w-4 h-4" />
                      {thread.answers.length}
                    </span>
                    <Button variant="outline" size="sm" onClick={() => setSelected(thread)}>
                      Ver respuestas
                    </Button>
                    {canClose && thread.status !== 'closed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={pending}
                        onClick={() => handleCloseThread(thread)}
                      >
                        <Lock className="mr-2 h-4 w-4" /> Cerrar
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border rounded-lg bg-card">
          <h3 className="text-xl font-semibold mb-2">No hay hilos de discusión</h3>
          <p className="text-muted-foreground">
            Crea un hilo desde el reproductor de una lección (pestaña Q&A) para abrir el debate.
          </p>
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selected?.title}</DialogTitle>
            <DialogDescription>
              {selected?.lesson ? `Lección: ${selected.lesson.title}` : 'Hilo general'} · Autor: {selected?.author.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm">{selected?.content}</p>
            </div>
            <h4 className="text-sm font-semibold pt-2">
              Respuestas ({selected?.answers.length ?? 0})
            </h4>
            {selected?.answers.map(answer => (
              <div key={answer.id} className="bg-muted/30 p-3 rounded-lg space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-semibold text-sm truncate">{answer.author.name}</span>
                    {answer.author.isInstructor && (
                      <Badge variant="outline" className="text-xs flex-shrink-0">Docente</Badge>
                    )}
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {formatDistanceToNow(new Date(answer.created_at), { addSuffix: true, locale: es })}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                    disabled={pending}
                    onClick={() => selected && handleDeletePost(selected.id, answer.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm">{answer.content}</p>
              </div>
            ))}
            {selected?.answers.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Este hilo todavía no tiene respuestas.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
