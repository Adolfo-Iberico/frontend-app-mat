// Presents an evaluation's questions and submits the student's answers.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaArrowLeft, FaCheck, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { evaluationsApi } from '../../api/evaluations';
import { useLanguage } from '../../contexts/LanguageContext';
import { toArray } from '../../utils/helpers';
import Loading from '../Common/Loading';
import { logger } from '../../utils/logger';

const EvaluationPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [evaluation, setEvaluation] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [attempt, setAttempt] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [allowTabSwitches, setAllowTabSwitches] = useState(true);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [tabWarningVisible, setTabWarningVisible] = useState(false);
  const autoSubmitTriggered = useRef(false);
  const tabReportRequests = useRef([]);

  useEffect(() => {
    let cancelled = false;

    const loadEvaluation = async () => {
      try {
        const response = await evaluationsApi.getEvaluation(id);
        const data = response.data?.data ?? response.data;
        const embeddedQuestions = toArray(data?.questions);
        const questionResponse = embeddedQuestions.length
          ? null
          : await evaluationsApi.getQuestions(id);
        const loadedQuestions = embeddedQuestions.length
          ? embeddedQuestions
          : toArray(questionResponse?.data?.data ?? questionResponse?.data);

        if (!data || !loadedQuestions.length) {
          throw new Error(t('evaluations.player.noQuestions'));
        }
        const attemptResponse = await evaluationsApi.startEvaluation(id);
        const startedAttempt = attemptResponse.data?.data ?? attemptResponse.data;
        if (!cancelled) {
          setEvaluation(data);
          setQuestions(loadedQuestions);
          setAttempt(startedAttempt);
          setAllowTabSwitches(startedAttempt?.allow_tab_switches !== false);
          setTabSwitchCount(startedAttempt?.tab_switch_count ?? 0);
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(error.response?.data?.message || error.message || t('evaluations.player.loadError'));
          navigate('/evaluations');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadEvaluation();
    return () => {
      cancelled = true;
    };
  }, [id, navigate, t]);

  const setAnswer = (questionId, value) => {
    setAnswers((current) => ({ ...current, [questionId]: value }));
  };

  const handleSubmit = useCallback(async (event, forced = false) => {
    event?.preventDefault();
    if (submitting) return;
    const unanswered = questions.some((question, index) => {
      const answer = answers[question.id ?? index];
      return answer === undefined || answer === null || String(answer).trim() === '';
    });

    if (unanswered && !forced) {
      toast.error(t('evaluations.player.answerAll'));
      return;
    }

    try {
      setSubmitting(true);
      await Promise.allSettled(tabReportRequests.current);
      const response = await evaluationsApi.submitEvaluation(id, {
        attempt_id: attempt?.id,
        answers: questions
          .filter((question, index) => {
            const answer = answers[question.id ?? index];
            return answer !== undefined && answer !== null && String(answer).trim() !== '';
          })
          .map((question, index) => ({
            question_id: String(question.id ?? index),
            answer: String(answers[question.id ?? index]),
          })),
      });
      const resultData = response.data?.data ?? response.data;
      if (resultData?.grading_warning) toast.error(resultData.grading_warning);
      toast.success(t('evaluations.player.submitSuccess'));
      navigate(`/evaluations/${id}/result`);
    } catch (error) {
      toast.error(error.response?.data?.message || t('evaluations.player.submitError'));
    } finally {
      setSubmitting(false);
    }
  }, [answers, attempt?.id, id, navigate, questions, submitting, t]);

  useEffect(() => {
    if (!attempt?.started_at || !evaluation?.time_limit) return undefined;

    const updateRemaining = () => {
      const elapsed = Math.max(0, Math.floor((Date.now() - Date.parse(attempt.started_at)) / 1000));
      setTimeRemaining(Math.max(0, evaluation.time_limit * 60 - elapsed));
    };

    updateRemaining();
    const interval = window.setInterval(updateRemaining, 1000);
    return () => window.clearInterval(interval);
  }, [attempt?.started_at, evaluation?.time_limit]);

  useEffect(() => {
    if (allowTabSwitches || !attempt) return undefined;

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount((count) => count + 1);
        const reportRequest = evaluationsApi.reportTabSwitch(id, attempt.id).catch((error) => {
          logger.error('Failed to record evaluation tab switch:', error);
        });
        tabReportRequests.current.push(reportRequest);
      } else {
        setTabWarningVisible(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [allowTabSwitches, attempt]);

  useEffect(() => {
    if (timeRemaining !== 0 || !attempt || autoSubmitTriggered.current) return;
    autoSubmitTriggered.current = true;
    void handleSubmit(null, true);
  }, [attempt, handleSubmit, timeRemaining]);

  if (loading) return <Loading />;
  if (!evaluation || !questions.length) return null;

  const currentQuestion = questions[currentIndex];
  const questionId = currentQuestion.id ?? currentIndex;
  const options = Array.isArray(currentQuestion.options) ? currentQuestion.options : [];
  const answerValue = answers[questionId] ?? '';
  const remainingLabel = timeRemaining === null
    ? null
    : `${Math.floor(timeRemaining / 60)}:${String(timeRemaining % 60).padStart(2, '0')}`;

  return (
    <form onSubmit={(event) => handleSubmit(event)} className="max-w-4xl mx-auto space-y-6">
      <button
        type="button"
        onClick={() => {
          if (allowTabSwitches) {
            navigate('/evaluations');
          } else {
            setTabWarningVisible(true);
          }
        }}
        className="flex items-center gap-2 text-[var(--on-surface-variant)] hover:text-[var(--primary)]"
      >
        <FaArrowLeft />
        {t('evaluations.player.back')}
      </button>

      <header className="bg-[var(--surface)] rounded-2xl p-6 border border-[var(--surface-container)]">
        <h1 className="text-2xl font-bold text-[var(--on-surface)]">{evaluation.title}</h1>
        {evaluation.description && (
          <p className="mt-2 text-[var(--on-surface-variant)]">{evaluation.description}</p>
        )}
        <p className="mt-3 text-sm text-[var(--on-surface-variant)]">
          {t('evaluations.player.question')} {currentIndex + 1} {t('evaluations.player.of')} {questions.length}
          {evaluation.time_limit ? ` · ${evaluation.time_limit} min` : ''}
          {remainingLabel !== null && ` · ${t('evaluations.player.timeRemaining')}: ${remainingLabel}`}
        </p>
        {!allowTabSwitches && (
          <p className="mt-2 text-sm font-medium text-amber-700" role="status">
            {t('evaluations.player.tabSwitchTracking')}
            {tabSwitchCount > 0 && ` (${tabSwitchCount})`}
          </p>
        )}
      </header>

      <section className="bg-[var(--surface)] rounded-2xl p-6 md:p-8 border border-[var(--surface-container)]">
        <div className="flex items-center gap-3 mb-4">
          <span className="rounded-full px-3 py-1 text-sm font-bold bg-[var(--primary)]/10 text-[var(--primary)]">
            {currentQuestion.points ?? 1} pts
          </span>
          <span className="text-sm text-[var(--on-surface-variant)]">
            {t('evaluations.player.question')} {currentIndex + 1}
          </span>
        </div>
        <h2 className="text-lg font-semibold text-[var(--on-surface)] mb-6">
          {currentQuestion.question_text}
        </h2>

        {options.length > 0 ? (
          <div className="space-y-3">
            {options.map((option, optionIndex) => {
              const value = option.value ?? option.label ?? String(optionIndex);
              return (
                <label
                  key={`${value}-${optionIndex}`}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer ${
                    answerValue === value
                      ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                      : 'border-[var(--outline-variant)] hover:border-[var(--primary)]/50'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${questionId}`}
                    value={value}
                    checked={answerValue === value}
                    onChange={() => setAnswer(questionId, value)}
                    className="accent-[var(--primary)]"
                  />
                  <span className="font-medium text-[var(--on-surface)]">
                    {option.label && option.value ? `${option.label}. ` : ''}{option.value ?? option.label}
                  </span>
                </label>
              );
            })}
          </div>
        ) : (
          <input
            type="text"
            value={answerValue}
            onChange={(event) => setAnswer(questionId, event.target.value)}
            aria-label={t('evaluations.player.answer')}
            placeholder={t('evaluations.player.answerPlaceholder')}
            className="w-full p-4 rounded-xl border-2 border-[var(--outline-variant)] bg-[var(--surface)] text-[var(--on-surface)] focus:border-[var(--primary)] focus:outline-none"
          />
        )}
      </section>

      <div className="flex flex-wrap justify-between gap-3">
        <button
          type="button"
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((index) => index - 1)}
          className="px-5 py-3 rounded-xl bg-[var(--surface-container)] text-[var(--on-surface)] font-bold disabled:opacity-50"
        >
          <FaChevronLeft className="inline mr-2" />
          {t('evaluations.player.previous')}
        </button>
        {currentIndex < questions.length - 1 ? (
          <button
            type="button"
            onClick={() => setCurrentIndex((index) => index + 1)}
            className="px-5 py-3 rounded-xl bg-[var(--primary)] text-white font-bold"
          >
            {t('evaluations.player.next')}
            <FaChevronRight className="inline ml-2" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-3 rounded-xl bg-[var(--primary)] text-white font-bold disabled:opacity-50"
          >
            <FaCheck className="inline mr-2" />
            {submitting ? t('evaluations.player.submitting') : t('evaluations.player.submit')}
          </button>
        )}
      </div>

      <nav aria-label={t('evaluations.player.questionNavigation')} className="flex flex-wrap gap-2">
        {questions.map((question, index) => {
          const key = question.id ?? index;
          const answered = answers[key] !== undefined && String(answers[key]).trim() !== '';
          return (
            <button
              key={key}
              type="button"
              onClick={() => setCurrentIndex(index)}
              aria-label={`${t('evaluations.player.question')} ${index + 1}`}
              aria-current={index === currentIndex ? 'step' : undefined}
              className={`w-10 h-10 rounded-lg font-bold ${
                index === currentIndex
                  ? 'bg-[var(--primary)] text-white'
                  : answered
                    ? 'bg-green-100 text-green-700'
                    : 'bg-[var(--surface-container)] text-[var(--on-surface-variant)]'
              }`}
            >
              {index + 1}
            </button>
          );
        })}
      </nav>
      {tabWarningVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="alertdialog" aria-modal="true">
          <div className="max-w-md rounded-2xl bg-[var(--surface)] p-6 shadow-xl">
            <p className="font-bold text-[var(--on-surface)]">{t('evaluations.player.tabSwitchDetected')}</p>
            <p className="mt-2 text-sm text-[var(--on-surface-variant)]">{t('evaluations.player.tabSwitchRecorded')}</p>
            <button
              type="button"
              onClick={() => setTabWarningVisible(false)}
              className="mt-4 rounded-xl bg-[var(--primary)] px-4 py-2 font-bold text-white"
            >
              {t('evaluations.player.continue')}
            </button>
          </div>
        </div>
      )}
    </form>
  );
};

export default EvaluationPlayer;
