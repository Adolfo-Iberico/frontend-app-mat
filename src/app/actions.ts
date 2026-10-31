'use server';

// Courses (lecciones del backend Aulamate)
import {
  getCourses,
  getPublicCourses,
  getDistinctLevels,
  getDistinctCategories,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  setCoursePublished,
  getInstructorDetails,
  getRecommendedCourses,
  getUnitPaths,
  getUnitPathDetails,
} from '@/lib/actions/courses';

// Users
import {
  redirectToUsers,
  createUser,
  getUsers,
  updateUserRole,
  setUserActive,
  deleteUser,
  getInstructors,
  updateProfile,
  adminUpdateUser,
  getUserById,
} from '@/lib/actions/users';

// Lessons (contenido + recursos + progreso)
import {
  getLessonsByCourseId,
  createLesson,
  updateLesson,
  deleteLesson,
  getLessonProgressForCourse,
  toggleLessonCompleted,
  importLessonResources,
  getLessonResources,
} from '@/lib/actions/lessons';

// Questions (foro real)
import {
  getQuestionsByLessonId,
  getQuestionsByCourseId,
  postQuestion,
  postAnswer,
  incrementVote,
  deleteQuestion,
  deleteAnswer,
  closeThread,
} from '@/lib/actions/questions';

// Evaluations (calificadas en el servidor)
import {
  getEvaluationByCourseId,
  getQuizQuestionsByCourseId,
  getEvaluationQuestions,
  submitEvaluation,
  saveQuizQuestions,
} from '@/lib/actions/evaluations';

// News (anuncios del backend)
import {
  getNewsArticles,
  getNewsArticleById,
  getAdminNewsArticles,
  createNewsArticle,
  updateNewsArticle,
  deleteNewsArticle,
} from '@/lib/actions/news';

// Notifications
import {
  getUnreadNotifications,
  markNotificationsAsRead,
} from '@/lib/actions/notifications';

// Platform (dashboards por rol)
import { getPlatformStats } from '@/lib/actions/platform';

// AI resource suggester
import { getResourceSuggestion } from '@/lib/actions/ai';

export {
  getCourses,
  getPublicCourses,
  getDistinctLevels,
  getDistinctCategories,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  setCoursePublished,
  getInstructorDetails,
  getRecommendedCourses,
  getUnitPaths,
  getUnitPathDetails,
  redirectToUsers,
  createUser,
  getUsers,
  updateUserRole,
  setUserActive,
  deleteUser,
  getInstructors,
  updateProfile,
  adminUpdateUser,
  getUserById,
  getLessonsByCourseId,
  createLesson,
  updateLesson,
  deleteLesson,
  getLessonProgressForCourse,
  toggleLessonCompleted,
  importLessonResources,
  getLessonResources,
  getQuestionsByLessonId,
  getQuestionsByCourseId,
  postQuestion,
  postAnswer,
  incrementVote,
  deleteQuestion,
  deleteAnswer,
  closeThread,
  getEvaluationByCourseId,
  getQuizQuestionsByCourseId,
  getEvaluationQuestions,
  submitEvaluation,
  saveQuizQuestions,
  getNewsArticles,
  getNewsArticleById,
  getAdminNewsArticles,
  createNewsArticle,
  updateNewsArticle,
  deleteNewsArticle,
  getUnreadNotifications,
  markNotificationsAsRead,
  getPlatformStats,
  getResourceSuggestion,
};
