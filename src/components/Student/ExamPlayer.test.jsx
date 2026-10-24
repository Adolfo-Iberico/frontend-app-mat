// Tests that exam alternatives render when stored as JSON or option objects.
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ExamPlayer from './ExamPlayer';

const { api, toast, translate } = vi.hoisted(() => ({
  api: { post: vi.fn() },
  toast: { error: vi.fn(), success: vi.fn() },
  translate: (key) => key,
}));

vi.mock('../../api/axios', () => ({ default: api }));
vi.mock('../../contexts/LanguageContext', () => ({
  useLanguage: () => ({ t: translate }),
}));
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'student-1' } }),
}));
vi.mock('../../hooks/useAntiCheat', () => ({
  default: () => ({ tabSwitchCount: 0 }),
}));
vi.mock('../Common/Loading', () => ({ default: () => <p>Loading</p> }));
vi.mock('react-hot-toast', () => ({ default: toast }));

const renderPlayer = () => render(
  <MemoryRouter initialEntries={['/exams/exam-1/take']}>
    <Routes>
      <Route path="/exams/:id/take" element={<ExamPlayer />} />
      <Route path="/exams" element={<p>exam-list</p>} />
    </Routes>
  </MemoryRouter>
);

describe('ExamPlayer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    api.post.mockResolvedValue({
      data: {
        data: {
          exam: { id: 'exam-1', title: 'Examen de prueba' },
          attempt: { id: 'attempt-1', started_at: new Date().toISOString() },
          questions: [{
            id: 'question-1',
            type: 'multiple_choice',
            question_text: 'Elige una alternativa',
            options: JSON.stringify(['Primera alternativa', 'Segunda alternativa']),
          }],
        },
      },
    });
  });

  it('muestra alternativas de opción múltiple guardadas como JSON', async () => {
    renderPlayer();

    expect(await screen.findByText('Primera alternativa')).toBeInTheDocument();
    expect(screen.getByText('Segunda alternativa')).toBeInTheDocument();
  });

  it('muestra el valor de alternativas guardadas como objetos', async () => {
    api.post.mockResolvedValue({
      data: {
        data: {
          exam: { id: 'exam-1', title: 'Examen de prueba' },
          attempt: { id: 'attempt-1', started_at: new Date().toISOString() },
          questions: [{
            id: 'question-1',
            type: 'multiple_choice',
            question_text: 'Elige una alternativa',
            options: [{ label: 'A', value: 'Primera alternativa' }],
          }],
        },
      },
    });

    renderPlayer();

    expect(await screen.findByText('A. Primera alternativa')).toBeInTheDocument();
  });
});
