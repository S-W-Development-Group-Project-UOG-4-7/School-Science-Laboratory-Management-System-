// lib/types.ts
export type UserRole = 'student' | 'teacher' | 'lab-assistant' | 'principal' | 'admin';

export interface User {
  id: string | number;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: Date;
}

export interface Teacher {
  id: string | number;
  userId: number;
  subject?: string;
  createdAt?: Date;
  user?: User;
}

export interface Practical {
  id: string | number;
  title: string;
  description?: string;
  subject: 'Physics' | 'Chemistry' | 'Biology' | 'Science' | string;
  grade: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | string;
  videoUrl?: string | null;
  labSheetUrl?: string | null;
  thumbnail?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  teacherId?: number;
  quizzes?: Quiz[];
}

export interface Quiz {
  id: string | number;
  practicalId: string | number;
  title: string;
  description?: string;
  totalMarks: number;
  passingMarks: number;
  timeLimit?: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  createdAt?: Date;
  updatedAt?: Date;
  teacherId?: number;
  questions: QuizQuestion[];
  // UI specific fields (for compatibility with existing code)
  isPublished?: boolean;
  createdBy?: string;
}

export type QuestionType = 'multiple-choice' | 'true-false' | 'short-answer' | 'msq';
export type DBQuestionType = 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER';

export interface QuizQuestion {
  id: string | number;
  quizId: string | number;
  question: string;
  type: QuestionType;
  options: string[]; // For multiple-choice, msq, and true-false
  correctAnswer?: string; // For single answer questions
  correctAnswers?: string[]; // For msq (multiple select)
  marks: number;
  explanation?: string;
  order?: number;
  createdAt?: Date;
}

export interface QuizAttempt {
  id: string | number;
  quizId: string | number;
  studentId: string | number;
  studentName: string;
  answers: QuizAnswer[];
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  passed: boolean;
  startedAt: Date;
  completedAt?: Date;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED' | 'in-progress' | 'completed' | 'submitted';
}

export interface QuizAnswer {
  id?: string | number;
  attemptId?: string | number;
  questionId: string | number;
  answer?: string; // For single answer questions
  selectedOptions?: string[]; // For msq questions
  isCorrect?: boolean;
  marksObtained: number;
  feedback?: string;
}

// Database-specific types (for API responses)
export interface DBPractical {
  id: number;
  title: string;
  description: string | null;
  subject: string;
  grade: string;
  duration: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  videoUrl: string | null;
  labSheetUrl: string | null;
  thumbnail: string | null;
  createdAt: Date;
  updatedAt: Date;
  teacherId: number;
  quizzes?: DBQuiz[];
}

export interface DBQuiz {
  id: number;
  title: string;
  description: string | null;
  practicalId: number;
  totalMarks: number;
  passingMarks: number;
  timeLimit: number | null;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  createdAt: Date;
  updatedAt: Date;
  teacherId: number;
  questions?: DBQuestion[];
}

export interface DBQuestion {
  id: number;
  quizId: number;
  question: string;
  type: DBQuestionType;
  options: string[];
  correctAnswer: string | null;
  correctAnswers: any | null; // JSON field
  marks: number;
  explanation: string | null;
  order: number;
  createdAt: Date;
}

// Utility types for form handling
export interface CreatePracticalInput {
  title: string;
  description: string;
  subject: string;
  grade: string;
  duration: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  videoUrl?: string;
  labSheetUrl?: string;
  thumbnail?: string;
  teacherId: number;
}

export interface CreateQuizInput {
  title: string;
  description?: string;
  practicalId: number;
  teacherId: number;
  totalMarks?: number;
  passingMarks?: number;
  timeLimit?: number;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  questions: CreateQuestionInput[];
}

export interface CreateQuestionInput {
  question: string;
  type: QuestionType | DBQuestionType;
  options: string[];
  correctAnswer?: string;
  correctAnswers?: string[];
  marks?: number;
  explanation?: string;
}

// Type guards and utilities
export function isMultipleChoiceQuestion(question: QuizQuestion | DBQuestion): boolean {
  const type = 'type' in question ? question.type : (question as any).type;
  return type === 'multiple-choice' || type === 'MULTIPLE_CHOICE' || type === 'msq';
}

export function isTrueFalseQuestion(question: QuizQuestion | DBQuestion): boolean {
  const type = 'type' in question ? question.type : (question as any).type;
  return type === 'true-false' || type === 'TRUE_FALSE';
}

export function isShortAnswerQuestion(question: QuizQuestion | DBQuestion): boolean {
  const type = 'type' in question ? question.type : (question as any).type;
  return type === 'short-answer' || type === 'SHORT_ANSWER';
}

export function isMSQQuestion(question: QuizQuestion | DBQuestion): boolean {
  const type = 'type' in question ? question.type : (question as any).type;
  if (type === 'msq') return true;
  
  // Check if it's a MULTIPLE_CHOICE with multiple correct answers
  if (type === 'MULTIPLE_CHOICE' || type === 'multiple-choice') {
    const quizQuestion = question as QuizQuestion;
    if (quizQuestion.correctAnswers && Array.isArray(quizQuestion.correctAnswers) && quizQuestion.correctAnswers.length > 1) {
      return true;
    }
  }
  
  return false;
}

// Convert database types to UI types
export function dbToUIPractical(dbPractical: DBPractical): Practical {
  return {
    id: dbPractical.id,
    title: dbPractical.title,
    description: dbPractical.description || '',
    subject: dbPractical.subject as any,
    grade: dbPractical.grade,
    duration: dbPractical.duration,
    difficulty: dbPractical.difficulty.charAt(0) + dbPractical.difficulty.slice(1).toLowerCase() as any,
    videoUrl: dbPractical.videoUrl,
    labSheetUrl: dbPractical.labSheetUrl,
    thumbnail: dbPractical.thumbnail,
    createdAt: dbPractical.createdAt,
    updatedAt: dbPractical.updatedAt,
    teacherId: dbPractical.teacherId,
    quizzes: dbPractical.quizzes?.map(dbToUIQuiz) || [],
  };
}

export function dbToUIQuiz(dbQuiz: DBQuiz): Quiz {
  return {
    id: dbQuiz.id,
    practicalId: dbQuiz.practicalId,
    title: dbQuiz.title,
    description: dbQuiz.description || undefined,
    totalMarks: dbQuiz.totalMarks,
    passingMarks: dbQuiz.passingMarks,
    timeLimit: dbQuiz.timeLimit || undefined,
    status: dbQuiz.status,
    createdAt: dbQuiz.createdAt,
    updatedAt: dbQuiz.updatedAt,
    teacherId: dbQuiz.teacherId,
    questions: dbQuiz.questions?.map(dbToUIQuestion) || [],
    isPublished: dbQuiz.status === 'PUBLISHED',
    createdBy: 'teacher', // You'll need to fetch teacher name separately
  };
}

export function dbToUIQuestion(dbQuestion: DBQuestion): QuizQuestion {
  // Convert DB type to UI type
  const typeMap: Record<DBQuestionType, QuestionType> = {
    'MULTIPLE_CHOICE': 'multiple-choice',
    'TRUE_FALSE': 'true-false',
    'SHORT_ANSWER': 'short-answer',
  };
  
  // Handle MSQ (multiple select questions)
  let questionType: QuestionType = typeMap[dbQuestion.type] || 'multiple-choice';
  let correctAnswers: string[] | undefined;
  
  // If it's a multiple select question, check correctAnswers JSON field
  if (dbQuestion.correctAnswers) {
    try {
      // Handle both stringified JSON and direct array
      const parsed = typeof dbQuestion.correctAnswers === 'string' 
        ? JSON.parse(dbQuestion.correctAnswers)
        : dbQuestion.correctAnswers;
      
      if (Array.isArray(parsed) && parsed.length > 1) {
        questionType = 'msq';
        correctAnswers = parsed;
      }
    } catch (error) {
      console.error('Error parsing correctAnswers:', error);
    }
  }
  
  return {
    id: dbQuestion.id,
    quizId: dbQuestion.quizId,
    question: dbQuestion.question,
    type: questionType,
    options: dbQuestion.options,
    correctAnswer: dbQuestion.correctAnswer || undefined,
    correctAnswers: correctAnswers,
    marks: dbQuestion.marks,
    explanation: dbQuestion.explanation || undefined,
    order: dbQuestion.order,
    createdAt: dbQuestion.createdAt,
  };
}

// Convert UI types to database types
export function uiToDBQuiz(uiQuiz: Quiz): Omit<DBQuiz, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    title: uiQuiz.title,
    description: uiQuiz.description || null,
    practicalId: Number(uiQuiz.practicalId),
    totalMarks: uiQuiz.totalMarks,
    passingMarks: uiQuiz.passingMarks,
    timeLimit: uiQuiz.timeLimit || null,
    status: uiQuiz.status || 'DRAFT',
    teacherId: uiQuiz.teacherId || 1, // Default or get from context
  };
}

export function uiToDBQuestion(uiQuestion: QuizQuestion): Omit<DBQuestion, 'id' | 'createdAt'> {
  // Convert UI type to DB type
  const typeMap: Record<QuestionType, DBQuestionType> = {
    'multiple-choice': 'MULTIPLE_CHOICE',
    'true-false': 'TRUE_FALSE',
    'short-answer': 'SHORT_ANSWER',
    'msq': 'MULTIPLE_CHOICE', // MSQ is stored as MULTIPLE_CHOICE with correctAnswers array
  };
  
  const dbType = typeMap[uiQuestion.type] || 'MULTIPLE_CHOICE';
  
  // Handle correct answers
  let correctAnswer: string | null = null;
  let correctAnswers: any = null;
  
  if (uiQuestion.type === 'msq' && uiQuestion.correctAnswers && uiQuestion.correctAnswers.length > 0) {
    // For MSQ, store in correctAnswers JSON field
    correctAnswers = uiQuestion.correctAnswers;
  } else if (uiQuestion.correctAnswer) {
    // For single answer questions
    correctAnswer = uiQuestion.correctAnswer;
  } else if (uiQuestion.correctAnswers && uiQuestion.correctAnswers.length === 1) {
    // If only one correct answer in array, store as single
    correctAnswer = uiQuestion.correctAnswers[0];
  }
  
  return {
    quizId: Number(uiQuestion.quizId),
    question: uiQuestion.question,
    type: dbType,
    options: uiQuestion.options || [],
    correctAnswer: correctAnswer,
    correctAnswers: correctAnswers,
    marks: uiQuestion.marks,
    explanation: uiQuestion.explanation || null,
    order: uiQuestion.order || 0,
  };
}

// Type conversion helpers
export function convertUIToDBQuestionType(uiType: QuestionType): DBQuestionType {
  const typeMap: Record<QuestionType, DBQuestionType> = {
    'multiple-choice': 'MULTIPLE_CHOICE',
    'true-false': 'TRUE_FALSE',
    'short-answer': 'SHORT_ANSWER',
    'msq': 'MULTIPLE_CHOICE',
  };
  return typeMap[uiType] || 'MULTIPLE_CHOICE';
}

export function convertDBToUIQuestionType(dbType: DBQuestionType): QuestionType {
  const typeMap: Record<DBQuestionType, QuestionType> = {
    'MULTIPLE_CHOICE': 'multiple-choice',
    'TRUE_FALSE': 'true-false',
    'SHORT_ANSWER': 'short-answer',
  };
  return typeMap[dbType] || 'multiple-choice';
}

// Helper to check if a question has multiple correct answers
export function hasMultipleCorrectAnswers(question: QuizQuestion | DBQuestion): boolean {
  if ('correctAnswers' in question && question.correctAnswers) {
    if (Array.isArray(question.correctAnswers) && question.correctAnswers.length > 1) {
      return true;
    }
  }
  
  // For DBQuestion, check the correctAnswers JSON field
  if ('correctAnswers' in question && question.correctAnswers) {
    try {
      const parsed = typeof question.correctAnswers === 'string'
        ? JSON.parse(question.correctAnswers)
        : question.correctAnswers;
      return Array.isArray(parsed) && parsed.length > 1;
    } catch {
      return false;
    }
  }
  
  return false;
}

// Safe boolean check helper
export function getIsCorrect(quizAnswer: QuizAnswer): boolean {
  // Return false if undefined, otherwise return the boolean value
  return quizAnswer.isCorrect === undefined ? false : quizAnswer.isCorrect;
}