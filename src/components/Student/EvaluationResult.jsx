// Detailed evaluation result page showing scores, completion details, and PDF export.
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { evaluationsApi } from '../../api/evaluations';
import { FaCheckCircle, FaTimesCircle, FaClock, FaArrowLeft, FaDownload, FaFileExcel } from 'react-icons/fa';
import { formatDate, formatDateTime, toArray } from '../../utils/helpers';
import Loading from '../Common/Loading';
import toast from 'react-hot-toast';
import { useLanguage } from '../../contexts/LanguageContext';

const downloadExport = (blob, filename, expectedContentType) => {
  if (!(blob instanceof Blob) || !blob.type.includes(expectedContentType)) {
    throw new Error('El servidor no devolvió un archivo válido');
  }

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => window.URL.revokeObjectURL(url), 0);
};

const EvaluationResult = () => {
  const { t } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [institutionName, setInstitutionName] = useState('');
  const [loading, setLoading] = useState(true);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);

  useEffect(() => {
    fetchResults();
  }, [id]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const resultsRes = await evaluationsApi.getResults(id);
      const results = toArray(resultsRes.data?.data);

      const lastResult = results.find(r => r.status === 'completed');
      if (lastResult) {
        setResult(lastResult);
        const evalRes = await evaluationsApi.getEvaluation(id);
        setEvaluation(evalRes.data.data);
        const configRes = await evaluationsApi.getPublicConfig();
        setInstitutionName(configRes.data?.institution_name || '');
      } else {
        toast.error(t('evaluations.result.noResults'));
        navigate('/evaluations');
      }
    } catch (error) {
      toast.error(t('evaluations.result.loadError'));
      navigate('/evaluations');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setExportingPdf(true);
      const response = await evaluationsApi.exportResultPdf(id, result.id);
      downloadExport(response.data, `evaluacion-${id}.pdf`, 'application/pdf');
    } catch {
      toast.error(t('evaluations.result.exportError'));
    } finally {
      setExportingPdf(false);
    }
  };

  const handleDownloadExcel = async () => {
    try {
      setExportingExcel(true);
      const response = await evaluationsApi.exportResultExcel(id, result.id);
      downloadExport(
        response.data,
        `evaluacion-${id}.xlsx`,
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
    } catch {
      toast.error(t('evaluations.result.exportError'));
    } finally {
      setExportingExcel(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 16) return 'text-green-600';
    if (score >= 12) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreMessage = (score) => {
    if (score >= 18) return t('evaluations.result.excellentWork');
    if (score >= 15) return t('evaluations.result.goodWork');
    if (score >= 12) return t('evaluations.result.approved');
    return t('evaluations.result.needsReview');
  };

  if (loading) return <Loading />;
  if (!result || !evaluation) return null;

  const safeScore = Number.isFinite(Number(result.score)) ? Number(result.score) : 0;
  const scoreLabel = safeScore.toFixed(1);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back button */}
      <button
        onClick={() => navigate('/evaluations')}
        className="flex items-center gap-2 text-[var(--on-surface-variant)] hover:text-[var(--primary)] transition-colors"
        aria-label={t('evaluations.result.back') || 'Volver a evaluaciones'}
      >
        <FaArrowLeft className="w-4 h-4" />
        {t('evaluations.result.back')}
      </button>

      {/* Header */}
      <div className="bg-[var(--surface)] rounded-2xl p-8 shadow-sm border border-[var(--surface-container)]">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--on-surface)]">{evaluation.title}</h1>
            <p className="text-[var(--on-surface-variant)]">
              {t('evaluations.result.completedOn')} {formatDateTime(result.completed_at)}
            </p>
            <p className="mt-2 text-sm text-[var(--on-surface-variant)]">
              {t('evaluations.result.startedOn')}: {formatDateTime(result.started_at)}
              {' · '}{t('evaluations.result.duration')}: {Number.isFinite(Number(result.time_taken))
                ? `${Math.floor(result.time_taken / 3600)}:${String(Math.floor((result.time_taken % 3600) / 60)).padStart(2, '0')}:${String(result.time_taken % 60).padStart(2, '0')}`
                : '--:--:--'}
            </p>
            <p className="text-sm text-[var(--on-surface-variant)]">
              {t('evaluations.result.teacher')}: {evaluation.lesson?.course?.teacher?.full_name || evaluation.teacher?.full_name || '—'}
              {' · '}{t('evaluations.result.course')}: {evaluation.lesson?.course?.name || evaluation.lesson?.title || '—'}
              {' · '}{t('evaluations.result.school')}: {institutionName || '—'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadPdf}
              disabled={exportingPdf || exportingExcel}
              className="px-4 py-2 border border-[var(--outline-variant)] rounded-xl text-sm font-medium hover:bg-[var(--surface-container-low)] transition-colors flex items-center gap-2 disabled:opacity-50"
              aria-label={t('evaluations.result.downloadPdf') || 'Descargar PDF'}
            >
              <FaDownload className="w-4 h-4" />
              {exportingPdf ? t('evaluations.result.exporting') : t('evaluations.result.downloadPdf')}
            </button>
            <button
              onClick={handleDownloadExcel}
              disabled={exportingPdf || exportingExcel}
              className="px-4 py-2 border border-[var(--outline-variant)] rounded-xl text-sm font-medium hover:bg-[var(--surface-container-low)] transition-colors flex items-center gap-2 disabled:opacity-50"
              aria-label={t('evaluations.result.downloadExcel') || 'Descargar Excel'}
            >
              <FaFileExcel className="w-4 h-4" />
              {exportingExcel ? t('evaluations.result.exporting') : t('evaluations.result.downloadExcel')}
            </button>
          </div>
        </div>
      </div>

      {/* Score Card */}
      <div className="bg-[var(--surface)] rounded-2xl p-8 shadow-sm border border-[var(--surface-container)]">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Score Circle */}
          <div className="relative w-40 h-40">
            <div className="w-full h-full rounded-full border-8 border-[var(--surface-container)] flex items-center justify-center">
              <div className={`text-4xl font-bold ${getScoreColor(safeScore)}`}>
                {scoreLabel}
                <span className="text-base text-[var(--on-surface-variant)]">/20</span>
              </div>
            </div>
            <svg className="absolute top-0 left-0 w-full h-full -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="72"
                fill="none"
                stroke="var(--surface-container)"
                strokeWidth="8"
              />
              <circle
                cx="80"
                cy="80"
                r="72"
                fill="none"
                stroke={safeScore >= 16 ? '#22c55e' : safeScore >= 12 ? '#eab308' : '#ef4444'}
                strokeWidth="8"
                strokeDasharray="452.16"
                strokeDashoffset={452.16 - (safeScore / 20) * 452.16}
                className="transition-all duration-1000"
              />
            </svg>
          </div>

          {/* Stats */}
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl font-bold text-[var(--on-surface)] mb-2">
              {getScoreMessage(safeScore)}
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-[var(--surface-container-low)] rounded-xl">
                <p className="text-sm text-[var(--on-surface-variant)]">{t('evaluations.result.correct')}</p>
                <p className="text-xl font-bold text-[var(--secondary)]">
                  {result.correct_answers}/{result.total_questions}
                </p>
              </div>
              <div className="p-4 bg-[var(--surface-container-low)] rounded-xl">
                <p className="text-sm text-[var(--on-surface-variant)]">{t('evaluations.result.time')}</p>
                <p className="text-xl font-bold text-[var(--tertiary)]">
                  {Number.isFinite(Number(result.time_taken)) ? `${Math.floor(result.time_taken / 60)}:${String(result.time_taken % 60).padStart(2, '0')}` : '--:--'}
                </p>
              </div>
              <div className="p-4 bg-[var(--surface-container-low)] rounded-xl">
                <p className="text-sm text-[var(--on-surface-variant)]">{t('evaluations.result.attempt')}</p>
                <p className="text-xl font-bold text-[var(--on-surface)]">
                  #{result.attempt_number}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Question Review */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-[var(--on-surface)]">{t('evaluations.result.questionReview')}</h3>
        {result.student_answers && result.student_answers.map((answer, index) => {
          const partiallyCorrect = !answer.is_correct && Number(answer.points_earned) > 0;
          const answerIsPositive = answer.is_correct || partiallyCorrect;
          return (
          <div
            key={answer.id}
            className={`p-6 rounded-2xl border-l-4 ${
              answerIsPositive
                ? 'border-[var(--secondary)] bg-[var(--surface)]'
                : 'border-[var(--error)] bg-[var(--surface)]'
            } shadow-sm hover:shadow-md transition-all`}
          >
            <div className="flex items-start gap-4">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                answerIsPositive ? 'bg-[var(--secondary)]' : 'bg-[var(--error)]'
              }`}>
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-[var(--on-surface)]">
                    {answer.question?.question_text || t('evaluations.result.noText')}
                  </h4>
                  <span className={`flex items-center gap-1 text-sm font-bold ${
                    answerIsPositive ? 'text-[var(--secondary)]' : 'text-[var(--error)]'
                  }`}>
                    {answerIsPositive ? (
                      <FaCheckCircle className="w-4 h-4" />
                    ) : (
                      <FaTimesCircle className="w-4 h-4" />
                    )}
                    {answer.is_correct
                      ? t('evaluations.result.correct')
                      : partiallyCorrect
                        ? t('evaluations.result.partiallyCorrect')
                        : t('evaluations.result.incorrect')}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div className="p-3 bg-[var(--surface-container-low)] rounded-lg">
                    <p className="text-xs text-[var(--on-surface-variant)]">{t('evaluations.result.yourAnswer')}</p>
                    <p className={`font-mono ${answerIsPositive ? 'text-[var(--secondary)]' : 'text-[var(--error)]'}`}>
                      {answer.answer_display || answer.answer || t('evaluations.result.noAnswer')}
                    </p>
                  </div>
                  {!answer.is_correct && (answer.question?.correct_answer_display || answer.question?.correct_answer) && (
                    <div className="p-3 bg-[var(--secondary)]/10 rounded-lg border border-[var(--secondary)]/20">
                      <p className="text-xs text-[var(--on-surface-variant)]">{t('evaluations.result.correctAnswer')}</p>
                      <p className="font-mono text-[var(--secondary)]">
                        {answer.question.correct_answer_display || answer.question.correct_answer}
                      </p>
                    </div>
                  )}
                  <p className="mt-2 text-xs text-[var(--on-surface-variant)]">
                    {t('evaluations.result.pointsEarned')}: {Number(answer.points_earned || 0)} / {Number(answer.question?.points || 1)}
                  </p>
                </div>
                {answer.question?.explanation && (
                  <div className="mt-3 p-3 bg-[var(--surface-container-low)] rounded-lg">
                    <p className="text-xs text-[var(--on-surface-variant)]">💡 {t('evaluations.result.explanation')}</p>
                    <p className="text-sm text-[var(--on-surface)]">
                      {answer.question.explanation}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          );
        })}
      </div>

      {/* Suggested Actions */}
      <div className="bg-[var(--primary)] p-8 rounded-2xl text-white">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold">{t('evaluations.result.nextStep')}</h3>
            <p className="text-blue-100">
              {t('evaluations.result.needsReview')} — {result.score < 12 ? t('evaluations.result.basicTopics') : t('evaluations.result.advancedTopics')}
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/lessons"
              className="px-6 py-3 bg-white text-[var(--primary)] font-bold rounded-xl hover:shadow-lg transition-all"
            >
              {t('evaluations.result.reviewTopics')}
            </Link>
            <Link
              to="/lessons"
              className="px-6 py-3 bg-[var(--primary)] border border-white/30 font-bold rounded-xl hover:bg-white/10 transition-all"
            >
              {t('evaluations.result.viewStudyGuide')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvaluationResult;
