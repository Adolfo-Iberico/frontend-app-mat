import { requireRole } from '@/lib/session';
import { getQuestionsByCourseId } from '@/app/actions';
import { QuestionsClient } from './components/client';
import type { Question } from '@/lib/types';


export default async function QuestionsPage() {
  const session = await requireRole(['admin', 'docente']);

  // Todos los hilos del foro visibles para el usuario autenticado.
  const threads = (await getQuestionsByCourseId('')) as Question[];

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <QuestionsClient threads={threads} canClose={session.profile.role === 'docente'} />
      </div>
    </div>
  );
}
