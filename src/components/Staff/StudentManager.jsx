// Gestor de alumnos: vista institucional organizada por grado y sección
// con carga masiva (CSV/Excel) para docentes, coordinadores y directores.
import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  FaUserGraduate, FaUpload, FaDownload, FaFileCsv, FaSearch, FaExchangeAlt,
  FaPowerOff, FaCheckCircle, FaTimesCircle, FaTimes, FaCopy,
} from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';
import { studentsManagerApi, downloadBlob } from '../../api/studentsManager';
import Loading from '../Common/Loading';

const GRADES = ['4to', '5to'];
const SECTIONS = ['A', 'B', 'C', 'D'];

const StudentManager = () => {
  const { t } = useLanguage();
  const sm = (key) => t(`studentManager.${key}`);

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [students, setStudents] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [filters, setFilters] = useState({ grade: '', section: '', state: 'active', search: '' });

  const [showImport, setShowImport] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState(null);

  const [moving, setMoving] = useState(null); // alumno en edición de salón
  const [moveGrade, setMoveGrade] = useState('4to');
  const [moveSection, setMoveSection] = useState('A');

  const cargarResumen = useCallback(async () => {
    try {
      const res = await studentsManagerApi.getSummary();
      setSummary(res.data);
    } catch {
      toast.error(sm('loadError'));
    }
  }, []);

  const cargarAlumnos = useCallback(async () => {
    try {
      const res = await studentsManagerApi.getStudents({ ...filters, page, per_page: 25 });
      setStudents(res.data?.data?.data ?? []);
      setTotal(res.data?.data?.total ?? 0);
    } catch {
      toast.error(sm('loadError'));
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => { cargarResumen(); }, [cargarResumen]);
  useEffect(() => { cargarAlumnos(); }, [cargarAlumnos]);

  const cambiarFiltro = (campo, valor) => {
    setFilters((f) => ({ ...f, [campo]: valor }));
    setPage(1);
  };

  const descargarPlantilla = async () => {
    try {
      const res = await studentsManagerApi.getTemplate();
      downloadBlob(res.data, 'plantilla_alumnos.csv');
    } catch { toast.error(sm('loadError')); }
  };

  const exportarCsv = async () => {
    try {
      const res = await studentsManagerApi.exportCsv(filters);
      downloadBlob(res.data, `alumnos_${new Date().toISOString().slice(0, 10)}.csv`);
    } catch { toast.error(sm('loadError')); }
  };

  const subirArchivo = async () => {
    if (!file) return;
    setUploading(true);
    setResults(null);
    try {
      const res = await studentsManagerApi.importStudents(file);
      setResults(res.data);
      toast.success(res.data?.message || 'OK');
      await Promise.all([cargarResumen(), cargarAlumnos()]);
    } catch (e) {
      const msg = e.response?.data?.message || sm('loadError');
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const moverAlumno = async () => {
    if (!moving) return;
    try {
      await studentsManagerApi.updateStudent(moving.id, { grade: moveGrade, section: moveSection });
      toast.success(sm('moved'));
      setMoving(null);
      await Promise.all([cargarResumen(), cargarAlumnos()]);
    } catch {
      toast.error(sm('loadError'));
    }
  };

  const alternarActivo = async (student) => {
    try {
      await studentsManagerApi.updateStudent(student.id, { is_active: !student.is_active });
      await cargarAlumnos();
      await cargarResumen();
    } catch {
      toast.error(sm('loadError'));
    }
  };

  const copiar = (texto) => {
    navigator.clipboard?.writeText(texto);
    toast.success('Copiado');
  };

  if (loading) return <Loading />;

  const ultimaPagina = Math.max(1, Math.ceil(total / 25));

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--on-surface)] flex items-center gap-2">
            <FaUserGraduate className="text-[var(--primary)]" /> {sm('title')}
          </h1>
          <p className="text-sm text-[var(--on-surface-variant)]">{sm('subtitle')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={descargarPlantilla} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm bg-[var(--surface-container-low)] hover:bg-[var(--surface-container-high)] border border-[var(--outline-variant)]/30">
            <FaFileCsv /> {sm('template')}
          </button>
          <button onClick={exportarCsv} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm bg-[var(--surface-container-low)] hover:bg-[var(--surface-container-high)] border border-[var(--outline-variant)]/30">
            <FaDownload /> {sm('export')}
          </button>
          <button onClick={() => { setShowImport(true); setResults(null); }} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm bg-[var(--primary)] text-white font-semibold hover:opacity-90">
            <FaUpload /> {sm('import')}
          </button>
        </div>
      </div>

      {/* Resumen por salón */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="rounded-2xl p-4 bg-[var(--surface)] border border-[var(--surface-container)]">
          <p className="text-xs uppercase tracking-wider text-[var(--on-surface-variant)]">{sm('totalActive')}</p>
          <p className="text-2xl font-bold text-[var(--primary)]">{summary?.total_activos ?? '—'}</p>
        </div>
        {(summary?.salones ?? []).map((s) => (
          <button
            key={s.id}
            onClick={() => cambiarFiltro('grade', s.grade === filters.grade ? '' : s.grade)}
            className={`rounded-2xl p-4 border transition-all text-left ${
              filters.grade === s.grade
                ? 'bg-[var(--primary)] text-white border-transparent'
                : 'bg-[var(--surface)] border-[var(--surface-container)] hover:border-[var(--primary)]/50'
            }`}
          >
            <p className="text-xs uppercase tracking-wider opacity-70">{s.grade} «{s.section}»</p>
            <p className="text-2xl font-bold">{s.alumnos}</p>
          </button>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-2 md:items-center">
        <div className="relative flex-1">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--on-surface-variant)]" />
          <input
            value={filters.search}
            onChange={(e) => cambiarFiltro('search', e.target.value)}
            placeholder={sm('searchPlaceholder')}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface)]"
          />
        </div>
        <select value={filters.grade} onChange={(e) => cambiarFiltro('grade', e.target.value)} className="px-4 py-2.5 rounded-xl border-2 border-[var(--surface-container-high)] bg-[var(--surface)]">
          <option value="">{sm('allGrades')}</option>
          {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
        <select value={filters.section} onChange={(e) => cambiarFiltro('section', e.target.value)} className="px-4 py-2.5 rounded-xl border-2 border-[var(--surface-container-high)] bg-[var(--surface)]">
          <option value="">{sm('allSections')}</option>
          {SECTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filters.state} onChange={(e) => cambiarFiltro('state', e.target.value)} className="px-4 py-2.5 rounded-xl border-2 border-[var(--surface-container-high)] bg-[var(--surface)]">
          <option value="active">{sm('active')}</option>
          <option value="inactive">{sm('inactive')}</option>
          <option value="all">{sm('allStates')}</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-2xl border border-[var(--surface-container)] bg-[var(--surface)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-[var(--on-surface-variant)] border-b border-[var(--surface-container)]">
              <th className="px-4 py-3">{sm('colName')}</th>
              <th className="px-4 py-3">{sm('colEmail')}</th>
              <th className="px-4 py-3">DNI</th>
              <th className="px-4 py-3">{sm('colGrade')}</th>
              <th className="px-4 py-3">{sm('colSection')}</th>
              <th className="px-4 py-3">{sm('colStatus')}</th>
              <th className="px-4 py-3 text-right">{sm('colActions')}</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="border-b border-[var(--surface-container)]/50 hover:bg-[var(--surface-container-low)]">
                <td className="px-4 py-3 font-medium">{s.full_name}</td>
                <td className="px-4 py-3 text-[var(--on-surface-variant)]">{s.email}</td>
                <td className="px-4 py-3 text-[var(--on-surface-variant)]">{s.dni || '—'}</td>
                <td className="px-4 py-3">{s.salon_grade || '—'}</td>
                <td className="px-4 py-3">{s.salon_section || '—'}</td>
                <td className="px-4 py-3">
                  {s.is_active
                    ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600"><FaCheckCircle /> {sm('active')}</span>
                    : <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-500"><FaTimesCircle /> {sm('inactive')}</span>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      title={sm('move')}
                      onClick={() => { setMoving(s); setMoveGrade(s.salon_grade || '4to'); setMoveSection(s.salon_section || 'A'); }}
                      className="p-2 rounded-lg bg-[var(--surface-container-low)] hover:bg-[var(--surface-container-high)]"
                    >
                      <FaExchangeAlt className="text-[var(--primary)]" />
                    </button>
                    <button
                      title={s.is_active ? sm('deactivate') : sm('activate')}
                      onClick={() => alternarActivo(s)}
                      className="p-2 rounded-lg bg-[var(--surface-container-low)] hover:bg-[var(--surface-container-high)]"
                    >
                      <FaPowerOff className={s.is_active ? 'text-red-500' : 'text-emerald-600'} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr><td colSpan="7" className="px-4 py-10 text-center text-[var(--on-surface-variant)]">{sm('empty')}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {total > 25 && (
        <div className="flex items-center justify-center gap-3">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-4 py-2 rounded-xl bg-[var(--surface-container-low)] disabled:opacity-40">{sm('prev')}</button>
          <span className="text-sm text-[var(--on-surface-variant)]">{page} / {ultimaPagina}</span>
          <button disabled={page >= ultimaPagina} onClick={() => setPage((p) => p + 1)} className="px-4 py-2 rounded-xl bg-[var(--surface-container-low)] disabled:opacity-40">{sm('next')}</button>
        </div>
      )}

      {/* Modal de importación */}
      {showImport && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => !uploading && setShowImport(false)}>
          <div className="bg-[var(--surface)] rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[var(--on-surface)]">{sm('import')}</h2>
              <button onClick={() => setShowImport(false)} className="p-2 rounded-lg hover:bg-[var(--surface-container-high)]"><FaTimes /></button>
            </div>

            <p className="text-sm text-[var(--on-surface-variant)] mb-3">{sm('importHint')}</p>
            <div className="rounded-xl bg-[var(--surface-container-low)] p-3 text-xs font-mono mb-4 text-[var(--on-surface-variant)]">
              nombre · correo · dni · grado · seccion
            </div>

            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] bg-[var(--surface)] mb-4"
            />

            <div className="flex justify-end gap-2">
              <button onClick={() => setShowImport(false)} className="px-4 py-2 rounded-xl text-sm bg-[var(--surface-container-low)]">{sm('cancel')}</button>
              <button onClick={subirArchivo} disabled={!file || uploading} className="px-5 py-2 rounded-xl text-sm bg-[var(--primary)] text-white font-semibold disabled:opacity-50">
                {uploading ? '…' : sm('import')}
              </button>
            </div>

            {results && (
              <div className="mt-6 space-y-4">
                <p className="text-sm font-semibold">{results.message}</p>

                {results.credenciales?.length > 0 && (
                  <div>
                    <p className="text-xs text-[var(--on-surface-variant)] mb-2">{sm('credentialsHint')}</p>
                    <div className="overflow-x-auto rounded-xl border border-[var(--surface-container)]">
                      <table className="w-full text-xs">
                        <thead><tr className="text-left border-b border-[var(--surface-container)] text-[var(--on-surface-variant)]">
                          <th className="px-3 py-2">{sm('colName')}</th><th className="px-3 py-2">{sm('colEmail')}</th>
                          <th className="px-3 py-2">{sm('password')}</th><th />
                        </tr></thead>
                        <tbody>
                          {results.credenciales.map((c) => (
                            <tr key={c.correo} className="border-b border-[var(--surface-container)]/50">
                              <td className="px-3 py-2">{c.nombre}</td>
                              <td className="px-3 py-2">{c.correo}</td>
                              <td className="px-3 py-2 font-mono">{c.password}</td>
                              <td className="px-3 py-2"><button onClick={() => copiar(`${c.correo} / ${c.password}`)} className="p-1 rounded hover:bg-[var(--surface-container-high)]"><FaCopy /></button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {results.errores?.length > 0 && (
                  <div className="rounded-xl bg-red-50 border border-red-200 p-3">
                    <p className="text-xs font-semibold text-red-700 mb-1">{results.errores.length} {sm('rowErrors')}</p>
                    <ul className="text-xs text-red-600 list-disc list-inside max-h-32 overflow-y-auto">
                      {results.errores.map((e, i) => <li key={i}>{e}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de mover */}
      {moving && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setMoving(null)}>
          <div className="bg-[var(--surface)] rounded-2xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-[var(--on-surface)] mb-1">{sm('move')}</h2>
            <p className="text-sm text-[var(--on-surface-variant)] mb-4">{moving.full_name}</p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <select value={moveGrade} onChange={(e) => setMoveGrade(e.target.value)} className="px-4 py-2.5 rounded-xl border-2 border-[var(--surface-container-high)] bg-[var(--surface)]">
                {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
              <select value={moveSection} onChange={(e) => setMoveSection(e.target.value)} className="px-4 py-2.5 rounded-xl border-2 border-[var(--surface-container-high)] bg-[var(--surface)]">
                {SECTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setMoving(null)} className="px-4 py-2 rounded-xl text-sm bg-[var(--surface-container-low)]">{sm('cancel')}</button>
              <button onClick={moverAlumno} className="px-5 py-2 rounded-xl text-sm bg-[var(--primary)] text-white font-semibold">{sm('save')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManager;
