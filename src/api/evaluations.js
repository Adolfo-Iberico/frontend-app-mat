// Provides API calls for evaluations, their questions, and submitted results.
import api from './axios';

export const evaluationsApi = {
  // ===== EVALUACIONES =====
  getEvaluations: (params = {}) => api.get('/evaluations', { params }),
  getEvaluation: (id) => api.get(`/evaluations/${id}`),
  createEvaluation: (data) => api.post('/evaluations', data),
  updateEvaluation: (id, data) => api.put(`/evaluations/${id}`, data),
  deleteEvaluation: (id) => api.delete(`/evaluations/${id}`),
  publishEvaluation: (id) => api.post(`/evaluations/${id}/publish`),
  unpublishEvaluation: (id) => api.post(`/evaluations/${id}/unpublish`),
  duplicateEvaluation: (id) => api.post(`/evaluations/${id}/duplicate`),
  getEvaluationStats: (id) => api.get(`/evaluations/${id}/stats`),
  startEvaluation: (id) => api.post(`/evaluations/${id}/start`),
  reportTabSwitch: (evaluationId, attemptId) =>
    api.post(`/evaluations/${evaluationId}/attempts/${attemptId}/tab-switch`),
  getPublicConfig: () => api.get('/config'),
  
  // ===== PREGUNTAS =====
  getQuestions: (evaluationId) => api.get(`/evaluations/${evaluationId}/questions`),
  addQuestion: (evaluationId, data) => api.post(`/evaluations/${evaluationId}/questions`, data),
  updateQuestion: (questionId, data) => api.put(`/evaluations/questions/${questionId}`, data),
  deleteQuestion: (questionId) => api.delete(`/evaluations/questions/${questionId}`),
  
  // ===== RESULTADOS =====
  submitEvaluation: (evaluationId, data) => api.post(`/evaluations/${evaluationId}/submit`, data),
  getResults: (evaluationId) => api.get(`/evaluations/${evaluationId}/results`),
  exportResultPdf: (evaluationId, resultId) => api.get(
    `/evaluations/${evaluationId}/results/${resultId}/pdf`,
    { responseType: 'blob' }
  ),
  exportResultExcel: (evaluationId, resultId) => api.get(
    `/evaluations/${evaluationId}/results/${resultId}/excel`,
    { responseType: 'blob' }
  ),
  getStudentResult: (evaluationId, userId) => api.get(`/evaluations/${evaluationId}/result/${userId}`),
};