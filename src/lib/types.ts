
export interface Lesson {
  estimated_time: number | null;
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  duration: string | null;
  video_url: string | null;
  resource_url: string | null;
  live_session_url: string | null;
  live_session_datetime: string | null;
  is_free: boolean;
  order: number | null;
  created_at: string;
  updated_at: string;
  lesson_type: 'video' | 'live';
  /** Campos Aulamate: el Ã­tem es un recurso (pdf/video/link) o el propio contenido. */
  isContent?: boolean;
  resourceType?: 'pdf' | 'video' | 'image' | 'link' | 'audio' | null;
  url?: string | null;
}

export interface Brochure {
    id: string;
    course_id: string;
    objectives: string[] | null;
    student_profile: string | null;
    programs: string[] | null;
    brochure_url: string | null;
    objectives_image_url: string | null;
    student_profile_image_url: string | null;
    programs_image_url: string | null;
    digital_certificate_description: string | null;
    digital_certificate_image_url: string | null;
    physical_certificate_description: string | null;
    physical_certificate_image_url: string | null;
    offers_digital_certificate: boolean;
    offers_physical_certificate: boolean;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  long_description: string | null;
  instructor_id: string;
  price: number;
  price_usd: number | null;
  original_price: number | null;
  presale_price: number | null;
  is_active: boolean;
  category: string | null;
  category_id: string;
  image_url: string | null;
  level: 'Principiante' | 'Intermedio' | 'Avanzado' | 'Todos';
  language: string;
  created_at: string;
  updated_at: string;
  lessons: Lesson[]; // Added to make it easier to access
  instructor: { // Added to make it easier to access
    id: string;
    name: string;
    avatarUrl: string;
  };
  rating: number; // Added to make it easier to access
  reviews: number; // Added to make it easier to access
  students: number; // Added to make it easier to access
  lastUpdated: string; // Added to make it easier to access
  brochure: Brochure | null;
  /** Campos Aulamate (un "curso" del frontend es una lecciÃ³n del backend). */
  grade?: string | null;
  estimatedTime?: number | null;
  topic?: string | null;
  tags?: string[];
  resources?: LessonResource[];
  progress?: number | null;
  progressStatus?: string | null;
  evaluations?: EvaluationSummary[];
  viewsCount?: number;
}

export interface Enrollment {
    id: string;
    user_id: string;
    course_id: string;
    enrolled_at: string;
    progress: number;
    user?: {
        name: string;
        email: string;
    } | null;
    course?: {
        title: string;
    } | null;
}


export interface LearningPath {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  courses: Course[];
  coursesCount?: number;
}

export interface LearningPathCourse {
    id: string;
    learning_path_id: string;
    course_id: string;
    order: number;
}

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  role: 'admin' | 'user' | 'docente';
  avatar_url?: string | null;
  phone?: string | null;
  address?: string | null;
  location?: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
  specialty?: string | null;
  bio?: string | null;
  linkedin_url?: string | null;
  bio_image_url?: string | null;
  /** Campos Aulamate. */
  institution?: string | null;
  grade?: string | null;
  is_active?: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
  comment: string;
  rating: number;
  courseTitle?: string;
}

export interface Answer {
    id: string;
    question_id: string;
    user_id: string;
    author: {
        name: string;
        avatarUrl: string;
        isInstructor?: boolean;
    };
    content: string;
    created_at: string;
    votes: number;
}

export interface Question {
    id: string;
    user_id: string;
    course_id: string;
    lesson_id: string;
    author: {
        name: string;
        avatarUrl: string;
    };
    title: string;
    content: string;
    created_at: string;
    votes: number;
    answers: Answer[];
    /** Estado del hilo del foro: 'open' | 'closed'. */
    status?: string;
    lesson?: { // Added for admin view context
        id: string;
        title: string;
    } | null;
}

export interface CourseCategory {
    id: string;
    name: string;
    created_at: string;
}

export interface QuizQuestion {
  id: string;
  course_id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  created_at: string;
  /** Campos Aulamate. */
  type?: 'multiple_choice' | 'fill_blank' | 'drag_drop' | 'formula';
  points?: number;
  explanation?: string | null;
  evaluationId?: string;
}

export interface Note {
  id: string;
  user_id: string;
  lesson_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface CourseReview {
    id: string;
    course_id: string;
    user_id: string;
    rating: number;
    comment: string | null;
    created_at: string;
}

export interface LiveSession {
    id: string;
    title: string;
    datetime: string;
    courseTitle: string;
    sessionUrl: string | null;
    courseId?: string;
    isFree?: boolean;
    course?: {
        id: string;
        title: string;
    } | null;
}

export interface LessonProgress {
    id: string;
    enrollment_id: string;
    lesson_id: string;
    completed_at: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  long_description: string | null;
  image_urls: string[];
  author_id: string;
  author: {
    name: string;
    avatarUrl: string;
  };
  created_at: string;
  updated_at: string;
  is_project: boolean;
}

export type OrderStatus = 'pendiente' | 'pagado' | 'cancelado';

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  currency: string;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
  user?: {
    name: string;
    email: string;
  };
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  course_id: string;
  price: number;
  course?: {
    title: string;
  };
}

export interface PhysicalCertificateRequest {
    id: string;
    user_id: string;
    course_id: string;
    status: 'pendiente' | 'pagado' | 'en_revision' | 'aprobado' | 'desaprobado';
    work_file_url: string | null;
    grade: number | null;
    created_at: string;
    updated_at: string;
    requirements_url: string | null;
}

export type CertificateOrderStatus = 'pendiente' | 'pagado' | 'cancelado';

export interface CertificateOrder {
    id: string;
    user_id: string;
    course_id: string;
    status: CertificateOrderStatus;
    created_at: string;
    updated_at: string;
     user?: {
        name: string;
        email: string;
    };
    course?: {
        title: string;
    };
}


export interface Partner {
    id: string;
    name: string;
    logo_url: string;
    created_at: string;
}

export interface SocialVideo {
    id: string;
    title: string;
    url: string;
    created_at: string;
}

export interface CertificateWithDetails {
  id: string;
  issued_at: string;
  validation_id: string;
  type?: 'Digital' | 'FÃ­sico (CIP)' | 'HistÃ³rico';
  student: {
    name: string;
  };
  course: {
    id: string;
    title: string;
    image_url: string | null;
    certificate_image_url?: string | null;
  };
}
    

/** Usuario autenticado (sesiÃ³n de prueba). */
export interface AuthUser {
  id: string;
  email: string;
}

export interface Notification {
  id: string;
  user_id: string;
  message: string;
  link: string | null;
  read: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Tipos Aulamate (integraciÃ³n con el backend Laravel)
// ============================================================

/** Recurso adjunto a una lecciÃ³n del backend. */
export interface LessonResource {
  id?: string;
  type: 'pdf' | 'video' | 'image' | 'link' | 'audio' | string;
  url: string;
  title: string;
  description?: string | null;
  created_at?: string;
}

/** Resumen de una evaluaciÃ³n del backend. */
export interface EvaluationSummary {
  id: string;
  title: string;
  description: string | null;
  type: string;
  difficulty: string;
  timeLimit: number | null;
  maxAttempts: number;
  isPublished: boolean;
  totalQuestions: number;
  dueDate: string | null;
}

/** Pregunta de una evaluaciÃ³n del backend. */
export interface EvaluationQuestion {
  id: string;
  type: 'multiple_choice' | 'fill_blank' | 'drag_drop' | 'formula' | string;
  question_text: string;
  options: { label: string; value: string }[];
  correct_answer?: string | null;
  explanation?: string | null;
  points: number;
  order?: number | null;
}

/** Resultado de enviar una evaluaciÃ³n (calificaciÃ³n 0â€“20). */
export interface EvaluationSubmissionResult {
  success: true;
  score: number;
  maxScore: number;
  correctAnswers: number;
  totalQuestions: number;
  answers?: {
    questionId: string;
    question: string;
    answer: string;
    correctAnswer: string | null;
    isCorrect: boolean;
    explanation: string | null;
  }[];
  gradingWarning?: boolean;
  message?: string;
}

/** MÃ©tricas del dashboard segÃºn el rol del usuario autenticado. */
export interface PlatformStats {
  role: 'admin' | 'docente' | 'user';
  cards: { label: string; value: string | number; hint: string }[];
  chart: { name: string; total: number }[];
  chartTitle: string;
  recentItems: { id: string; title: string; subtitle?: string | null; href: string }[];
  recentTitle: string;
}

