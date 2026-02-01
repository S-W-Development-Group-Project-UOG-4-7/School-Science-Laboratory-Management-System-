export type UserRole = 'student' | 'teacher' | 'lab-assistant' | 'principal' | 'admin';

// Define available privileges in the system
export type Privilege = 
  | 'view_reports'
  | 'manage_equipment'
  | 'manage_bookings'
  | 'manage_users'
  | 'manage_inventory'
  | 'approve_requests'
  | 'view_analytics'
  | 'manage_settings'
  | 'export_data'
  | 'manage_labs';

export interface User {
  name: string;
  role: UserRole;
  email: string;
  id: string;

  // Two-Factor Authentication fields
  twoFactorEnabled: boolean;
  twoFactorSecret?: string | null;
  twoFactorBackupCodes?: string[];

  // Custom privileges (favoritism)
  customPrivileges?: Privilege[]; // Additional privileges granted
  revokedPrivileges?: Privilege[]; // Privileges removed from role defaults
}

// Default privileges for each role
export const DEFAULT_ROLE_PRIVILEGES: Record<UserRole, Privilege[]> = {
  'student': [
    'view_reports',
    'manage_bookings'
  ],
  'teacher': [
    'view_reports',
    'manage_bookings',
    'manage_equipment',
    'approve_requests',
    'view_analytics'
  ],
  'lab-assistant': [
    'view_reports',
    'manage_equipment',
    'manage_bookings',
    'manage_inventory',
    'manage_labs'
  ],
  'principal': [
    'view_reports',
    'manage_equipment',
    'manage_bookings',
    'approve_requests',
    'view_analytics',
    'export_data',
    'manage_labs'
  ],
  'admin': [
    'view_reports',
    'manage_equipment',
    'manage_bookings',
    'manage_users',
    'manage_inventory',
    'approve_requests',
    'view_analytics',
    'manage_settings',
    'export_data',
    'manage_labs'
  ]
};

// Get effective privileges for a user (role defaults + custom - revoked)
export function getUserPrivileges(user: User): Privilege[] {
  const rolePrivileges = DEFAULT_ROLE_PRIVILEGES[user.role] || [];
  const customPrivileges = user.customPrivileges || [];
  const revokedPrivileges = user.revokedPrivileges || [];

  // Combine role privileges and custom privileges, then remove revoked ones
  const allPrivileges = [...new Set([...rolePrivileges, ...customPrivileges])];
  return allPrivileges.filter(p => !revokedPrivileges.includes(p));
}

// Check if user has a specific privilege
export function hasPrivilege(user: User, privilege: Privilege): boolean {
  const userPrivileges = getUserPrivileges(user);
  return userPrivileges.includes(privilege);
}

// Privilege metadata for UI display
export const PRIVILEGE_METADATA: Record<Privilege, { label: string; description: string; category: string }> = {
  'view_reports': {
    label: 'View Reports',
    description: 'Access and view system reports',
    category: 'Reports'
  },
  'manage_equipment': {
    label: 'Manage Equipment',
    description: 'Add, edit, and remove equipment',
    category: 'Equipment'
  },
  'manage_bookings': {
    label: 'Manage Bookings',
    description: 'Create and manage lab bookings',
    category: 'Bookings'
  },
  'manage_users': {
    label: 'Manage Users',
    description: 'Create, edit, and delete user accounts',
    category: 'Administration'
  },
  'manage_inventory': {
    label: 'Manage Inventory',
    description: 'Track and manage inventory items',
    category: 'Inventory'
  },
  'approve_requests': {
    label: 'Approve Requests',
    description: 'Approve or reject user requests',
    category: 'Requests'
  },
  'view_analytics': {
    label: 'View Analytics',
    description: 'Access analytics and insights',
    category: 'Analytics'
  },
  'manage_settings': {
    label: 'Manage Settings',
    description: 'Configure system settings',
    category: 'Administration'
  },
  'export_data': {
    label: 'Export Data',
    description: 'Export data to external formats',
    category: 'Data'
  },
  'manage_labs': {
    label: 'Manage Labs',
    description: 'Create and configure laboratory spaces',
    category: 'Labs'
  }
};
export interface InventoryItem {
  id: string;
  name: string;
  category: 'Glassware' | 'Equipment' | 'Chemicals' | 'Safety Materials' | 'Instruments';

  quantity: number;
  unit: string;

  packageSize?: number | null;
  packageUnit?: string | null;

  minStockLevel: number;
  location: string;
  
  photo: string;
  storageInstructions: string;
  handlingProcedure: string;
  safetyNotes: string;
  lastUpdated: string;
}


// ========== ENUMS ==========
export enum EquipmentCategory {
  GLASSWARE = 'GLASSWARE',
  INSTRUMENTS = 'INSTRUMENTS',
  CHEMICALS = 'CHEMICALS',
  SAFETY = 'SAFETY',
  ELECTRONICS = 'ELECTRONICS',
  BIOLOGY = 'BIOLOGY',
  OTHER = 'OTHER'
}

export enum RequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum ScheduleStatus {
  UPCOMING = 'UPCOMING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum QuizAttemptStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ABANDONED = 'ABANDONED'
}

export enum Role {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  LAB_ASSISTANT = 'LAB_ASSISTANT',
  PRINCIPAL = 'PRINCIPAL',
  ADMIN = 'ADMIN'
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TRUE_FALSE = 'TRUE_FALSE',
  SHORT_ANSWER = 'SHORT_ANSWER',
  MSQ = 'MSQ'
}

export enum QuizStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED'
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  teacher?: Teacher;
  labAssistant?: LabAssistant;
}

// ========== TEACHER & LAB ASSISTANT ==========
export interface Teacher {
  id: number;
  userId: number;
  subject?: string;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  practicals?: Practical[];
  schedules?: Schedule[];
  practicalSchedules?: PracticalSchedule[];
  quizzes?: Quiz[];
  equipmentRequests?: EquipmentRequest[];
}

export interface LabAssistant {
  id: number;
  userId: number;
  email?: string;
  availability: string[];
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  equipmentRequests?: EquipmentRequest[];
}

// ========== SCHEDULE RELATED TYPES ==========
export type SubjectType = 'Physics' | 'Chemistry' | 'Biology' | 'Science';
export type DayType = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
export type StepType = 'schedule' | 'equipment';

export interface PracticalSchedule {
  id: number;
  title: string;
  date: string; // ISO string from frontend
  period: string;
  grade: string;
  className: string;
  fullClassName: string;
  subject: SubjectType;
  teacherId: number;
  teacherName: string;
  location: string;
  notes?: string;
  status: ScheduleStatus;
  attachments: PracticalScheduleAttachment[];
  createdAt: string;
  updatedAt: string;
  teacher?: Teacher;
  equipmentRequests?: EquipmentRequest[];
}

export interface PracticalScheduleAttachment {
  id: number;
  practicalScheduleId: number;
  fileName: string;
  fileUrl: string;
  fileType?: string;
  fileSize?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Schedule {
  id: number;
  title: string;
  date: string; // ISO string
  time: string;
  duration: string;
  grade: string;
  classSection: string;
  subject: string;
  location: string;
  notes?: string;
  maxStudents: number;
  status: ScheduleStatus;
  studentRequirements?: string;
  daySchedule?: string;
  teacherId: number;
  createdAt: string;
  updatedAt: string;
  teacher?: Teacher;
  attachments?: ScheduleAttachment[];
}

export interface ScheduleAttachment {
  id: number;
  scheduleId: number;
  fileName: string;
  fileUrl: string;
  fileType?: string;
  fileSize?: number;
  createdAt: string;
  updatedAt: string;
}

// ========== EQUIPMENT RELATED TYPES ==========
export interface EquipmentItem {
  id: number;
  name: string;
  quantity: number;
  category: EquipmentCategory;
  equipmentRequestId?: number;
  createdAt?: Date;
}

export interface EquipmentRequest {
  id: number;
  teacherId: number;
  labAssistantId: number;
  practicalScheduleId?: number;
  className: string;
  grade: string;
  subject: string;
  practicalDate: string; // ISO string
  practicalTime: string;
  additionalNotes?: string;
  status: RequestStatus;
  responseNote?: string;
  responseDate?: string;
  createdAt: string;
  updatedAt: string;
  teacher: {
    id: number;
    userId: number;
    user: {
      id: number;
      name: string;
      email: string;
      role: string;
    };
  };
  labAssistant: {
    id: number;
    userId: number;
    user: {
      id: number;
      name: string;
      email: string;
      role: string;
    };
  };
  equipmentItems: EquipmentItem[];
  practicalSchedule?: PracticalSchedule;
}

// ========== PRACTICAL & QUIZ TYPES ==========
export interface Practical {
  id: number;
  title: string;
  description?: string;
  subject: string;
  grade: string;
  duration: string;
  videoUrl?: string;
  labSheetUrl?: string;
  thumbnail?: string;
  createdAt: Date;
  updatedAt: Date;
  teacherId: number;
  teacher?: Teacher;
  quizzes?: Quiz[];
  studentProgress?: StudentProgress[];
}

export interface Quiz {
  id: number;
  title: string;
  description?: string;
  practicalId: number;
  totalMarks: number;
  passingMarks: number;
  timeLimit?: number;
  status: QuizStatus;
  createdAt: Date;
  updatedAt: Date;
  teacherId: number;
  practical?: Practical;
  teacher?: Teacher;
  questions?: Question[];
  quizAttempts?: QuizAttempt[];
  isPublished?: boolean;
  createdBy?: string;
}

export interface Question {
  id: number;
  quizId: number;
  question: string;
  type: QuestionType;
  options: string[];
  correctAnswer?: string;
  correctAnswers?: any;
  marks: number;
  explanation?: string;
  order: number;
  createdAt: Date;
  quiz?: Quiz;
}

export interface QuizAttempt {
  id: number;
  quizId: number;
  studentId: number;
  studentName: string;
  answers: any;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  passed: boolean;
  status: QuizAttemptStatus;
  startedAt: Date;
  completedAt?: Date;
  quiz?: Quiz;
  student?: User;
}

export interface QuizAnswer {
  questionId: number;
  answer?: string;
  selectedOptions?: string[];
  isCorrect?: boolean;
  marksObtained?: number;
  feedback?: string;
}

// ========== FILE UPLOAD & PROGRESS ==========
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
  entityId?: number;
  createdAt: Date;
  uploader?: User;
}

export interface StudentProgress {
  id: number;
  studentId: number;
  practicalId: number;
  watched: boolean;
  completed: boolean;
  watchTime?: number;
  lastWatched?: Date;
  createdAt: Date;
  updatedAt: Date;
  student?: User;
  practical?: Practical;
}

// ========== FORM INPUT TYPES ==========
export interface CreatePracticalInput {
  title: string;
  description?: string;
  subject: string;
  grade: string;
  duration: string;
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
  videoUrl?: string;
  labSheetUrl?: string;
  thumbnail?: string;
}

export interface CreateQuizInput {
  title: string;
  description?: string;
  practicalId: number;
  teacherId: number;
  totalMarks?: number;
  passingMarks?: number;
  timeLimit?: number;
  status?: QuizStatus;
  questions?: CreateQuestionInput[];
}

export interface UpdateQuizInput {
  title?: string;
  description?: string;
  totalMarks?: number;
  passingMarks?: number;
  timeLimit?: number;
  status?: QuizStatus;
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
  correctAnswer?: string;
  correctAnswers?: any;
  marks?: number;
  explanation?: string;
  order?: number;
}

export interface QuizQuestionFormData {
  id?: string;
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
  description?: string;
  practicalId: number;
  totalMarks: number;
  passingMarks: number;
  timeLimit?: number;
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
  status: QuizAttemptStatus;
}

export interface CreateScheduleData {
  title: string;
  date: string;
  time: string;
  duration: string;
  grade: string;
  subject: SubjectType;
  location: string;
  notes?: string;
  studentRequirements?: string;
  daySchedule?: string;
  maxStudents: number;
  status?: ScheduleStatus;
  teacherId: number;
}

export interface UpdateScheduleData extends Partial<CreateScheduleData> {}

export interface CreatePracticalScheduleData {
  title: string;
  date: string;
  period: string;
  grade: string;
  className: string;
  fullClassName: string;
  subject: SubjectType;
  teacherId: number;
  teacherName: string;
  location: string;
  notes?: string;
  status?: ScheduleStatus;
}

export interface UpdatePracticalScheduleData extends Partial<CreatePracticalScheduleData> {
  status?: ScheduleStatus;
}

export interface CreateEquipmentRequestData {
  teacherId: number;
  labAssistantId: number;
  practicalScheduleId?: number;
  className: string;
  grade: string;
  subject: string;
  practicalDate: string;
  practicalTime: string;
  additionalNotes?: string;
  status?: RequestStatus;
  equipmentItems: {
    name: string;
    quantity: number;
    category: EquipmentCategory;
  }[];
}

export interface UpdateEquipmentRequestData {
  status?: RequestStatus;
  responseNote?: string;
  responseDate?: string;
}

// ========== UI HELPER TYPES ==========
export interface GradeConfig {
  grades: string[];
  classSections: Record<string, string[]>;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface PeriodTime {
  start: string;
  end: string;
  label: string;
}

// ========== API RESPONSE TYPES ==========
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

// ========== DASHBOARD STATS ==========
export interface DashboardStats {
  totalPracticals: number;
  totalQuizzes: number;
  totalStudents: number;
  completedQuizzes: number;
  averageScore: number;
  recentActivity: Array<{
    id: number;
    type: 'quiz' | 'practical' | 'progress' | 'schedule' | 'equipment';
    title: string;
    description: string;
    timestamp: Date;
  }>;
}

// ========== HELPER FUNCTIONS ==========
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

export function formatQuizDuration(minutes?: number): string {
  if (!minutes) return 'No time limit';
  if (minutes < 60) return `${minutes} minutes`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 
    ? `${hours}h ${remainingMinutes}m` 
    : `${hours} hour${hours > 1 ? 's' : ''}`;
}



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

// ========== CONSTANTS ==========
export const GRADE_CONFIG: Record<SubjectType, GradeConfig> = {
  'Science': {
    grades: ['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9'],
    classSections: {
      'Grade 6': ['A', 'B', 'C', 'D', 'E'],
      'Grade 7': ['A', 'B', 'C', 'D', 'E'],
      'Grade 8': ['A', 'B', 'C', 'D', 'E'],
      'Grade 9': ['A', 'B', 'C', 'D', 'E']
    }
  },
  'Physics': {
    grades: ['Grade 10', 'Grade 11'],
    classSections: {
      'Grade 10': ['A', 'B', 'C', 'D', 'E'],
      'Grade 11': ['A', 'B', 'C', 'D', 'E']
    }
  },
  'Chemistry': {
    grades: ['Grade 10', 'Grade 11'],
    classSections: {
      'Grade 10': ['A', 'B', 'C', 'D', 'E'],
      'Grade 11': ['A', 'B', 'C', 'D', 'E']
    }
  },
  'Biology': {
    grades: ['Grade 10', 'Grade 11'],
    classSections: {
      'Grade 10': ['A', 'B', 'C', 'D', 'E'],
      'Grade 11': ['A', 'B', 'C', 'D', 'E']
    }
  }
};

export const PERIOD_TIMES: Record<string, PeriodTime> = {
  '1': { start: '08:00', end: '08:40', label: 'Morning' },
  '2': { start: '08:45', end: '09:25', label: 'Morning' },
  '3': { start: '09:30', end: '10:10', label: 'Morning' },
  '4': { start: '10:15', end: '10:55', label: 'Morning' },
  '5': { start: '11:00', end: '11:40', label: 'Late Morning' },
  '6': { start: '11:45', end: '12:25', label: 'Noon' },
  '7': { start: '12:30', end: '13:10', label: 'Afternoon' },
  '8': { start: '13:15', end: '13:55', label: 'Afternoon' },
};

// Form state types
export interface FormState {
  isSubmitting: boolean;
  isSuccess: boolean;
  isError: boolean;
  error?: string;
  successMessage?: string;
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

// ========== FILTER TYPES ==========
export interface PracticalFilters {
  search?: string;
  subject?: string;
  grade?: string;
  teacherId?: number;
}

export interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  role: string;
  teacherId?: number;
  labAssistantId?: number;
}

export interface AuthSession {
  user: SessionUser;
  expires: string;
}
