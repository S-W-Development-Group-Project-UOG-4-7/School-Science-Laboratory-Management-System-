// lib/types.ts
export type UserRole = 'student' | 'teacher' | 'lab-assistant' | 'principal' | 'admin';
// UI / Auth user (used for session, JWT, frontend)
export enum Role {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  LAB_ASSISTANT = 'LAB_ASSISTANT',
  PRINCIPAL = 'PRINCIPAL',
  ADMIN = 'ADMIN'
}
// UI / Auth user (used for session, JWT, frontend)
export type AuthUser = {
  id: string;        // string because JWT / session IDs are strings
  name: string;
  email: string;
  role: UserRole;   // frontend-safe role
};




export enum DifficultyLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED'
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TRUE_FALSE = 'TRUE_FALSE',
  SHORT_ANSWER = 'SHORT_ANSWER',
  MSQ = 'MSQ' // Multiple Select Questions
}

export enum QuizStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED'
}

export enum AttemptStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ABANDONED = 'ABANDONED'
}

// Core Types
export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
  teacher?: Teacher;
}

export interface Teacher {
  id: number;
  userId: number;
  subject?: string;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  practicals?: Practical[];
  schedules?: Schedule[];
  quizzes?: Quiz[];
}

export interface Practical {
  id: number;
  title: string;
  description?: string | null;
  subject: string;
  grade: string;
  duration: string;
  difficulty: DifficultyLevel;
  videoUrl?: string | null;
  labSheetUrl?: string | null;
  thumbnail?: string | null;
  createdAt: Date;
  updatedAt: Date;
  teacherId: number;
  
  // Relations
  teacher?: Teacher;
  quizzes?: Quiz[];
}

export interface Quiz {
  id: number;
  title: string;
  description?: string | null;
  practicalId: number;
  totalMarks: number;
  passingMarks: number;
  timeLimit?: number | null;
  status: QuizStatus;
  createdAt: Date;
  updatedAt: Date;
  teacherId: number;
  
  // Relations
  practical?: Practical;
  teacher?: Teacher;
  questions?: Question[];
  
  // UI helper fields (optional)
  isPublished?: boolean;
  createdBy?: string;
}

export interface Question {
  id: number;
  quizId: number;
  question: string;
  type: QuestionType;
  options: string[];
  correctAnswer?: string | null;
  correctAnswers?: any | null; // JSON field for MSQ
  marks: number;
  explanation?: string | null;
  order: number;
  createdAt: Date;
  
  // Relations
  quiz?: Quiz;
}

export interface QuizAttempt {
  id: number;
  quizId: number;
  studentId: number;
  answers: any; // JSON field
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  passed: boolean;
  startedAt: Date;
  completedAt: Date;
  status: AttemptStatus;
  
  // Relations
  quiz?: Quiz;
  student?: User;
}

export interface QuizAnswer {
  questionId: number;
  answer?: string; // For single answer questions
  selectedOptions?: string[]; // For MSQ questions
  isCorrect?: boolean;
  marksObtained?: number;
  feedback?: string;
}

export interface Schedule {
  id: number;
  title: string;
  date: Date;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
  teacherId: number;
  
  // Relations
  teacher?: Teacher;
}

export interface FileUpload {
  id: number;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  url: string;
  uploadedBy: number;
  entityType: string;
  entityId?: number | null;
  createdAt: Date;
  
  // Relations
  uploader?: User;
}

export interface StudentProgress {
  id: number;
  studentId: number;
  practicalId: number;
  watched: boolean;
  completed: boolean;
  watchTime?: number | null;
  lastWatched?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  student?: User;
  practical?: Practical;
}

// UI Types (for form handling and components)
export interface CreatePracticalInput {
  title: string;
  description?: string;
  subject: string;
  grade: string;
  duration: string;
  difficulty: DifficultyLevel;
  videoUrl?: string;
  labSheetUrl?: string;
  thumbnail?: string;
  teacherId: number;
}

export interface UpdatePracticalInput {
  title?: string;
  description?: string;
  subject?: string;
  grade?: string;
  duration?: string;
  difficulty?: DifficultyLevel;
  videoUrl?: string;
  labSheetUrl?: string;
  thumbnail?: string;
}

// FIXED: Added null types for description and timeLimit
export interface CreateQuizInput {
  title: string;
  description?: string | null;
  practicalId: number;
  teacherId: number;
  totalMarks?: number;
  passingMarks?: number;
  timeLimit?: number | null;
  status?: QuizStatus;
  questions?: CreateQuestionInput[];
}

// FIXED: Added null types for description and timeLimit
export interface UpdateQuizInput {
  title?: string;
  description?: string | null;
  totalMarks?: number;
  passingMarks?: number;
  timeLimit?: number | null;
  status?: QuizStatus;
  isPublished?: boolean;
}

export interface CreateQuestionInput {
  question: string;
  type: QuestionType;
  options: string[];
  correctAnswer?: string;
  correctAnswers?: string[];
  marks?: number;
  explanation?: string;
  order?: number;
}

export interface UpdateQuestionInput {
  question?: string;
  type?: QuestionType;
  options?: string[];
  correctAnswer?: string | null;
  correctAnswers?: any | null;
  marks?: number;
  explanation?: string | null;
  order?: number;
}

// FIXED: Separate type for form questions (uses string IDs)
export interface QuizQuestionFormData {
  id?: string; // Temporary ID for UI
  question: string;
  type: QuestionType;
  options: string[];
  correctAnswer?: string;
  correctAnswers?: string[];
  marks: number;
  explanation?: string;
  order: number;
}

export interface QuizFormData {
  title: string;
  description?: string | null;
  practicalId: number;
  totalMarks: number;
  passingMarks: number;
  timeLimit?: number | null;
  status: QuizStatus;
  questions: QuizQuestionFormData[];
}

export interface CreateQuizAttemptInput {
  quizId: number;
  studentId: number;
  answers: QuizAnswer[];
  startedAt: Date;
}

export interface SubmitQuizAttemptInput {
  completedAt: Date;
  answers: QuizAnswer[];
  status: AttemptStatus;
}

// Type Conversion Functions
export function difficultyToUI(difficulty: DifficultyLevel): string {
  switch (difficulty) {
    case DifficultyLevel.BEGINNER:
      return 'Beginner';
    case DifficultyLevel.INTERMEDIATE:
      return 'Intermediate';
    case DifficultyLevel.ADVANCED:
      return 'Advanced';
    default:
      return 'Intermediate';
  }
}

export function difficultyFromUI(difficulty: string): DifficultyLevel {
  switch (difficulty.toLowerCase()) {
    case 'beginner':
      return DifficultyLevel.BEGINNER;
    case 'intermediate':
      return DifficultyLevel.INTERMEDIATE;
    case 'advanced':
      return DifficultyLevel.ADVANCED;
    default:
      return DifficultyLevel.INTERMEDIATE;
  }
}

export function questionTypeToUI(type: QuestionType): string {
  switch (type) {
    case QuestionType.MULTIPLE_CHOICE:
      return 'Multiple Choice';
    case QuestionType.TRUE_FALSE:
      return 'True/False';
    case QuestionType.SHORT_ANSWER:
      return 'Short Answer';
    case QuestionType.MSQ:
      return 'Multiple Select';
    default:
      return 'Multiple Choice';
  }
}

export function questionTypeFromUI(type: string): QuestionType {
  switch (type.toLowerCase()) {
    case 'multiple choice':
    case 'multiple-choice':
      return QuestionType.MULTIPLE_CHOICE;
    case 'true/false':
    case 'true-false':
      return QuestionType.TRUE_FALSE;
    case 'short answer':
    case 'short-answer':
      return QuestionType.SHORT_ANSWER;
    case 'multiple select':
    case 'msq':
      return QuestionType.MSQ;
    default:
      return QuestionType.MULTIPLE_CHOICE;
  }
}

// Helper Functions
export function isMSQQuestion(question: Question): boolean {
  return question.type === QuestionType.MSQ || 
    (question.correctAnswers && 
     typeof question.correctAnswers === 'object' &&
     Array.isArray(question.correctAnswers) &&
     question.correctAnswers.length > 1);
}

export function getCorrectAnswers(question: Question): string[] {
  if (isMSQQuestion(question)) {
    if (question.correctAnswers) {
      try {
        if (typeof question.correctAnswers === 'string') {
          return JSON.parse(question.correctAnswers);
        }
        return question.correctAnswers;
      } catch (error) {
        console.error('Error parsing correctAnswers:', error);
        return [];
      }
    }
    return [];
  }
  
  return question.correctAnswer ? [question.correctAnswer] : [];
}

export function formatQuizDuration(minutes?: number | null): string {
  if (!minutes) return 'No time limit';
  if (minutes < 60) return `${minutes} minutes`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 
    ? `${hours}h ${remainingMinutes}m` 
    : `${hours} hour${hours > 1 ? 's' : ''}`;
}

// Type guards
export function isTeacher(user: User): boolean {
  return user.role === Role.TEACHER || user.role === Role.PRINCIPAL || user.role === Role.ADMIN;
}

export function isStudent(user: User): boolean {
  return user.role === Role.STUDENT;
}

export function canManageContent(user: User): boolean {
  return [Role.TEACHER, Role.LAB_ASSISTANT, Role.PRINCIPAL, Role.ADMIN].includes(user.role);
}

// Pagination types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Search and filter types
export interface PracticalFilters {
  search?: string;
  subject?: string;
  grade?: string;
  difficulty?: DifficultyLevel;
  teacherId?: number;
}

export interface QuizFilters {
  search?: string;
  status?: QuizStatus;
  practicalId?: number;
  teacherId?: number;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: number;
}

export interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
}

// File upload types
export interface FileUploadResult {
  success: boolean;
  url?: string;
  filename?: string;
  error?: string;
}

export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

// Form state types
export interface FormState {
  isSubmitting: boolean;
  isSuccess: boolean;
  isError: boolean;
  error?: string;
  successMessage?: string;
}

// Dashboard statistics
export interface DashboardStats {
  totalPracticals: number;
  totalQuizzes: number;
  totalStudents: number;
  completedQuizzes: number;
  averageScore: number;
  recentActivity: Array<{
    id: number;
    type: 'quiz' | 'practical' | 'progress';
    title: string;
    description: string;
    timestamp: Date;
  }>;
}

// Student progress types
export interface StudentPracticalProgress {
  practicalId: number;
  practicalTitle: string;
  watched: boolean;
  completed: boolean;
  watchTime?: number;
  lastWatched?: Date;
  quizzes: Array<{
    quizId: number;
    quizTitle: string;
    attempts: number;
    bestScore: number;
    lastAttempt: Date;
  }>;
}

// Quiz statistics
export interface QuizStatistics {
  quizId: number;
  totalAttempts: number;
  averageScore: number;
  passRate: number;
  questionStats: Array<{
    questionId: number;
    question: string;
    correctRate: number;
    commonWrongAnswers: string[];
  }>;
}

// FIXED: Helper function to convert string enums
export function stringToQuestionType(type: string): QuestionType {
  switch (type.toLowerCase()) {
    case 'multiple-choice':
    case 'multiple_choice':
    case 'multiple choice':
    case QuestionType.MULTIPLE_CHOICE.toLowerCase():
      return QuestionType.MULTIPLE_CHOICE;
    case 'msq':
    case 'multiple select':
    case 'multiple_select':
    case QuestionType.MSQ.toLowerCase():
      return QuestionType.MSQ;
    case 'true-false':
    case 'true_false':
    case 'true/false':
    case QuestionType.TRUE_FALSE.toLowerCase():
      return QuestionType.TRUE_FALSE;
    case 'short-answer':
    case 'short_answer':
    case 'short answer':
    case QuestionType.SHORT_ANSWER.toLowerCase():
      return QuestionType.SHORT_ANSWER;
    default:
      return QuestionType.MULTIPLE_CHOICE;
  }
}

// FIXED: Conversion functions for form data
export function convertQuestionToFormData(question: Question): QuizQuestionFormData {
  return {
    id: question.id.toString(),
    question: question.question,
    type: question.type,
    options: question.options || [],
    correctAnswer: question.correctAnswer || undefined,
    correctAnswers: question.correctAnswers ? 
      (typeof question.correctAnswers === 'string' ? 
        JSON.parse(question.correctAnswers) : 
        question.correctAnswers) : 
      undefined,
    marks: question.marks,
    explanation: question.explanation || undefined,
    order: question.order
  };
}

export function convertFormDataToCreateQuestion(data: QuizQuestionFormData): CreateQuestionInput {
  return {
    question: data.question,
    type: data.type,
    options: data.options,
    correctAnswer: data.correctAnswer,
    correctAnswers: data.correctAnswers,
    marks: data.marks,
    explanation: data.explanation,
    order: data.order
  };
}