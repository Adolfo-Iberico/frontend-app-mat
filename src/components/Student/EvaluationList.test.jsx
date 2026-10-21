import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import EvaluationList from './EvaluationList';

const { evaluationsApi, toast } = vi.hoisted(() => ({
  evaluationsApi: { getEvaluations: vi.fn() },
  toast: { error: vi.fn() },
}));

vi.mock('../../api/evaluations', () => ({ evaluationsApi }));
vi.mock('../../contexts/LanguageContext', () => ({
  useLanguage: () => ({ t: (key) => key }),
}));
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({ isTeacher: () => false, isAdmin: () => false }),
}));
vi.mock('../Common/Loading', () => ({ default: () => <p>Loading</p> }));
vi.mock('react-hot-toast', () => ({ default: toast }));

describe('EvaluationList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    evaluationsApi.getEvaluations.mockResolvedValue({
      data: {
        data: [
          { id: 'expired', title: 'Vencida sin resolver', type: 'quiz', due_date: '2020-01-01T00:00:00Z' },
          { id: 'completed', title: 'Ya resuelta', type: 'quiz', due_date: '2020-01-01T00:00:00Z', user_result: { status: 'completed', score: 18 } },
          { id: 'available', title: 'Disponible', type: 'quiz', due_date: '2099-01-01T00:00:00Z' },
        ],
      },
    });
  });

  it('shows resolvable evaluations first and unresolved expired ones last', async () => {
    render(
      <MemoryRouter>
        <EvaluationList />
      </MemoryRouter>
    );

    const cards = await screen.findAllByRole('article');
    expect(cards.map((card) => card.getAttribute('aria-label'))).toEqual([
      'Disponible',
      'Ya resuelta',
      'Vencida sin resolver',
    ]);
  });
});
