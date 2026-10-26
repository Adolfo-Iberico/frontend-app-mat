// Student work dashboard summarizing assigned tasks, submission progress, and graded averages.
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../contexts/LanguageContext';
import { FaClipboardList, FaCheckCircle, FaHourglassHalf, FaStar, FaFilter } from 'react-icons/fa';
import { formatDate } from '../../utils/helpers';
import Loading from '../Common/Loading';
import api from '../../api/axios';

const StudentWorkBoard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [works, setWorks] = useState([]);
  const [filters, setFilters] = useState({ work_type: '', status: '', area: '' });

  useEffect(() => {
    fetchWorks();
  }, []);

  const fetchWorks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/submitted-works');
      setWorks(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch {
      setWorks([]);
    }
    setLoading(false);
  };

  const totalAssigned = works.length;
  const submitted = works.filter(w => w.status === 'submitted' || w.status === 'graded' || w.status === 'returned').length;
  const graded = works.filter(w => w.status === 'graded').length;
  const pending = totalAssigned - submitted;
  const gradedWorks = works.filter(w => w.status === 'graded' && w.score != null);
  const averageGrade = gradedWorks.length > 0 ? (gradedWorks.reduce((sum, w) => sum + w.score, 0) / gradedWorks.length).toFixed(1) : '0.0';

  const getAverageColor = (avg) => {
    const n = parseFloat(avg);
    if (n >= 16) return 'text-green-600';
    if (n >= 11) return 'text-yellow-600';
    return 'text-red-600';
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

  const filteredWorks = works.filter(w => {
    if (filters.work_type && w.work_type !== filters.work_type) return false;
    if (filters.status && w.status !== filters.status) return false;
    if (filters.area && w.area !== filters.area) return false;
    return true;
  });

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-[var(--primary)] p-8 md:p-10">
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">{t('workBoard.title')}</h1>
          <p className="text-blue-100">{t('workBoard.subtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[var(--surface)] p-5 rounded-xl shadow-sm border border-[var(--surface-container)]">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[var(--primary)]/10 rounded-lg text-[var(--primary)]">
              <FaClipboardList className="w-5 h-5" />
            </div>
          </div>
          <p className="text-sm text-[var(--on-surface-variant)]">{t('workBoard.totalAssigned')}</p>
          <p className="text-2xl font-bold text-[var(--on-surface)]">{totalAssigned}</p>
        </div>
        <div className="bg-[var(--surface)] p-5 rounded-xl shadow-sm border border-[var(--surface-container)]">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
              <FaCheckCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-sm text-[var(--on-surface-variant)]">{t('workBoard.submitted')}</p>
          <p className="text-2xl font-bold text-[var(--on-surface)]">{submitted}</p>
          {totalAssigned > 0 && (
            <span className="text-xs text-blue-600 font-bold">{((submitted / totalAssigned) * 100).toFixed(0)}%</span>
          )}
        </div>
        <div className="bg-[var(--surface)] p-5 rounded-xl shadow-sm border border-[var(--surface-container)]">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
              <FaStar className="w-5 h-5" />
            </div>
          </div>
          <p className="text-sm text-[var(--on-surface-variant)]">{t('workBoard.graded')}</p>
          <p className="text-2xl font-bold text-[var(--on-surface)]">{graded}</p>
          {totalAssigned > 0 && (
            <span className="text-xs text-green-600 font-bold">{((graded / totalAssigned) * 100).toFixed(0)}%</span>
          )}
        </div>
        <div className="bg-[var(--surface)] p-5 rounded-xl shadow-sm border border-[var(--surface-container)]">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
              <FaHourglassHalf className="w-5 h-5" />
            </div>
          </div>
          <p className="text-sm text-[var(--on-surface-variant)]">{t('workBoard.pending')}</p>
          <p className="text-2xl font-bold text-[var(--on-surface)]">{pending}</p>
        </div>
      </div>

      {gradedWorks.length > 0 && (
        <div className="bg-[var(--surface)] p-6 rounded-xl shadow-sm border border-[var(--surface-container)]">
          <p className="text-sm text-[var(--on-surface-variant)] mb-1">{t('workBoard.averageGrade')}</p>
          <p className={`text-4xl font-bold ${getAverageColor(averageGrade)}`}>
            {averageGrade} <span className="text-lg font-normal text-[var(--on-surface-variant)]">/ 20</span>
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <FaFilter className="w-4 h-4 text-[var(--on-surface-variant)]" />
        </div>
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
          value={filters.area}
          onChange={(e) => setFilters({ ...filters, area: e.target.value })}
          className="px-3 py-2 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] text-[var(--on-surface)] text-sm"
        >
          <option value="">{t('workBoard.filterByArea')}</option>
          <option value="algebra">Álgebra</option>
          <option value="geometry">Geometría</option>
          <option value="trigonometry">Trigonometría</option>
        </select>
      </div>

      <div className="bg-[var(--surface)] rounded-2xl shadow-sm border border-[var(--surface-container)] overflow-hidden">
        {filteredWorks.length === 0 ? (
          <div className="p-12 text-center">
            <FaClipboardList className="w-12 h-12 mx-auto text-[var(--on-surface-variant)] opacity-30 mb-4" />
            <p className="text-[var(--on-surface-variant)]">{t('workBoard.noWorks')}</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--surface-container)]">
            {filteredWorks.map((work) => {
              const badge = getStatusBadge(work.status);
              return (
                <div key={work.id} className="p-4 md:p-5 hover:bg-[var(--surface-container-low)] transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-[var(--on-surface)]">{work.title}</h3>
                        <span className="text-xs text-[var(--on-surface-variant)] bg-[var(--surface-container)] px-2 py-0.5 rounded-full">
                          {getWorkTypeLabel(work.work_type)}
                        </span>
                      </div>
                      <p className="text-sm text-[var(--on-surface-variant)]">
                        {work.area && `${work.area}`}
                        {work.submitted_at && ` · ${t('workBoard.submittedAt')} ${formatDate(work.submitted_at)}`}
                      </p>
                      {work.feedback && (
                        <p className="text-sm text-[var(--on-surface-variant)] mt-1 italic">
                          {t('workBoard.feedback')}: {work.feedback}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {work.score != null && (
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getScoreColor(work.score)}`}>
                          {work.score}/20
                        </span>
                      )}
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${badge.classes}`}>
                        {badge.label}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentWorkBoard;
