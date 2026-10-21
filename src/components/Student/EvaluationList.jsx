// Student evaluation list with filters and status badges for upcoming and completed assignments.
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { evaluationsApi } from '../../api/evaluations';
import { FaClock, FaCheckCircle, FaHourglassHalf, FaFilter, FaSearch } from 'react-icons/fa';
import { formatDate, toArray } from '../../utils/helpers';
import Loading from '../Common/Loading';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../hooks/useAuth';

const EvaluationList = () => {
  const { t } = useLanguage();
  const { isTeacher, isAdmin } = useAuth();
  const isStaff = isTeacher() || isAdmin();
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    difficulty: ''
  });

  useEffect(() => {
    fetchEvaluations();
  }, [filters]);

  const fetchEvaluations = async () => {
    try {
      setLoading(true);
      const response = await evaluationsApi.getEvaluations(filters);
      setEvaluations(toArray(response.data?.data));
    } catch {
      toast.error(t('evaluations.loadError'));
      setEvaluations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getStatusBadge = (evaluation) => {
    if (evaluation.user_result?.status === 'completed') {
      const score = Number(evaluation.user_result.score);
      const scoreLabel = Number.isFinite(score) ? score.toFixed(1) : '--';
      return {
        label: `${t('evaluations.list.completed')} (${scoreLabel}/20)`,
        className: 'bg-green-100 text-green-700'
      };
    }
    if (evaluation.due_date && new Date(evaluation.due_date) < new Date()) {
      return {
        label: t('evaluations.list.expired'),
        className: 'bg-red-100 text-red-700'
      };
    }
    return {
      label: t('evaluations.list.pending'),
      className: 'bg-yellow-100 text-yellow-700'
    };
  };

  const now = Date.now();
  const orderedEvaluations = isStaff
    ? evaluations
    : [...evaluations].sort((first, second) => {
        const priority = (evaluation) => {
          if (evaluation.user_result?.status === 'completed') return 1;
          if (evaluation.due_date && new Date(evaluation.due_date).getTime() < now) return 2;
          return 0;
        };
        return priority(first) - priority(second);
      });

  if (loading) return <Loading />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[var(--on-surface)]">{t('evaluations.list.title')}</h2>
          <p className="text-[var(--on-surface-variant)]">
            {t('evaluations.list.subtitle')}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[var(--surface)] p-6 rounded-2xl shadow-sm border border-[var(--surface-container)]">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--outline)]" />
            <input
              type="text"
              placeholder={t('evaluations.list.search')}
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)]"
            />
          </div>
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)] min-w-[150px]"
          >
            <option value="">{t('evaluations.list.allTypes')}</option>
            <option value="exam">{t('evaluations.list.exam')}</option>
            <option value="quiz">{t('evaluations.list.quiz')}</option>
            <option value="homework">{t('evaluations.list.homework')}</option>
            <option value="practice">{t('evaluations.list.practice')}</option>
          </select>
          <select
            value={filters.difficulty}
            onChange={(e) => handleFilterChange('difficulty', e.target.value)}
            className="px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)] min-w-[150px]"
          >
            <option value="">{t('evaluations.list.allDifficulties')}</option>
            <option value="basic">{t('lessons.basic')}</option>
            <option value="intermediate">{t('lessons.intermediate')}</option>
            <option value="advanced">{t('lessons.advanced')}</option>
          </select>
        </div>
      </div>

      {/* Evaluations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {orderedEvaluations.map((evaluation) => {
          const status = getStatusBadge(evaluation);
          return (
            <div
              key={evaluation.id}
              role="article"
              aria-label={evaluation.title}
              className="bg-[var(--surface)] rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all border border-[var(--surface-container)] hover:border-[var(--primary)]/20"
            >
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  evaluation.type === 'exam' ? 'bg-red-100 text-red-700' :
                  evaluation.type === 'quiz' ? 'bg-blue-100 text-blue-700' :
                  evaluation.type === 'homework' ? 'bg-purple-100 text-purple-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {t(`evaluations.list.${evaluation.type}`)}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${status.className}`}>
                  {status.label}
                </span>
              </div>

              <h3 className="text-lg font-bold text-[var(--on-surface)] mb-2">
                {evaluation.title}
              </h3>
              
              <p className="text-sm text-[var(--on-surface-variant)] mb-4 line-clamp-2">
                {evaluation.description || t('evaluations.list.noDescription')}
              </p>

              <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                {evaluation.difficulty && (
                  <div className="flex items-center gap-2 text-[var(--on-surface-variant)]">
                    <span>📊</span>
                    {t(`lessons.${evaluation.difficulty}`)}
                  </div>
                )}
                {evaluation.time_limit && (
                  <div className="flex items-center gap-2 text-[var(--on-surface-variant)]">
                    <FaClock className="w-4 h-4" />
                    {evaluation.time_limit} min
                  </div>
                )}
                {evaluation.total_questions && (
                  <div className="flex items-center gap-2 text-[var(--on-surface-variant)]">
                    <span>📝</span>
                    {evaluation.total_questions} {t('evaluations.list.questions')}
                  </div>
                )}
                {evaluation.due_date && (
                  <div className="flex items-center gap-2 text-[var(--on-surface-variant)]">
                    <span>📅</span>
                    {formatDate(evaluation.due_date)}
                  </div>
                )}
              </div>

              {isStaff ? (
                <div className="w-full py-3 rounded-xl font-bold text-center bg-[var(--surface-container)] text-[var(--on-surface-variant)]">
                  {t('evaluations.list.teacherPreview')}
                </div>
              ) : evaluation.user_result?.status !== 'completed' &&
                evaluation.due_date && new Date(evaluation.due_date) < new Date() ? (
                <div className="w-full py-3 rounded-xl font-bold text-center bg-red-100 text-red-700">
                  {t('evaluations.list.expired')}
                </div>
              ) : (
                <Link
                  to={evaluation.user_result?.status === 'completed'
                    ? `/evaluations/${evaluation.id}/result`
                    : `/evaluations/${evaluation.id}/take`}
                  aria-label={`${t(evaluation.user_result?.status === 'completed'
                    ? 'evaluations.list.viewResults'
                    : 'evaluations.list.startEvaluation')} - ${evaluation.title}`}
                  className={`w-full py-3 rounded-xl font-bold text-center transition-all block ${
                    evaluation.user_result?.status === 'completed'
                      ? 'bg-[var(--surface-container)] text-[var(--on-surface)] hover:bg-[var(--surface-container-high)]'
                      : 'bg-[var(--primary)] text-white hover:opacity-90'
                  }`}
                >
                  {evaluation.user_result?.status === 'completed'
                    ? t('evaluations.list.viewResults')
                    : t('evaluations.list.startEvaluation')}
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {evaluations.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-bold text-[var(--on-surface)]">{t('evaluations.list.noEvaluations')}</h3>
          <p className="text-[var(--on-surface-variant)]">
            {t('evaluations.list.comingSoon')}
          </p>
        </div>
      )}
    </div>
  );
};

export default EvaluationList;
