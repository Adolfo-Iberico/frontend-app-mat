// Teacher assignment board for filtering submitted work and grading student tasks in bulk or individually.
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { FaClipboardCheck, FaCheck, FaUndo, FaFilter, FaStar } from 'react-icons/fa';
import { formatDate } from '../../utils/helpers';
import Loading from '../Common/Loading';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { logger } from '../../utils/logger';

const TeacherWorkBoard = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [works, setWorks] = useState([]);
  const [filters, setFilters] = useState({ student: '', course: '', status: '', work_type: '' });
  const [gradingWork, setGradingWork] = useState(null);
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');
  const [selectedWorks, setSelectedWorks] = useState([]);

  const debounceRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchWorks();
    }, 350);

    return () => {
      clearTimeout(debounceRef.current);
      abortRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchWorks = async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    try {
      const params = {};
      if (filters.student) params.student = filters.student;
      if (filters.course) params.course = filters.course;
      if (filters.status) params.status = filters.status;
      if (filters.work_type) params.work_type = filters.work_type;
      const res = await api.get('/submitted-works', { params, signal: controller.signal });
      setWorks(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err) {
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
      logger.error('[TeacherWorkBoard] error al listar trabajos', err);
      setWorks([]);
    }
    setLoading(false);
  };

  const handleGrade = async (work) => {
    if (!score && score !== '0') {
      toast.error('Ingrese una calificación');
      return;
    }
    const numScore = parseFloat(score);
    if (isNaN(numScore) || numScore < 0 || numScore > 20) {
      toast.error('La calificación debe ser entre 0 y 20');
      return;
    }
    try {
      await api.post(`/submitted-works/${work.id}/grade`, { score: numScore, feedback });
      toast.success(t('teacherWorkBoard.graded'));
      setGradingWork(null);
      setScore('');
      setFeedback('');
      fetchWorks();
    } catch {
      toast.error(t('common.error'));
    }
  };

  const handleReturn = async (work) => {
    try {
      await api.post(`/submitted-works/${work.id}/return`, { feedback });
      toast.success(t('teacherWorkBoard.returned'));
      setGradingWork(null);
      setScore('');
      setFeedback('');
      fetchWorks();
    } catch {
      toast.error(t('common.error'));
    }
  };

  const handleBatchGrade = async () => {
    if (selectedWorks.length === 0) {
      toast.error('Seleccione trabajos para calificar');
      return;
    }
    if (!score && score !== '0') {
      toast.error('Ingrese una calificación');
      return;
    }
    const numScore = parseFloat(score);
    if (isNaN(numScore) || numScore < 0 || numScore > 20) {
      toast.error('La calificación debe ser entre 0 y 20');
      return;
    }
    try {
      await api.post('/submitted-works/batch-grade', {
        work_ids: selectedWorks,
        score: numScore,
        feedback,
      });
      toast.success(`${selectedWorks.length} trabajos calificados`);
      setSelectedWorks([]);
      setGradingWork(null);
      setScore('');
      setFeedback('');
      fetchWorks();
    } catch {
      toast.error(t('common.error'));
    }
  };

  const toggleSelectWork = (workId) => {
    setSelectedWorks(prev =>
      prev.includes(workId) ? prev.filter(id => id !== workId) : [...prev, workId]
    );
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: { label: t('workBoard.pendingStatus'), classes: 'bg-yellow-100 text-yellow-700' },
      submitted: { label: t('workBoard.submittedStatus'), classes: 'bg-blue-100 text-blue-700' },
      graded: { label: t('workBoard.gradedStatus'), classes: 'bg-green-100 text-green-700' },
      returned: { label: t('workBoard.returnedStatus'), classes: 'bg-purple-100 text-purple-700' },
    };
    return map[status] || { label: status, classes: 'bg-gray-100 text-gray-700' };
  };

  const getWorkTypeLabel = (type) => {
    const map = { lesson: t('workBoard.lesson'), evaluation: t('workBoard.evaluation'), exam: t('workBoard.exam') };
    return map[type] || type;
  };

  const getScoreColor = (score) => {
    if (score >= 16) return 'bg-green-100 text-green-700';
    if (score >= 11) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-[var(--primary)] p-8 md:p-10">
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 flex items-center gap-3">
            <FaClipboardCheck className="w-7 h-7" />
            {t('teacherWorkBoard.title')}
          </h1>
          <p className="text-blue-100">{t('teacherWorkBoard.subtitle')}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <FaFilter className="w-4 h-4 text-[var(--on-surface-variant)] mt-2" />
        <select
          value={filters.course}
          onChange={(e) => setFilters({ ...filters, course: e.target.value })}
          className="px-3 py-2 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] text-[var(--on-surface)] text-sm"
        >
          <option value="">{t('ranking.allCourses')}</option>
          <option value="algebra">Álgebra</option>
          <option value="geometry">Geometría</option>
          <option value="trigonometry">Trigonometría</option>
        </select>
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="px-3 py-2 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] text-[var(--on-surface)] text-sm"
        >
          <option value="">{t('workBoard.filterByStatus')}</option>
          <option value="pending">{t('workBoard.pendingStatus')}</option>
          <option value="submitted">{t('workBoard.submittedStatus')}</option>
          <option value="graded">{t('workBoard.gradedStatus')}</option>
          <option value="returned">{t('workBoard.returnedStatus')}</option>
        </select>
        <select
          value={filters.work_type}
          onChange={(e) => setFilters({ ...filters, work_type: e.target.value })}
          className="px-3 py-2 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] text-[var(--on-surface)] text-sm"
        >
          <option value="">{t('workBoard.filterByType')}</option>
          <option value="lesson">{t('workBoard.lesson')}</option>
          <option value="evaluation">{t('workBoard.evaluation')}</option>
          <option value="exam">{t('workBoard.exam')}</option>
        </select>
        <input
          type="text"
          placeholder={t('common.search') + '...'}
          value={filters.student}
          onChange={(e) => setFilters({ ...filters, student: e.target.value })}
          className="px-3 py-2 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] text-[var(--on-surface)] text-sm"
        />
      </div>

      {selectedWorks.length > 0 && !gradingWork && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center gap-3">
          <span className="text-sm font-bold text-blue-700">{selectedWorks.length} seleccionados</span>
          <input
            type="number"
            min="0"
            max="20"
            step="1"
            placeholder={t('teacherWorkBoard.scorePlaceholder')}
            value={score}
            onChange={(e) => setScore(e.target.value)}
            className="px-3 py-2 rounded-lg border border-blue-300 text-sm w-32"
          />
          <input
            type="text"
            placeholder={t('teacherWorkBoard.feedbackPlaceholder')}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="px-3 py-2 rounded-lg border border-blue-300 text-sm flex-1"
          />
          <button onClick={handleBatchGrade} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-all">
            Calificar lote
          </button>
        </div>
      )}

      <div className="bg-[var(--surface)] rounded-2xl shadow-sm border border-[var(--surface-container)] overflow-hidden">
        {works.length === 0 ? (
          <div className="p-12 text-center">
            <FaClipboardCheck className="w-12 h-12 mx-auto text-[var(--on-surface-variant)] opacity-30 mb-4" />
            <p className="text-[var(--on-surface-variant)]">{t('teacherWorkBoard.noSubmissions')}</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--surface-container)]">
            {works.map((work) => {
              const badge = getStatusBadge(work.status);
              const isGrading = gradingWork?.id === work.id;
              return (
                <div key={work.id} className={`p-4 md:p-5 transition-colors ${isGrading ? 'bg-[var(--surface-container-low)]' : 'hover:bg-[var(--surface-container-low)]'}`}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1">
                      {work.status === 'submitted' && (
                        <input
                          type="checkbox"
                          checked={selectedWorks.includes(work.id)}
                          onChange={() => toggleSelectWork(work.id)}
                          className="w-4 h-4 rounded border-gray-300"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-[var(--on-surface)]">{work.title}</h3>
                          <span className="text-xs text-[var(--on-surface-variant)] bg-[var(--surface-container)] px-2 py-0.5 rounded-full">
                            {getWorkTypeLabel(work.work_type)}
                          </span>
                        </div>
                        <p className="text-sm text-[var(--on-surface-variant)]">
                          {work.student_name && <span className="font-medium">{work.student_name}</span>}
                          {work.area && ` · ${work.area}`}
                          {work.submitted_at && ` · ${t('workBoard.submittedAt')} ${formatDate(work.submitted_at)}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {work.score != null && (
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getScoreColor(work.score)}`}>
                          {work.score}/20
                        </span>
                      )}
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${badge.classes}`}>
                        {badge.label}
                      </span>
                      {(work.status === 'submitted' || work.status === 'returned') && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => { setGradingWork(work); setScore(work.score || ''); setFeedback(''); }}
                            className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-all"
                            title={t('teacherWorkBoard.gradeWork')}
                          >
                            <FaCheck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => { setGradingWork(work); setScore(''); setFeedback(''); }}
                            className="p-2 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition-all"
                            title={t('teacherWorkBoard.returnWork')}
                          >
                            <FaUndo className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {isGrading && (
                    <div className="mt-4 p-4 bg-[var(--surface-container-low)] rounded-xl border border-[var(--outline-variant)]">
                      <p className="text-sm font-bold text-[var(--on-surface)] mb-3">
                        {t('teacherWorkBoard.gradeWork')}: {work.title}
                      </p>
                      <div className="flex flex-col gap-3">
                        <input
                          type="number"
                          min="0"
                          max="20"
                          step="1"
                          placeholder={t('teacherWorkBoard.scorePlaceholder')}
                          value={score}
                          onChange={(e) => setScore(e.target.value)}
                          className="px-4 py-2 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] text-[var(--on-surface)] text-sm"
                        />
                        <textarea
                          placeholder={t('teacherWorkBoard.feedbackPlaceholder')}
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          rows={3}
                          className="px-4 py-2 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] text-[var(--on-surface)] text-sm resize-none"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleGrade(work)}
                            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 transition-all"
                          >
                            <FaStar className="w-3 h-3" />
                            {t('teacherWorkBoard.gradeWork')}
                          </button>
                          <button
                            onClick={() => handleReturn(work)}
                            className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-orange-600 transition-all"
                          >
                            <FaUndo className="w-3 h-3" />
                            {t('teacherWorkBoard.returnWork')}
                          </button>
                          <button
                            onClick={() => { setGradingWork(null); setScore(''); setFeedback(''); }}
                            className="px-4 py-2 rounded-lg text-sm font-bold text-[var(--on-surface-variant)] hover:bg-[var(--surface-container)] transition-all"
                          >
                            {t('common.cancel')}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherWorkBoard;
