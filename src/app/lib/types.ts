export type UserRole = 'student' | 'teacher' | 'lab-assistant' | 'principal' | 'admin';

export interface User {
  name: string;
  role: UserRole;
  email: string;
  id: string;
}




export interface Quiz {
  id: string;
  practicalId: string;
  title: string;
  description: string;
  totalMarks: number;
  passingMarks: number;
  timeLimit?: number;
  questions: QuizQuestion[];
  isPublished: boolean;
  createdAt: Date;
  createdBy: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  studentName: string;
  answers: {
    questionId: string;
    answer: string | string[];
    isCorrect: boolean;
    marksObtained: number;
  }[];
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  passed: boolean;
  startedAt: Date;
  completedAt: Date;
  status: 'in-progress' | 'completed' | 'submitted';
}

// Practical types
export interface Practical {
  id: string;
  title: string;
  grade: string;
  subject: 'Physics' | 'Chemistry' | 'Biology' | 'Science';
  videoUrl: string;
  labSheetUrl: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  thumbnail: string;
  quizzes?: Quiz[];
}

export type QuestionType = 'multiple-choice' | 'msq' | 'true-false' | 'short-answer';

export interface QuizQuestion {
  id: string;
  question: string;
  type: QuestionType;
  options?: string[]; // Only for multiple-choice and msq
  correctAnswer: string | string[]; // string for single, string[] for msq
  marks: number;
  explanation?: string;
}