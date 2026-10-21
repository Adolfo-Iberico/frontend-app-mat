// Evaluation builder for creating and editing class assessments tied to lessons and scoring rules.
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { evaluationsApi } from '../../api/evaluations';
import { lessonsApi } from '../../api/lessons';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { FaSave, FaTimes, FaPlus, FaTrash, FaCopy } from 'react-icons/fa';
import Loading from '../Common/Loading';
import { useLanguage } from '../../contexts/LanguageContext';
import { toArray } from '../../utils/helpers';

const toLocalDateTimeInput = (value) => {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
};

const toUtcDateTime = (value) => {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error('La fecha límite no es válida');
  }

  return date.toISOString();
};

const EvaluationCreator = () => {
  const { t } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lessons, setLessons] = useState([]);

  const questionSchema = yup.object().shape({
    type: yup.string().required(),
    question_text: yup.string().required(),
    options: yup.array().when('type', {
      is: 'multiple_choice',
      then: () => yup.array().min(2).of(
        yup.object().shape({
          label: yup.string().required(),
          value: yup.string().required()
        })
      )
    }),
    correct_answer: yup.string().required(),
    explanation: yup.string().nullable(),
    points: yup.number().min(1)
  });

  const schema = yup.object().shape({
    title: yup.string().required(),
    description: yup.string().nullable(),
    lesson_id: yup.string().nullable(),
    type: yup.string().required(),
    difficulty: yup.string().required(),
    time_limit: yup.number().min(1),
    due_date: yup.string().nullable(),
    max_attempts: yup.number().min(1),
    questions: yup.array().of(questionSchema)
  });

  const { register, control, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      lesson_id: '',
      type: 'quiz',
      difficulty: 'basic',
      time_limit: 30,
      due_date: '',
      max_attempts: 1,
      questions: []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questions'
  });

  useEffect(() => {
    fetchLessons();
    if (id) {
      fetchEvaluation();
    }
  }, [id]);

  const fetchLessons = async () => {
    try {
      const response = await lessonsApi.getLessons({ limit: 100 });
      setLessons(toArray(response.data?.data));
    } catch {
      toast.error('Error al cargar lecciones');
      setLessons([]);
    }
  };

  const fetchEvaluation = async () => {
    try {
      setLoading(true);
      const response = await evaluationsApi.getEvaluation(id);
      const evaluation = response.data?.data;

      if (!evaluation) {
        toast.error(t('teacher.evaluationCreator.notFound'));
        navigate('/evaluations');
        return;
      }

      setValue('title', evaluation.title);
      setValue('description', evaluation.description || '');
      setValue('lesson_id', evaluation.lesson_id || '');
      setValue('type', evaluation.type);
      setValue('difficulty', evaluation.difficulty);
      setValue('time_limit', evaluation.time_limit || 30);
      setValue('due_date', toLocalDateTimeInput(evaluation.due_date));
      setValue('max_attempts', evaluation.max_attempts || 1);
      setValue('questions', toArray(evaluation.questions));
    } catch (error) {
      toast.error(t('teacher.evaluationCreator.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setSaving(true);
      const evaluationData = {
        ...data,
        due_date: toUtcDateTime(data.due_date)
      };
      if (id) {
        await evaluationsApi.updateEvaluation(id, evaluationData);
        toast.success(t('teacher.evaluationCreator.saveSuccess'));
      } else {
        await evaluationsApi.createEvaluation(evaluationData);
        toast.success(t('teacher.evaluationCreator.saveSuccess'));
      }
      navigate('/evaluations');
    } catch (error) {
      toast.error(error.response?.data?.message || t('teacher.evaluationCreator.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const addQuestion = () => {
    append({
      type: 'multiple_choice',
      question_text: '',
      options: [
        { label: 'A', value: '' },
        { label: 'B', value: '' }
      ],
      correct_answer: '',
      explanation: '',
      points: 1
    });
  };

  const duplicateQuestion = (index) => {
    const questions = watch('questions');
    const questionToDuplicate = questions[index];
    append({
      ...questionToDuplicate,
      question_text: questionToDuplicate.question_text + ' (Copia)'
    });
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[var(--on-surface)]">
          {id ? t('teacher.evaluationCreator.editEvaluation') : t('teacher.evaluationCreator.newEvaluation')}
        </h2>
        <button
          onClick={() => navigate('/evaluations')}
          className="px-4 py-2 text-[var(--on-surface-variant)] hover:bg-[var(--surface-container)] rounded-xl transition-colors"
        >
          {t('teacher.evaluationCreator.cancel')}
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-[var(--surface)] p-6 rounded-2xl shadow-sm border border-[var(--surface-container)]">
          <h3 className="text-lg font-bold text-[var(--on-surface)] mb-4">{t('teacher.evaluationCreator.basicInfo')}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="eval-title" className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">
                {t('teacher.evaluationCreator.title')} *
              </label>
              <input
                id="eval-title"
                type="text"
                {...register('title')}
                className="w-full px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)]"
                placeholder={t('teacher.evaluationCreator.titlePlaceholder')}
              />
              {errors.title && (
                <p className="text-sm text-[var(--error)] mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="eval-type" className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">
                {t('teacher.evaluationCreator.type')} *
              </label>
              <select
                id="eval-type"
                {...register('type')}
                className="w-full px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)]"
              >
                <option value="exam">{t('teacher.evaluationCreator.exam')}</option>
                <option value="quiz">{t('teacher.evaluationCreator.quiz')}</option>
                <option value="homework">{t('teacher.evaluationCreator.homework')}</option>
                <option value="practice">{t('teacher.evaluationCreator.practice')}</option>
              </select>
            </div>

            <div>
              <label htmlFor="eval-difficulty" className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">
                {t('teacher.evaluationCreator.difficulty')} *
              </label>
              <select
                id="eval-difficulty"
                {...register('difficulty')}
                className="w-full px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)]"
              >
                <option value="basic">{t('lessons.basic')}</option>
                <option value="intermediate">{t('lessons.intermediate')}</option>
                <option value="advanced">{t('lessons.advanced')}</option>
              </select>
            </div>

            <div>
              <label htmlFor="eval-lesson-id" className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">
                {t('teacher.evaluationCreator.linkedLesson')}
              </label>
              <select
                id="eval-lesson-id"
                {...register('lesson_id')}
                className="w-full px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)]"
              >
                <option value="">{t('teacher.evaluationCreator.none')}</option>
                {lessons.map(lesson => (
                  <option key={lesson.id} value={lesson.id}>{lesson.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="eval-time-limit" className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">
                {t('teacher.evaluationCreator.timeLimit')}
              </label>
              <input
                id="eval-time-limit"
                type="number"
                {...register('time_limit')}
                className="w-full px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)]"
                placeholder="30"
              />
            </div>

            <div>
              <label htmlFor="eval-due-date" className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">
                {t('teacher.evaluationCreator.dueDate')}
              </label>
              <input
                id="eval-due-date"
                type="datetime-local"
                {...register('due_date')}
                className="w-full px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)]"
              />
            </div>

            <div>
              <label htmlFor="eval-max-attempts" className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">
                {t('teacher.evaluationCreator.maxAttempts')}
              </label>
              <input
                id="eval-max-attempts"
                type="number"
                {...register('max_attempts')}
                className="w-full px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)]"
                placeholder="1"
              />
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="eval-description" className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">
              {t('teacher.evaluationCreator.description')}
            </label>
            <textarea
              id="eval-description"
              {...register('description')}
              rows="2"
              className="w-full px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)] resize-none"
              placeholder={t('teacher.evaluationCreator.descriptionPlaceholder')}
            />
          </div>
        </div>

        {/* Questions */}
        <div className="bg-[var(--surface)] p-6 rounded-2xl shadow-sm border border-[var(--surface-container)]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-[var(--on-surface)]">
              {t('teacher.evaluationCreator.questions')} ({fields.length})
            </h3>
            <button
              type="button"
              onClick={addQuestion}
              className="px-4 py-2 bg-[var(--primary)] text-white rounded-xl hover:opacity-90 transition-all flex items-center gap-2"
            >
              <FaPlus />
              {t('teacher.evaluationCreator.addQuestion')}
            </button>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="mb-6 p-4 bg-[var(--surface-container-low)] rounded-xl border border-[var(--surface-container)]">
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-bold text-[var(--on-surface)]">
                  {t('teacher.evaluationCreator.questionNumber').replace('{num}', index + 1)}
                </h4>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => duplicateQuestion(index)}
                    className="text-[var(--primary)] hover:bg-[var(--primary)]/10 p-2 rounded-lg transition-colors"
                    aria-label={`Duplicar pregunta ${index + 1}`}
                  >
                    <FaCopy />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-[var(--error)] hover:bg-[var(--error)]/10 p-2 rounded-lg transition-colors"
                    aria-label={`Eliminar pregunta ${index + 1}`}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">
                    {t('teacher.evaluationCreator.typeLabel')}
                  </label>
                  <select
                    {...register(`questions.${index}.type`)}
                    className="w-full px-4 py-2 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-white"
                  >
                    <option value="multiple_choice">{t('teacher.evaluationCreator.multipleChoice')}</option>
                    <option value="fill_blank">{t('teacher.evaluationCreator.fillBlank')}</option>
                    <option value="formula">{t('teacher.evaluationCreator.formula')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">
                    {t('teacher.evaluationCreator.points')}
                  </label>
                  <input
                    type="number"
                    {...register(`questions.${index}.points`)}
                    className="w-full px-4 py-2 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-white"
                    placeholder="1"
                  />
                </div>
              </div>

              <div className="mt-3">
                <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">
                  {t('teacher.evaluationCreator.questionText')} *
                </label>
                <input
                  type="text"
                  {...register(`questions.${index}.question_text`)}
                  className="w-full px-4 py-2 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-white"
                  placeholder={t('teacher.evaluationCreator.questionTextPlaceholder')}
                />
              </div>

              {/* Opciones para preguntas de opción múltiple */}
              {watch(`questions.${index}.type`) === 'multiple_choice' && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">
                    {t('teacher.evaluationCreator.options')}
                  </label>
                  {watch(`questions.${index}.options`)?.map((option, optIndex) => (
                    <div key={optIndex} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        {...register(`questions.${index}.options.${optIndex}.value`)}
                        className="flex-1 px-4 py-2 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-white"
                        placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const options = watch(`questions.${index}.options`) || [];
                      setValue(`questions.${index}.options`, [
                        ...options,
                        { label: String.fromCharCode(65 + options.length), value: '' }
                      ]);
                    }}
                    className="text-sm text-[var(--primary)] hover:underline"
                  >
                    {t('teacher.evaluationCreator.addOption')}
                  </button>
                </div>
              )}

              <div className="mt-3">
                <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">
                  {t('teacher.evaluationCreator.correctAnswer')} *
                </label>
                <input
                  type="text"
                  {...register(`questions.${index}.correct_answer`)}
                  className="w-full px-4 py-2 rounded-xl border-2 border-[var(--secondary)] focus:border-[var(--primary)] focus:outline-none bg-white"
                  placeholder={t('teacher.evaluationCreator.correctAnswer')}
                />
              </div>

              <div className="mt-3">
                <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">
                  {t('teacher.evaluationCreator.explanationOptional')}
                </label>
                <textarea
                  {...register(`questions.${index}.explanation`)}
                  rows="2"
                  className="w-full px-4 py-2 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-white resize-none"
                  placeholder={t('teacher.evaluationCreator.explanationPlaceholder')}
                />
              </div>
            </div>
          ))}

          {fields.length === 0 && (
            <div className="text-center py-8">
              <p className="text-[var(--on-surface-variant)]">{t('teacher.evaluationCreator.noQuestions')}</p>
              <button
                type="button"
                onClick={addQuestion}
                className="mt-2 text-[var(--primary)] font-bold hover:underline"
              >
                {t('teacher.evaluationCreator.addFirstQuestion')}
              </button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 px-6 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <FaSave />
            {saving ? t('teacher.evaluationCreator.saving') : id ? t('teacher.evaluationCreator.updateEvaluation') : t('teacher.evaluationCreator.createEvaluation')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/evaluations')}
            className="px-6 py-3 bg-[var(--surface-container)] text-[var(--on-surface)] font-bold rounded-xl hover:bg-[var(--surface-container-high)] transition-all"
          >
            {t('teacher.evaluationCreator.cancel')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EvaluationCreator;
