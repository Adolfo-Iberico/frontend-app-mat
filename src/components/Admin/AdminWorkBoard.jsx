// Lets administrators filter and export student work and submission records.
import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { FaClipboardList, FaFilter, FaFilePdf, FaFileExcel } from 'react-icons/fa';
import { formatDate } from '../../utils/helpers';
import Loading from '../Common/Loading';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { logger } from '../../utils/logger';

const AdminWorkBoard = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [works, setWorks] = useState([]);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({
    student: '', teacher: '', course: '', status: '', date_from: '', date_to: '',
  });

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
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
      const [worksRes, statsRes] = await Promise.allSettled([
        api.get('/submitted-works', { params, signal: controller.signal }),
        api.get('/submitted-works/stats', { signal: controller.signal }),
      ]);
      if (worksRes.status === 'fulfilled') {
        setWorks(Array.isArray(worksRes.value.data?.data) ? worksRes.value.data.data : []);
      }
      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value.data?.data || null);
      }
    } catch (err) {
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
      logger.error('[AdminWorkBoard] error al listar trabajos', err);
      setWorks([]);
    }
    setLoading(false);
  };

  const handleExport = async (format) => {
    try {
      const params = { format };
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
      const res = await api.get('/submitted-works/export', { params, responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `trabajos_${new Date().toISOString().slice(0, 10)}.${format === 'pdf' ? 'pdf' : 'xlsx'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(format === 'pdf' ? 'PDF descargado' : 'Excel descargado');
    } catch {
      toast.error('Error al exportar');
    }
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
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 flex items-center gap-3">
              <FaClipboardList className="w-7 h-7" />
              {t('workBoard.title')}
            </h1>
            <p className="text-blue-100">{t('teacherWorkBoard.subtitle')}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => handleExport('pdf')} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all">
              <FaFilePdf className="w-4 h-4" />
              PDF
            </button>
            <button onClick={() => handleExport('excel')} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all">
              <FaFileExcel className="w-4 h-4" />
              Excel
            </button>
          </div>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[var(--surface)] p-5 rounded-xl shadow-sm border border-[var(--surface-container)]">
            <p className="text-sm text-[var(--on-surface-variant)]">{t('workBoard.totalAssigned')}</p>
            <p className="text-2xl font-bold text-[var(--on-surface)]">{stats.total || 0}</p>
          </div>
          <div className="bg-[var(--surface)] p-5 rounded-xl shadow-sm border border-[var(--surface-container)]">
            <p className="text-sm text-[var(--on-surface-variant)]">{t('workBoard.submitted')}</p>
            <p className="text-2xl font-bold text-blue-600">{stats.submitted || 0}</p>
          </div>
          <div className="bg-[var(--surface)] p-5 rounded-xl shadow-sm border border-[var(--surface-container)]">
            <p className="text-sm text-[var(--on-surface-variant)]">{t('workBoard.graded')}</p>
            <p className="text-2xl font-bold text-green-600">{stats.graded || 0}</p>
          </div>
          <div className="bg-[var(--surface)] p-5 rounded-xl shadow-sm border border-[var(--surface-container)]">
            <p className="text-sm text-[var(--on-surface-variant)]">{t('workBoard.averageGrade')}</p>
            <p className="text-2xl font-bold text-[var(--on-surface)]">{stats.average_score?.toFixed(1) || '0.0'}</p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <FaFilter className="w-4 h-4 text-[var(--on-surface-variant)] mt-2" />
        <input
          type="text"
          placeholder={`${t('ranking.student')}...`}
          value={filters.student}
          onChange={(e) => setFilters({ ...filters, student: e.target.value })}
          className="px-3 py-2 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] text-[var(--on-surface)] text-sm"
        />
        <input
          type="text"
          placeholder="Docente..."
          value={filters.teacher}
          onChange={(e) => setFilters({ ...filters, teacher: e.target.value })}
          className="px-3 py-2 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] text-[var(--on-surface)] text-sm"
        />
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
        <input
          type="date"
          value={filters.date_from}
          onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
          className="px-3 py-2 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] text-[var(--on-surface)] text-sm"
        />
        <input
          type="date"
          value={filters.date_to}
          onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
          className="px-3 py-2 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] text-[var(--on-surface)] text-sm"
        />
      </div>

      <div className="bg-[var(--surface)] rounded-2xl shadow-sm border border-[var(--surface-container)] overflow-hidden">
        {works.length === 0 ? (
          <div className="p-12 text-center">
            <FaClipboardList className="w-12 h-12 mx-auto text-[var(--on-surface-variant)] opacity-30 mb-4" />
            <p className="text-[var(--on-surface-variant)]">{t('common.noData')}</p>
          </div>
        ) : (
          <>
            <div className="hidden lg:grid grid-cols-[1fr_1fr_100px_100px_100px_100px] gap-4 p-4 bg-[var(--surface-container-low)] text-xs font-bold text-[var(--on-surface-variant)] uppercase tracking-wider">
              <span>{t('ranking.student')}</span>
              <span>{t('ranking.student')} / Docente</span>
              <span className="text-center">{t('workBoard.workType')}</span>
              <span className="text-center">{t('workBoard.status')}</span>
              <span className="text-center">{t('workBoard.score')}</span>
              <span className="text-center">{t('workBoard.date')}</span>
            </div>
            <div className="divide-y divide-[var(--surface-container)]">
              {works.map((work) => {
                const badge = getStatusBadge(work.status);
                return (
                  <div key={work.id} className="p-4 md:p-5 hover:bg-[var(--surface-container-low)] transition-colors">
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_100px_100px_100px_100px] gap-3 items-center">
                      <div>
                        <p className="font-bold text-[var(--on-surface)]">{work.title}</p>
                        <p className="text-sm text-[var(--on-surface-variant)]">{work.student_name || '—'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-[var(--on-surface-variant)]">{work.teacher_name || '—'}</p>
                        <p className="text-xs text-[var(--on-surface-variant)]">{work.area || '—'}</p>
                      </div>
                      <span className="hidden lg:block text-center text-xs bg-[var(--surface-container)] px-2 py-1 rounded-full text-[var(--on-surface-variant)]">
                        {getWorkTypeLabel(work.work_type)}
                      </span>
                      <span className={`hidden lg:block text-center px-3 py-1 rounded-full text-xs font-bold ${badge.classes}`}>
                        {badge.label}
                      </span>
                      <span className="hidden lg:block text-center">
                        {work.score != null ? (
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${getScoreColor(work.score)}`}>
                            {work.score}/20
                          </span>
                        ) : (
                          <span className="text-xs text-[var(--on-surface-variant)]">—</span>
                        )}
                      </span>
                      <span className="hidden lg:block text-center text-xs text-[var(--on-surface-variant)]">
                        {formatDate(work.submitted_at)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminWorkBoard;
