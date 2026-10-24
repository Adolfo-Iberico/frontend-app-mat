// Tests that students can answer and submit an evaluation from its take route.
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import EvaluationPlayer from './EvaluationPlayer';

const { evaluationsApi, toast } = vi.hoisted(() => ({
  evaluationsApi: {
    getEvaluation: vi.fn(),
    getQuestions: vi.fn(),
    startEvaluation: vi.fn(),
    submitEvaluation: vi.fn(),
  },
  toast: { error: vi.fn(), success: vi.fn() },
}));

vi.mock('../../api/evaluations', () => ({ evaluationsApi }));
vi.mock('../../contexts/LanguageContext', () => ({
  useLanguage: () => ({ t: (key) => key }),
}));
vi.mock('../Common/Loading', () => ({ default: () => <p>Loading</p> }));
vi.mock('react-hot-toast', () => ({ default: toast }));

const renderPlayer = () => render(
  <MemoryRouter initialEntries={['/evaluations/42/take']}>
    <Routes>
      <Route path="/evaluations/:id/take" element={<EvaluationPlayer />} />
      <Route path="/evaluations/:id/result" element={<p>result-page</p>} />
      <Route path="/evaluations" element={<p>evaluation-list</p>} />
    </Routes>
  </MemoryRouter>
);

describe('EvaluationPlayer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    evaluationsApi.getEvaluation.mockResolvedValue({
      data: {
        data: {
          id: 42,
          title: 'Quiz de prueba',
          questions: [
            {
              id: 1,
              question_text: 'Elige la respuesta correcta',
              options: [{ label: 'A', value: '4' }, { label: 'B', value: '5' }],
            },
            { id: 2, question_text: '¿Cuánto es 3 + 3?', type: 'fill_blank' },
          ],
        },
      },
    });
    evaluationsApi.startEvaluation.mockResolvedValue({
      data: { data: { id: 'attempt-1', started_at: new Date().toISOString(), allow_tab_switches: true } },
    });
    evaluationsApi.submitEvaluation.mockResolvedValue({ data: { data: { status: 'completed' } } });
  });

  it('carga preguntas, recoge respuestas y navega a resultados tras enviar', async () => {
    renderPlayer();

    expect(await screen.findByText('Quiz de prueba')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('radio', { name: 'A. 4' }));
    fireEvent.click(screen.getByRole('button', { name: 'evaluations.player.next' }));
    fireEvent.change(screen.getByLabelText('evaluations.player.answer'), { target: { value: '6' } });
    fireEvent.click(screen.getByRole('button', { name: /evaluations.player.submit$/ }));

    await waitFor(() => expect(evaluationsApi.submitEvaluation).toHaveBeenCalledWith('42', {
      attempt_id: 'attempt-1',
      answers: [
        { question_id: '1', answer: '4' },
        { question_id: '2', answer: '6' },
      ],
    }));
    expect(await screen.findByText('result-page')).toBeInTheDocument();
  });

  it('impide enviar si hay preguntas sin responder', async () => {
    renderPlayer();

    expect(await screen.findByText('Quiz de prueba')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'evaluations.player.next' }));
    fireEvent.click(screen.getByRole('button', { name: /evaluations.player.submit$/ }));

    expect(toast.error).toHaveBeenCalledWith('evaluations.player.answerAll');
    expect(evaluationsApi.submitEvaluation).not.toHaveBeenCalled();
  });

  it('muestra alternativas guardadas como JSON anidado', async () => {
    evaluationsApi.getEvaluation.mockResolvedValue({
      data: {
        data: {
          id: 42,
          title: 'Quiz con opciones heredadas',
          questions: [{
            id: 3,
            question_text: 'Elige una alternativa',
            options: JSON.stringify(JSON.stringify(['Primera alternativa', 'Segunda alternativa'])),
          }],
        },
      },
    });

    renderPlayer();

    expect(await screen.findByRole('radio', { name: 'Primera alternativa' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Segunda alternativa' })).toBeInTheDocument();
  });
});
