'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Plus, Clock, Users, FileText, AlertCircle, Trash2, Edit, Download, Upload, X, 
  CheckCircle, XCircle, Calendar as CalendarIcon, Check, Ban, ArrowLeft, ArrowRight,
  PackagePlus, Send, Mail, FlaskConical, Beaker, Filter, Eye, EyeOff, Loader2,
  UserCircle, Building, CalendarDays, BookOpen, School, MapPin, ClipboardList,
  ChevronRight, Search, Zap, Layers, MoreVertical, CalendarCheck, CalendarX,
  CheckSquare, Package, PackageCheck, PackageX, PackageSearch
} from 'lucide-react';
import type { UserRole } from '@/lib/types';

interface SchedulePageProps {
  userRole: UserRole;
  currentTeacher?: string;
  userId?: string;
  userName?: string;
}

interface ScheduledPractical {
  id: string;
  title: string;
  date: string;
  period: string;
  grade: string;
  className: string;
  fullClassName: string;
  subject: 'Physics' | 'Chemistry' | 'Biology' | 'Science';
  teacher: string;
  location: string;
  notes?: string;
  attachments?: string[];
  status: 'upcoming' | 'completed' | 'cancelled';
}

interface GradeConfig {
  grades: string[];
  classSections: Record<string, string[]>;
}

type SubjectType = 'Physics' | 'Chemistry' | 'Biology' | 'Science';

const GRADE_CONFIG: Record<SubjectType, GradeConfig> = {
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

// Period to Time Mapping
const PERIOD_TIMES: Record<string, { start: string; end: string; label: string }> = {
  '1': { start: '08:00', end: '08:40', label: 'Morning' },
  '2': { start: '08:45', end: '09:25', label: 'Morning' },
  '3': { start: '09:30', end: '10:10', label: 'Morning' },
  '4': { start: '10:15', end: '10:55', label: 'Morning' },
  '5': { start: '11:00', end: '11:40', label: 'Late Morning' },
  '6': { start: '11:45', end: '12:25', label: 'Noon' },
  '7': { start: '12:30', end: '13:10', label: 'Afternoon' },
  '8': { start: '13:15', end: '13:55', label: 'Afternoon' },
};

// Equipment Request Types
enum RequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  PREPARED = 'PREPARED',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED'
}

enum EquipmentCategory {
  GLASSWARE = 'GLASSWARE',
  INSTRUMENTS = 'INSTRUMENTS',
  CHEMICALS = 'CHEMICALS',
  SAFETY = 'SAFETY',
  ELECTRONICS = 'ELECTRONICS',
  BIOLOGY = 'BIOLOGY',
  OTHER = 'OTHER'
}

interface EquipmentItem {
  id?: number;
  name: string;
  quantity: number;
  category: EquipmentCategory;
}

interface EquipmentRequestData {
  id: number;
  teacherId: number;
  labAssistantId: number;
  className: string;
  grade: string;
  subject: string;
  practicalDate: string;
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
}

interface LabAssistantData {
  id: number;
  userId: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  availability: string[];
}

// Common equipment items categorized by subject
const commonEquipmentItems = [
  // Chemistry Equipment
  { id: 1, name: 'Beakers (250ml)', category: EquipmentCategory.GLASSWARE, subject: 'Chemistry' },
  { id: 2, name: 'Test Tubes', category: EquipmentCategory.GLASSWARE, subject: 'Chemistry' },
  { id: 3, name: 'Bunsen Burner', category: EquipmentCategory.INSTRUMENTS, subject: 'Chemistry' },
  { id: 4, name: 'Safety Goggles', category: EquipmentCategory.SAFETY, subject: 'Chemistry' },
  { id: 5, name: 'Lab Coats', category: EquipmentCategory.SAFETY, subject: 'Chemistry' },
  { id: 6, name: 'Graduated Cylinders (100ml)', category: EquipmentCategory.GLASSWARE, subject: 'Chemistry' },
  { id: 7, name: 'Pipettes', category: EquipmentCategory.GLASSWARE, subject: 'Chemistry' },
  { id: 8, name: 'pH Meter', category: EquipmentCategory.ELECTRONICS, subject: 'Chemistry' },
  { id: 9, name: 'Digital Balance', category: EquipmentCategory.ELECTRONICS, subject: 'Chemistry' },
  { id: 10, name: 'Thermometer', category: EquipmentCategory.INSTRUMENTS, subject: 'Chemistry' },
  
  // Biology Equipment
  { id: 11, name: 'Microscope', category: EquipmentCategory.INSTRUMENTS, subject: 'Biology' },
  { id: 12, name: 'Glass Slides', category: EquipmentCategory.GLASSWARE, subject: 'Biology' },
  { id: 13, name: 'Petri Dishes', category: EquipmentCategory.GLASSWARE, subject: 'Biology' },
  { id: 14, name: 'Forceps', category: EquipmentCategory.INSTRUMENTS, subject: 'Biology' },
  { id: 15, name: 'Scalpel', category: EquipmentCategory.INSTRUMENTS, subject: 'Biology' },
  { id: 16, name: 'Magnifying Glass', category: EquipmentCategory.INSTRUMENTS, subject: 'Biology' },
  { id: 17, name: 'Test Tube Rack', category: EquipmentCategory.GLASSWARE, subject: 'Biology' },
  { id: 18, name: 'Specimen Containers', category: EquipmentCategory.BIOLOGY, subject: 'Biology' },
  
  // Physics Equipment
  { id: 19, name: 'Pendulum Set', category: EquipmentCategory.INSTRUMENTS, subject: 'Physics' },
  { id: 20, name: 'Circuit Board', category: EquipmentCategory.ELECTRONICS, subject: 'Physics' },
  { id: 21, name: 'Multimeter', category: EquipmentCategory.ELECTRONICS, subject: 'Physics' },
  { id: 22, name: 'Spring Balance', category: EquipmentCategory.INSTRUMENTS, subject: 'Physics' },
  { id: 23, name: 'Magnet Set', category: EquipmentCategory.INSTRUMENTS, subject: 'Physics' },
  { id: 24, name: 'Optics Kit', category: EquipmentCategory.INSTRUMENTS, subject: 'Physics' },
  
  // General Science Equipment
  { id: 25, name: 'Droppers', category: EquipmentCategory.GLASSWARE, subject: 'Science' },
  { id: 26, name: 'Wash Bottle', category: EquipmentCategory.GLASSWARE, subject: 'Science' },
  { id: 27, name: 'Filter Paper', category: EquipmentCategory.OTHER, subject: 'Science' },
  { id: 28, name: 'Measuring Cylinders', category: EquipmentCategory.GLASSWARE, subject: 'Science' },
  { id: 29, name: 'Stopwatch', category: EquipmentCategory.INSTRUMENTS, subject: 'Science' },
  { id: 30, name: 'Ruler Set', category: EquipmentCategory.INSTRUMENTS, subject: 'Science' },
];

const TIMETABLE = {
  'Monday': {
    '1': '9B',
    '2': '10C',
    '3': '7E',
    '4': '11D',
    '5': '6B',
    '6': '9D',
    '7': '10A',
    '8': '10A'
  },
  'Tuesday': {
    '1': '8B',
    '2': '11C',
    '3': '10E',
    '4': '10D',
    '5': '6D',
    '6': '7D',
    '7': '11D',
    '8': '9C'
  },
  'Wednesday': {
    '1': '8A',
    '2': '11B',
    '3': '10E',
    '4': '9A',
    '5': '11A',
    '6': '11A',
    '7': '7A',
    '8': '8E'
  },
  'Thursday': {
    '1': '9E',
    '2': '11C',
    '3': '8D',
    '4': '10D',
    '5': '6A',
    '6': '8C',
    '7': '11E',
    '8': '11E'
  },
  'Friday': {
    '1': '7C',
    '2': '10C',
    '3': '11B',
    '4': '7B',
    '5': '6E',
    '6': '6C',
    '7': '10B',
    '8': '10B'
  }
};

type DayType = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

const initialPracticals: ScheduledPractical[] = [
  {
    id: '1',
    title: 'Acid-Base Titration',
    date: '2025-11-13',
    period: '5',
    grade: 'Grade 11',
    className: 'A',
    fullClassName: 'Grade 11 - A',
    subject: 'Chemistry',
    teacher: 'Teacher',
    location: 'Primary Lab',
    notes: 'Students must bring their lab coats and safety goggles.',
    attachments: ['titration_procedure.pdf', 'safety_guidelines.pdf'],
    status: 'upcoming',
  },
  {
    id: '2',
    title: 'Microscope Practical',
    date: '2025-11-14',
    period: '3',
    grade: 'Grade 10',
    className: 'E',
    fullClassName: 'Grade 10 - E',
    subject: 'Biology',
    teacher: 'Teacher',
    location: 'Primary Lab',
    notes: 'Introduction to compound microscope usage.',
    attachments: ['microscope_guide.pdf'],
    status: 'upcoming',
  },
  {
    id: '3',
    title: 'Simple Pendulum Experiment',
    date: '2025-11-15',
    period: '7',
    grade: 'Grade 11',
    className: 'B',
    fullClassName: 'Grade 11 - B',
    subject: 'Physics',
    teacher: 'Teacher',
    location: 'Primary Lab',
    notes: 'Study of simple harmonic motion.',
    attachments: ['pendulum_theory.pdf'],
    status: 'upcoming',
  },
  {
    id: '4',
    title: 'Basic Circuits',
    date: '2025-11-16',
    period: '2',
    grade: 'Grade 9',
    className: 'A',
    fullClassName: 'Grade 9 - A',
    subject: 'Science',
    teacher: 'Teacher',
    location: 'Primary Lab',
    notes: 'Introduction to basic electrical circuits.',
    attachments: ['circuit_basics.pdf'],
    status: 'upcoming',
  },
];

// Mock equipment requests data
const mockEquipmentRequests: EquipmentRequestData[] = [
  {
    id: 1,
    teacherId: 1,
    labAssistantId: 1,
    className: "6-A",
    grade: "Grade 6",
    subject: "Science",
    practicalDate: "2026-01-23",
    practicalTime: "10.00 a.m.",
    additionalNotes: "none",
    status: RequestStatus.PENDING,
    createdAt: "2026-01-20T10:00:00Z",
    updatedAt: "2026-01-20T10:00:00Z",
    teacher: {
      id: 1,
      userId: 1,
      user: {
        id: 1,
        name: "Mrs. Fernando",
        email: "fernando@school.edu",
        role: "teacher"
      }
    },
    labAssistant: {
      id: 1,
      userId: 2,
      user: {
        id: 2,
        name: "Kamal Perera",
        email: "kamal@school.edu",
        role: "lab-assistant"
      }
    },
    equipmentItems: [
      {
        name: "Test Tubes",
        quantity: 15,
        category: EquipmentCategory.GLASSWARE
      }
    ]
  },
  {
    id: 2,
    teacherId: 1,
    labAssistantId: 1,
    className: "11-C",
    grade: "Grade 11",
    subject: "Science",
    practicalDate: "2026-01-16",
    practicalTime: "10.00 a.m.",
    additionalNotes: "",
    status: RequestStatus.PENDING,
    createdAt: "2026-01-15T10:00:00Z",
    updatedAt: "2026-01-15T10:00:00Z",
    teacher: {
      id: 1,
      userId: 1,
      user: {
        id: 1,
        name: "Mrs. Fernando",
        email: "fernando@school.edu",
        role: "teacher"
      }
    },
    labAssistant: {
      id: 1,
      userId: 2,
      user: {
        id: 2,
        name: "Kamal Perera",
        email: "kamal@school.edu",
        role: "lab-assistant"
      }
    },
    equipmentItems: [
      {
        name: "Digital Balance",
        quantity: 1,
        category: EquipmentCategory.ELECTRONICS
      },
      {
        name: "Safety Goggles",
        quantity: 1,
        category: EquipmentCategory.SAFETY
      }
    ]
  },
  {
    id: 3,
    teacherId: 1,
    labAssistantId: 1,
    className: "10-A",
    grade: "Grade 10",
    subject: "Chemistry",
    practicalDate: "2026-01-25",
    practicalTime: "2.00 p.m.",
    additionalNotes: "Handle with care",
    status: RequestStatus.APPROVED,
    createdAt: "2026-01-22T14:00:00Z",
    updatedAt: "2026-01-22T16:30:00Z",
    teacher: {
      id: 1,
      userId: 1,
      user: {
        id: 1,
        name: "Mrs. Fernando",
        email: "fernando@school.edu",
        role: "teacher"
      }
    },
    labAssistant: {
      id: 1,
      userId: 2,
      user: {
        id: 2,
        name: "Kamal Perera",
        email: "kamal@school.edu",
        role: "lab-assistant"
      }
    },
    equipmentItems: [
      {
        name: "Beakers (250ml)",
        quantity: 20,
        category: EquipmentCategory.GLASSWARE
      },
      {
        name: "Bunsen Burner",
        quantity: 10,
        category: EquipmentCategory.INSTRUMENTS
      }
    ]
  }
];

type StepType = 'schedule' | 'equipment';

export function SchedulePage({ userRole, currentTeacher = "Teacher", userId, userName }: SchedulePageProps) {
  // Schedule State
  const [selectedDay, setSelectedDay] = useState<DayType | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [practicals, setPracticals] = useState<ScheduledPractical[]>(initialPracticals);
  const [selectedPractical, setSelectedPractical] = useState<ScheduledPractical | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Multi-step form state
  const [currentStep, setCurrentStep] = useState<StepType>('schedule');
  const [formData, setFormData] = useState({
    // Schedule step
    title: '',
    date: '',
    period: '',
    grade: '',
    className: 'A',
    fullClassName: '',
    subject: 'Science' as SubjectType,
    teacher: currentTeacher,
    location: 'Primary Lab',
    notes: '',
    status: 'upcoming' as 'upcoming' | 'completed' | 'cancelled',
    attachments: [] as File[],
    
    // Equipment step
    labAssistantId: '',
    equipmentItems: [] as EquipmentItem[],
    additionalNotes: '',
    practicalTime: '',
  });

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    id: '',
    title: '',
    date: '',
    period: '',
    grade: '',
    className: 'A',
    fullClassName: '',
    subject: 'Science' as SubjectType,
    teacher: currentTeacher,
    location: 'Primary Lab',
    notes: '',
    status: 'upcoming' as 'upcoming' | 'completed' | 'cancelled',
  });

  // Equipment request state
  const [labAssistants, setLabAssistants] = useState<LabAssistantData[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [equipmentQuantity, setEquipmentQuantity] = useState(1);
  const [isCreatingRequest, setIsCreatingRequest] = useState(false);
  const [requests, setRequests] = useState<EquipmentRequestData[]>(mockEquipmentRequests);
  const [selectedEquipmentCategory, setSelectedEquipmentCategory] = useState<string>('all');
  const [equipmentSearch, setEquipmentSearch] = useState('');
  const [activeRequestTab, setActiveRequestTab] = useState<string>('all');

  const canSchedule = userRole === 'teacher' || userRole === 'lab-assistant' || userRole === 'admin';
  const isTeacher = userRole === 'teacher';

  // Fetch lab assistants on mount
  useEffect(() => {
    fetchLabAssistants();
  }, []);

  const fetchLabAssistants = async () => {
    try {
      const response = await fetch('/api/lab-assistants');
      if (response.ok) {
        const data = await response.json();
        setLabAssistants(data.assistants || []);
      }
    } catch (error) {
      console.error('Error fetching lab assistants:', error);
      // Use mock data if API fails
      setLabAssistants([
        {
          id: 1,
          userId: 2,
          user: {
            id: 2,
            name: "Kamal Perera",
            email: "kamal@school.edu"
          },
          availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
        },
        {
          id: 2,
          userId: 3,
          user: {
            id: 3,
            name: "Saman Kumara",
            email: "saman@school.edu"
          },
          availability: ['Tuesday', 'Wednesday', 'Thursday']
        }
      ]);
    }
  };

  // Helper functions
  const getSubjectOptions = (grade: string): SubjectType[] => {
    if (!grade) return ['Science', 'Physics', 'Chemistry', 'Biology'];
    const gradeNum = parseInt(grade.replace('Grade ', ''));
    if (gradeNum >= 6 && gradeNum <= 9) return ['Science'];
    if (gradeNum >= 10 && gradeNum <= 11) return ['Physics', 'Chemistry', 'Biology'];
    return ['Science'];
  };

  const getGradeOptions = (subject: SubjectType): string[] => {
    return GRADE_CONFIG[subject]?.grades || [];
  };

  const getClassOptions = (subject: SubjectType, grade: string): string[] => {
    if (!grade || !subject) return [];
    return GRADE_CONFIG[subject]?.classSections[grade] || [];
  };

  // Get time for period
  const getTimeForPeriod = (period: string): string => {
    const timeSlot = PERIOD_TIMES[period];
    if (timeSlot) {
      return `${timeSlot.start} - ${timeSlot.end}`;
    }
    return '';
  };

  const addToast = (message: string, type: ToastType = 'info') => {
    const id = Date.now().toString();
    const newToast = { id, message, type };
    setToasts(prev => [...prev, newToast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  };

  const getSubjectColor = (subject: string) => {
    switch (subject) {
      case 'Chemistry': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Physics': return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'Biology': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Science': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getRequestStatusColor = (status: RequestStatus) => {
    switch (status) {
      case RequestStatus.PENDING: return 'bg-yellow-100 text-yellow-800';
      case RequestStatus.APPROVED: return 'bg-blue-100 text-blue-800';
      case RequestStatus.PREPARED: return 'bg-green-100 text-green-800';
      case RequestStatus.COMPLETED: return 'bg-purple-100 text-purple-800';
      case RequestStatus.REJECTED: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRequestStatusIcon = (status: RequestStatus) => {
    switch (status) {
      case RequestStatus.PENDING: return <Clock className="w-4 h-4" />;
      case RequestStatus.APPROVED: return <CheckCircle className="w-4 h-4" />;
      case RequestStatus.PREPARED: return <PackageCheck className="w-4 h-4" />;
      case RequestStatus.COMPLETED: return <CheckSquare className="w-4 h-4" />;
      case RequestStatus.REJECTED: return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  // Handle card click to show details
  const handleCardClick = (practical: ScheduledPractical) => {
    setSelectedPractical(practical);
    setEditFormData({
      id: practical.id,
      title: practical.title,
      date: practical.date,
      period: practical.period,
      grade: practical.grade,
      className: practical.className,
      fullClassName: practical.fullClassName,
      subject: practical.subject,
      teacher: practical.teacher,
      location: practical.location,
      notes: practical.notes || '',
      status: practical.status,
    });
  };

  // Edit handlers
  const handleEditGradeChange = (grade: string) => {
    const subjectOptions = getSubjectOptions(grade);
    const currentSubject = editFormData.subject;
    
    if (!subjectOptions.includes(currentSubject)) {
      const firstClass = GRADE_CONFIG[subjectOptions[0]]?.classSections[grade]?.[0] || 'A';
      setEditFormData(prev => ({
        ...prev,
        grade,
        subject: subjectOptions[0],
        className: firstClass,
        fullClassName: `${grade} - ${firstClass}`,
      }));
    } else {
      const firstClass = GRADE_CONFIG[currentSubject]?.classSections[grade]?.[0] || 'A';
      setEditFormData(prev => ({
        ...prev,
        grade,
        className: firstClass,
        fullClassName: `${grade} - ${firstClass}`,
      }));
    }
  };

  const handleEditSubjectChange = (subject: SubjectType) => {
    const grade = editFormData.grade;
    const firstClass = grade ? (GRADE_CONFIG[subject]?.classSections[grade]?.[0] || 'A') : 'A';
    
    setEditFormData(prev => ({
      ...prev,
      subject,
      className: firstClass,
      fullClassName: grade ? `${grade} - ${firstClass}` : '',
    }));
  };

  const handleEditClassChange = (className: string) => {
    setEditFormData(prev => ({
      ...prev,
      className,
      fullClassName: prev.grade ? `${prev.grade} - ${className}` : ''
    }));
  };

  const handleEdit = () => {
    if (!editFormData.title || !editFormData.date || !editFormData.period || !editFormData.grade || !editFormData.className) {
      addToast('Please fill in all required fields', 'error');
      return;
    }

    setPracticals(prev => prev.map(p => 
      p.id === editFormData.id ? {
        ...p,
        ...editFormData,
        fullClassName: `${editFormData.grade} - ${editFormData.className}`,
      } : p
    ));

    addToast('Schedule updated successfully!', 'success');
    setIsEditDialogOpen(false);
    setSelectedPractical(null);
  };

  const handleCancelSchedule = (practicalId: string) => {
    setPracticals(prev => prev.map(p => 
      p.id === practicalId ? { ...p, status: 'cancelled' } : p
    ));
    addToast('Schedule cancelled successfully!', 'success');
  };

  const handleDeleteSchedule = (practicalId: string) => {
    setPracticals(prev => prev.filter(p => p.id !== practicalId));
    addToast('Schedule deleted successfully!', 'success');
    setSelectedPractical(null);
  };

  const handleCompleteSchedule = (practicalId: string) => {
    setPracticals(prev => prev.map(p => 
      p.id === practicalId ? { ...p, status: 'completed' } : p
    ));
    addToast('Marked as completed!', 'success');
  };

  // Schedule step handlers
  const handleGradeChange = (grade: string) => {
    const subjectOptions = getSubjectOptions(grade);
    const currentSubject = formData.subject;
    
    if (!subjectOptions.includes(currentSubject)) {
      const firstClass = GRADE_CONFIG[subjectOptions[0]]?.classSections[grade]?.[0] || 'A';
      setFormData(prev => ({
        ...prev,
        grade,
        subject: subjectOptions[0],
        className: firstClass,
        fullClassName: `${grade} - ${firstClass}`,
      }));
    } else {
      const firstClass = GRADE_CONFIG[currentSubject]?.classSections[grade]?.[0] || 'A';
      setFormData(prev => ({
        ...prev,
        grade,
        className: firstClass,
        fullClassName: `${grade} - ${firstClass}`,
      }));
    }
  };

  const handleSubjectChange = (subject: SubjectType) => {
    const grade = formData.grade;
    const firstClass = grade ? (GRADE_CONFIG[subject]?.classSections[grade]?.[0] || 'A') : 'A';
    
    setFormData(prev => ({
      ...prev,
      subject,
      className: firstClass,
      fullClassName: grade ? `${grade} - ${firstClass}` : '',
    }));
  };

  const handleClassChange = (className: string) => {
    setFormData(prev => ({
      ...prev,
      className,
      fullClassName: prev.grade ? `${prev.grade} - ${className}` : ''
    }));
  };

  const handlePeriodClick = (day: DayType, period: string) => {
    setSelectedDay(day);
    setSelectedPeriod(period);
    
    const timetableClass = TIMETABLE[day][period as keyof typeof TIMETABLE[typeof day]];
    
    if (timetableClass) {
      const grade = `Grade ${timetableClass.slice(0, -1)}`;
      const className = timetableClass.slice(-1);
      
      const today = new Date();
      const currentDay = today.getDay();
      const daysToAdd = (['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(day) - currentDay + 7) % 7;
      const selectedDate = new Date(today);
      selectedDate.setDate(today.getDate() + daysToAdd);
      const dateString = selectedDate.toISOString().split('T')[0];
      const timeSlot = getTimeForPeriod(period);
      
      setFormData(prev => ({
        ...prev,
        grade,
        className,
        fullClassName: `${grade} - ${className}`,
        date: dateString,
        period,
        subject: grade === 'Grade 9' ? 'Science' : (prev.subject || 'Science'),
        practicalTime: timeSlot // Auto-populate time slot
      }));
    }
    
    setIsDialogOpen(true);
  };

  // Equipment step handlers
  const handleAddEquipment = () => {
    if (!selectedEquipment) {
      addToast('Please select an equipment item', 'error');
      return;
    }

    const equipment = commonEquipmentItems.find(item => item.id.toString() === selectedEquipment);
    if (!equipment) return;

    const existingItemIndex = formData.equipmentItems.findIndex(item => item.name === equipment.name);
    
    if (existingItemIndex > -1) {
      const updatedItems = [...formData.equipmentItems];
      updatedItems[existingItemIndex].quantity += equipmentQuantity;
      setFormData(prev => ({ ...prev, equipmentItems: updatedItems }));
    } else {
      setFormData(prev => ({
        ...prev,
        equipmentItems: [
          ...prev.equipmentItems,
          {
            name: equipment.name,
            quantity: equipmentQuantity,
            category: equipment.category,
          }
        ]
      }));
    }

    setSelectedEquipment('');
    setEquipmentQuantity(1);
  };

  const handleRemoveEquipment = (index: number) => {
    const updatedItems = [...formData.equipmentItems];
    updatedItems.splice(index, 1);
    setFormData(prev => ({ ...prev, equipmentItems: updatedItems }));
  };

  const handleUpdateEquipmentQuantity = (index: number, quantity: number) => {
    const updatedItems = [...formData.equipmentItems];
    updatedItems[index].quantity = quantity;
    setFormData(prev => ({ ...prev, equipmentItems: updatedItems }));
  };

  // Filter equipment by category and search
  const getFilteredEquipmentItems = () => {
    let filtered = commonEquipmentItems;
    
    // Filter by category
    if (selectedEquipmentCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedEquipmentCategory);
    }
    
    // Filter by search term
    if (equipmentSearch) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(equipmentSearch.toLowerCase()) ||
        item.category.toLowerCase().includes(equipmentSearch.toLowerCase()) ||
        item.subject.toLowerCase().includes(equipmentSearch.toLowerCase())
      );
    }
    
    // Filter by selected subject
    if (formData.subject && formData.subject !== 'Science') {
      filtered = filtered.filter(item => 
        item.subject === formData.subject || item.subject === 'Science'
      );
    }
    
    return filtered;
  };

  // Filter equipment requests by status
  const getFilteredRequests = () => {
    if (activeRequestTab === 'all') {
      return requests;
    }
    return requests.filter(request => request.status === activeRequestTab);
  };

  // Get category color
  const getCategoryColor = (category: EquipmentCategory) => {
    switch (category) {
      case EquipmentCategory.GLASSWARE: return 'bg-blue-50 text-blue-700 border-blue-200';
      case EquipmentCategory.INSTRUMENTS: return 'bg-purple-50 text-purple-700 border-purple-200';
      case EquipmentCategory.SAFETY: return 'bg-green-50 text-green-700 border-green-200';
      case EquipmentCategory.CHEMICALS: return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case EquipmentCategory.ELECTRONICS: return 'bg-red-50 text-red-700 border-red-200';
      case EquipmentCategory.BIOLOGY: return 'bg-pink-50 text-pink-700 border-pink-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // Format date for display
  const formatDisplayDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Main submission handler
  const handleSubmitAll = async () => {
    // Step 1: Create the schedule
    if (!formData.title || !formData.date || !formData.period || !formData.subject || !formData.grade || !formData.className) {
      addToast('Please fill in all schedule fields', 'error');
      setCurrentStep('schedule');
      return;
    }

    // Create schedule
    const newPractical: ScheduledPractical = {
      id: Date.now().toString(),
      title: formData.title,
      date: formData.date,
      period: formData.period,
      grade: formData.grade,
      className: formData.className,
      fullClassName: formData.fullClassName,
      subject: formData.subject,
      teacher: formData.teacher,
      location: formData.location,
      notes: formData.notes,
      attachments: formData.attachments.map(f => f.name),
      status: 'upcoming',
    };

    // Step 2: Create equipment request if items are added
    let equipmentRequestCreated = false;
    if (formData.equipmentItems.length > 0) {
      if (!formData.labAssistantId) {
        addToast('Please select a lab assistant', 'error');
        setCurrentStep('equipment');
        return;
      }

      setIsCreatingRequest(true);
      try {
        const selectedAssistant = labAssistants.find(a => a.id.toString() === formData.labAssistantId);
        
        // Create mock request for demo
        const newRequest: EquipmentRequestData = {
          id: Date.now(),
          teacherId: parseInt(userId || '1'),
          labAssistantId: parseInt(formData.labAssistantId),
          className: formData.fullClassName,
          grade: formData.grade,
          subject: formData.subject,
          practicalDate: formData.date,
          practicalTime: formData.practicalTime,
          additionalNotes: formData.additionalNotes,
          status: RequestStatus.PENDING,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          teacher: {
            id: 1,
            userId: 1,
            user: {
              id: 1,
              name: userName || currentTeacher,
              email: "teacher@school.edu",
              role: "teacher"
            }
          },
          labAssistant: {
            id: parseInt(formData.labAssistantId),
            userId: 2,
            user: {
              id: 2,
              name: selectedAssistant?.user.name || "Lab Assistant",
              email: selectedAssistant?.user.email || "assistant@school.edu",
              role: "lab-assistant"
            }
          },
          equipmentItems: formData.equipmentItems
        };

        equipmentRequestCreated = true;
        
        // Add to requests list
        setRequests(prev => [newRequest, ...prev]);
      } catch (error) {
        console.error('Error creating equipment request:', error);
        addToast('Failed to create equipment request', 'error');
        setIsCreatingRequest(false);
        return;
      }
      setIsCreatingRequest(false);
    }

    // Add to practicals list
    setPracticals([...practicals, newPractical]);
    setIsDialogOpen(false);
    
    if (equipmentRequestCreated) {
      addToast('Schedule created and equipment request sent successfully!', 'success');
    } else {
      addToast('Schedule created successfully!', 'success');
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      date: '',
      period: '',
      grade: '',
      className: 'A',
      fullClassName: '',
      subject: 'Science',
      teacher: currentTeacher,
      location: 'Primary Lab',
      notes: '',
      status: 'upcoming',
      attachments: [],
      labAssistantId: '',
      equipmentItems: [],
      additionalNotes: '',
      practicalTime: '',
    });
    setSelectedDay(null);
    setSelectedPeriod(null);
    setCurrentStep('schedule');
    setSelectedEquipment('');
    setEquipmentQuantity(1);
    setSelectedEquipmentCategory('all');
    setEquipmentSearch('');
  };

  const days: DayType[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const periods = ['1', '2', '3', '4', '5', '6', '7', '8'];

  // Calculate request counts for tabs
  const requestCounts = {
    all: requests.length,
    [RequestStatus.PENDING]: requests.filter(r => r.status === RequestStatus.PENDING).length,
    [RequestStatus.APPROVED]: requests.filter(r => r.status === RequestStatus.APPROVED).length,
    [RequestStatus.PREPARED]: requests.filter(r => r.status === RequestStatus.PREPARED).length,
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4">
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`flex items-center justify-between p-4 rounded-lg shadow-lg min-w-[300px] transform transition-all duration-300 ${
              toast.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : toast.type === 'error'
                ? 'bg-red-50 border border-red-200 text-red-800'
                : 'bg-blue-50 border border-blue-200 text-blue-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {toast.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : toast.type === 'error' ? (
                <XCircle className="w-5 h-5 text-red-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-blue-600" />
              )}
              <span>{toast.message}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="ml-4"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Science Laboratory Management</h2>
          <p className="text-gray-600">
            {canSchedule
              ? 'Schedule practicals and request equipment in one flow'
              : 'View scheduled practical sessions and equipment requests'}
          </p>
        </div>
        {canSchedule && (
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Schedule Practical
          </Button>
        )}
      </div>

      {/* Timetable Display */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <CardTitle className="flex items-center gap-2 text-xl">
            <CalendarIcon className="w-6 h-6" />
            Science Laboratory Timetable (Grades 6-11)
          </CardTitle>
          <CardDescription>
            Click on any period to schedule a practical for that time slot
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border p-3 font-bold text-center text-gray-900">PERIOD</th>
                  {days.map((day) => (
                    <th key={day} className="border p-3 font-bold text-center text-gray-900">{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {periods.map((period) => (
                  <tr key={period} className="hover:bg-gray-50">
                    <td className="border p-3 text-center bg-gray-50">
                      <div className="font-bold">Period {period}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        {getTimeForPeriod(period)}
                      </div>
                    </td>
                    {days.map((day) => {
                      const timetableClass = TIMETABLE[day][period as keyof typeof TIMETABLE[typeof day]];
                      
                      return (
                        <td key={`${day}-${period}`} className="border p-2">
                          <button
                            onClick={() => canSchedule && handlePeriodClick(day, period)}
                            className={`w-full h-full min-h-[60px] p-3 rounded-lg text-center transition-all ${
                              canSchedule 
                                ? 'hover:bg-blue-50 hover:border-blue-300 hover:shadow cursor-pointer bg-white border' 
                                : 'cursor-default bg-white border'
                            } ${selectedDay === day && selectedPeriod === period ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}
                            disabled={!canSchedule}
                          >
                            <div className="font-bold text-gray-900">{timetableClass}</div>
                            <div className="text-xs text-gray-600 mt-1">
                              {getTimeForPeriod(period)}
                            </div>
                            {canSchedule && (
                              <div className="mt-1 text-xs text-blue-600">
                                Click to schedule
                              </div>
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Scheduled Practicals Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">Scheduled Practicals</h3>
          <Badge variant="outline">
            {practicals.length} Total
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {practicals.map((practical) => (
            <motion.div
              key={practical.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card 
                className="hover:shadow-lg transition-all cursor-pointer h-full"
                onClick={() => handleCardClick(practical)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <Badge className={`${getSubjectColor(practical.subject)}`}>
                      {practical.subject}
                    </Badge>
                    <Badge className={`${getStatusColor(practical.status)}`}>
                      {practical.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg font-bold mb-1">{practical.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <span className="font-medium">{practical.fullClassName}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Period {practical.period}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="w-4 h-4" />
                      <span className="font-medium">{practical.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">{getTimeForPeriod(practical.period)}</span>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  {canSchedule && practical.status === 'upcoming' && (
                    <div className="mt-3 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCompleteSchedule(practical.id);
                        }}
                      >
                        Mark Complete
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-xs text-red-600 hover:text-red-700"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Cancel
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Cancel Schedule</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to cancel this schedule? This will mark it as cancelled.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Keep</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleCancelSchedule(practical.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Cancel Schedule
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Equipment Requests Section - MOVED BELOW SCHEDULE */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Package className="w-6 h-6" />
            Equipment Requests
          </CardTitle>
          <CardDescription>
            View and manage equipment requests for practical sessions
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          {/* Request Tabs */}
          <Tabs value={activeRequestTab} onValueChange={setActiveRequestTab} className="w-full">
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <PackageSearch className="w-4 h-4" />
                All
                <Badge variant="secondary" className="ml-1">
                  {requestCounts.all}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value={RequestStatus.PENDING} className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Pending
                <Badge variant="secondary" className="ml-1">
                  {requestCounts[RequestStatus.PENDING]}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value={RequestStatus.APPROVED} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Approved
                <Badge variant="secondary" className="ml-1">
                  {requestCounts[RequestStatus.APPROVED]}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value={RequestStatus.PREPARED} className="flex items-center gap-2">
                <PackageCheck className="w-4 h-4" />
                Prepared
                <Badge variant="secondary" className="ml-1">
                  {requestCounts[RequestStatus.PREPARED]}
                </Badge>
              </TabsTrigger>
            </TabsList>

            {/* Request Cards */}
            <div className="space-y-4">
              {getFilteredRequests().length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <PackageSearch className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No equipment requests found</p>
                  <p className="text-sm mt-1">
                    {activeRequestTab === 'all' 
                      ? 'Start by scheduling a practical with equipment requests.'
                      : `No ${activeRequestTab.toLowerCase()} requests.`}
                  </p>
                </div>
              ) : (
                getFilteredRequests().map((request) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="hover:shadow-lg transition-all">
                      <CardContent className="p-4">
                        {/* Request Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-bold text-lg">
                              {request.subject} - {request.grade} {request.className}
                            </h3>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <CalendarIcon className="w-3 h-3" />
                                {formatDisplayDate(request.practicalDate)} at {request.practicalTime}
                              </div>
                              <div className="flex items-center gap-1">
                                <UserCircle className="w-3 h-3" />
                                Teacher: {request.teacher.user.name}
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                Lab Assistant: {request.labAssistant.user.name}
                              </div>
                            </div>
                          </div>
                          <Badge className={`${getRequestStatusColor(request.status)} flex items-center gap-1`}>
                            {getRequestStatusIcon(request.status)}
                            {request.status}
                          </Badge>
                        </div>

                        {/* Equipment Items */}
                        <div className="mb-3">
                          <h4 className="font-semibold text-sm mb-2">Equipment Required:</h4>
                          <div className="space-y-2">
                            {request.equipmentItems.map((item, index) => (
                              <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <FlaskConical className="w-4 h-4 text-blue-600" />
                                  <span className="font-medium">{item.name}</span>
                                  <Badge variant="outline" className={getCategoryColor(item.category)}>
                                    {item.category.toLowerCase()}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-gray-700">Qty: {item.quantity}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Additional Notes */}
                        {request.additionalNotes && (
                          <div className="mb-3">
                            <h4 className="font-semibold text-sm mb-1">Notes:</h4>
                            <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                              {request.additionalNotes}
                            </p>
                          </div>
                        )}

                        {/* Request Date */}
                        <div className="flex justify-between items-center text-xs text-gray-500 pt-3 border-t">
                          <span>
                            Requested on: {formatDisplayDate(request.createdAt)}
                          </span>
                          {request.responseDate && (
                            <span>
                              {request.status === RequestStatus.APPROVED ? 'Approved' : 'Updated'} on: {formatDisplayDate(request.responseDate)}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Schedule Creation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              {currentStep === 'schedule' ? (
                <>
                  <CalendarIcon className="w-5 h-5" />
                  Schedule New Practical
                </>
              ) : (
                <>
                  <PackagePlus className="w-5 h-5" />
                  Request Equipment
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {currentStep === 'schedule' 
                ? 'Step 1: Schedule your practical session'
                : 'Step 2: Request equipment for your practical'}
            </DialogDescription>
          </DialogHeader>

          {/* Step Indicator */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep === 'schedule' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600'}`}>
                <span className="font-bold">1</span>
              </div>
              <div className="w-32 h-1 bg-blue-300"></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep === 'equipment' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600'}`}>
                <span className="font-bold">2</span>
              </div>
            </div>
          </div>

          {/* Step Content */}
          {currentStep === 'schedule' ? (
            <div className="space-y-6">
              {/* Main Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-semibold flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      Practical Title *
                    </Label>
                    <Input 
                      id="title" 
                      placeholder="e.g., Acid-Base Titration"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="period" className="text-sm font-semibold">
                        Period *
                      </Label>
                      <Select 
                        value={formData.period}
                        onValueChange={(value) => {
                          const timeSlot = getTimeForPeriod(value);
                          setFormData(prev => ({
                            ...prev, 
                            period: value,
                            practicalTime: timeSlot
                          }))
                        }}
                      >
                        <SelectTrigger id="period">
                          <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                        <SelectContent>
                          {periods.map((period) => (
                            <SelectItem key={period} value={period}>
                              <div className="flex items-center justify-between">
                                <span>Period {period}</span>
                                <span className="text-xs text-gray-500">{getTimeForPeriod(period)}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="date" className="text-sm font-semibold">
                        Date *
                      </Label>
                      <Input 
                        id="date" 
                        type="date" 
                        value={formData.date}
                        onChange={(e) => setFormData(prev => ({...prev, date: e.target.value}))}
                        required
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-sm font-semibold">Notes & Instructions</Label>
                    <Textarea
                      id="notes"
                      placeholder="Add any important notes or instructions for students..."
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({...prev, notes: e.target.value}))}
                      rows={3}
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="grade" className="text-sm font-semibold">
                      Grade *
                    </Label>
                    <Select 
                      value={formData.grade}
                      onValueChange={handleGradeChange}
                    >
                      <SelectTrigger id="grade">
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Grade 6">Grade 6</SelectItem>
                        <SelectItem value="Grade 7">Grade 7</SelectItem>
                        <SelectItem value="Grade 8">Grade 8</SelectItem>
                        <SelectItem value="Grade 9">Grade 9</SelectItem>
                        <SelectItem value="Grade 10">Grade 10</SelectItem>
                        <SelectItem value="Grade 11">Grade 11</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-sm font-semibold">Subject *</Label>
                    <Select 
                      value={formData.subject}
                      onValueChange={(value) => handleSubjectChange(value as SubjectType)}
                      disabled={!formData.grade}
                    >
                      <SelectTrigger id="subject">
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {getSubjectOptions(formData.grade || '').map((subject) => (
                          <SelectItem key={subject} value={subject}>
                            {subject}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="className" className="text-sm font-semibold">Class *</Label>
                    <Select 
                      value={formData.className}
                      onValueChange={handleClassChange}
                      disabled={!formData.grade || !formData.subject}
                    >
                      <SelectTrigger id="className">
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        {getClassOptions(formData.subject, formData.grade || '').map((className) => (
                          <SelectItem key={className} value={className}>
                            Class {className}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Class Summary Card */}
                  {formData.grade && formData.className && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-600" />
                        <div>
                          <h4 className="font-semibold text-blue-900 text-sm">Class Information</h4>
                          <div className="grid grid-cols-2 gap-2 mt-1">
                            <div>
                              <p className="text-xs text-gray-600">Grade</p>
                              <p className="font-semibold">{formData.grade}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">Class</p>
                              <p className="font-semibold">Class {formData.className}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)} 
                  className="min-w-[100px]"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => setCurrentStep('equipment')}
                  disabled={!formData.title || !formData.date || !formData.period || !formData.grade}
                  className="bg-blue-600 hover:bg-blue-700 min-w-[150px]"
                >
                  Next: Request Equipment
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Schedule Summary Banner */}
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-green-600" />
                  <div>
                    <h4 className="font-semibold text-green-900 text-sm mb-1">Schedule Summary</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div>
                        <p className="text-gray-600">Practical</p>
                        <p className="font-semibold truncate">{formData.title}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Date</p>
                        <p className="font-semibold">{formData.date}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Period</p>
                        <p className="font-semibold">P{formData.period}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Class</p>
                        <p className="font-semibold">{formData.fullClassName}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Equipment Request Form */}
              <div className="space-y-4">
                {/* Lab Assistant & Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">
                      Lab Assistant (Optional)
                    </Label>
                    <Select
                      value={formData.labAssistantId}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, labAssistantId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select lab assistant" />
                      </SelectTrigger>
                      <SelectContent>
                        {labAssistants.map((assistant) => (
                          <SelectItem key={assistant.id} value={assistant.id.toString()}>
                            {assistant.user.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">
                      Time Slot
                    </Label>
                    <Input
                      value={formData.practicalTime}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                </div>

                {/* Additional Notes */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Additional Notes</Label>
                  <Textarea
                    placeholder="Any special instructions or setup needs..."
                    rows={2}
                    value={formData.additionalNotes}
                    onChange={(e) => setFormData(prev => ({ ...prev, additionalNotes: e.target.value }))}
                  />
                </div>

                {/* Equipment Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold">
                      Equipment Items (Optional)
                    </Label>
                    <Badge variant="outline">
                      {formData.equipmentItems.length} item(s)
                    </Badge>
                  </div>

                  {/* Equipment Search and Filter */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div className="md:col-span-2">
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="Search equipment..."
                          value={equipmentSearch}
                          onChange={(e) => setEquipmentSearch(e.target.value)}
                          className="pl-8"
                        />
                      </div>
                    </div>
                    {/* FIXED: Removed className from Select */}
                    <Select value={selectedEquipmentCategory} onValueChange={setSelectedEquipmentCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {Object.values(EquipmentCategory).map((category) => (
                          <SelectItem key={category} value={category}>
                            {category.charAt(0) + category.slice(1).toLowerCase().replace('_', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Add Equipment */}
                  <div className="flex gap-2">
                    <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select equipment" />
                      </SelectTrigger>
                      <SelectContent>
                        {getFilteredEquipmentItems().map((item) => (
                          <SelectItem key={item.id} value={item.id.toString()}>
                            {item.name} ({item.subject})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      value={equipmentQuantity}
                      onChange={(e) => setEquipmentQuantity(parseInt(e.target.value) || 1)}
                      className="w-20"
                      placeholder="Qty"
                    />
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddEquipment}
                      disabled={!selectedEquipment}
                      className="px-4"
                    >
                      Add
                    </Button>
                  </div>

                  {/* Selected Equipment List */}
                  {formData.equipmentItems.length > 0 && (
                    <div className="space-y-2 max-h-60 overflow-y-auto p-3 border rounded-lg">
                      <Label className="text-sm font-semibold">Selected Equipment</Label>
                      <div className="space-y-2">
                        {formData.equipmentItems.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-white rounded-lg border">
                            <div className="flex items-center gap-2 flex-1">
                              <FlaskConical className="w-4 h-4 text-blue-600" />
                              <div>
                                <p className="font-medium text-sm">{item.name}</p>
                                <p className="text-xs text-gray-500">{item.category}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1 bg-gray-50 rounded p-1">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleUpdateEquipmentQuantity(index, Math.max(1, item.quantity - 1))}
                                  className="h-6 w-6 p-0"
                                >
                                  -
                                </Button>
                                <div className="w-8 text-center">
                                  <span className="font-medium">{item.quantity}</span>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleUpdateEquipmentQuantity(index, item.quantity + 1)}
                                  className="h-6 w-6 p-0"
                                >
                                  +
                                </Button>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveEquipment(index)}
                                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep('schedule')}
                  className="min-w-[100px]"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      // Create schedule without equipment request
                      if (!formData.title || !formData.date || !formData.period || !formData.subject || !formData.grade || !formData.className) {
                        addToast('Please fill in all schedule fields', 'error');
                        return;
                      }

                      const newPractical: ScheduledPractical = {
                        id: Date.now().toString(),
                        title: formData.title,
                        date: formData.date,
                        period: formData.period,
                        grade: formData.grade,
                        className: formData.className,
                        fullClassName: formData.fullClassName,
                        subject: formData.subject,
                        teacher: formData.teacher,
                        location: formData.location,
                        notes: formData.notes,
                        attachments: formData.attachments.map(f => f.name),
                        status: 'upcoming',
                      };

                      setPracticals([...practicals, newPractical]);
                      setIsDialogOpen(false);
                      addToast('Schedule created successfully!', 'success');
                      resetForm();
                    }}
                    disabled={isCreatingRequest}
                    className="min-w-[120px]"
                  >
                    {isCreatingRequest ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Schedule Only'
                    )}
                  </Button>
                  <Button 
                    onClick={handleSubmitAll}
                    disabled={isCreatingRequest || (formData.equipmentItems.length > 0 && !formData.labAssistantId)}
                    className="bg-blue-600 hover:bg-blue-700 min-w-[150px]"
                  >
                    {isCreatingRequest ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Schedule & Send
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Schedule Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Edit Schedule
            </DialogTitle>
            <DialogDescription>
              Make changes to the scheduled practical session
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Practical Title *</Label>
              <Input
                id="edit-title"
                value={editFormData.title}
                onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter practical title"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="edit-date">Date *</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={editFormData.date}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, date: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-period">Period *</Label>
                <Select
                  value={editFormData.period}
                  onValueChange={(value) => setEditFormData(prev => ({ ...prev, period: value }))}
                >
                  <SelectTrigger id="edit-period">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    {periods.map((period) => (
                      <SelectItem key={period} value={period}>
                        Period {period} ({getTimeForPeriod(period)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="edit-grade">Grade *</Label>
                <Select
                  value={editFormData.grade}
                  onValueChange={handleEditGradeChange}
                >
                  <SelectTrigger id="edit-grade">
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Grade 6">Grade 6</SelectItem>
                    <SelectItem value="Grade 7">Grade 7</SelectItem>
                    <SelectItem value="Grade 8">Grade 8</SelectItem>
                    <SelectItem value="Grade 9">Grade 9</SelectItem>
                    <SelectItem value="Grade 10">Grade 10</SelectItem>
                    <SelectItem value="Grade 11">Grade 11</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-subject">Subject *</Label>
                <Select
                  value={editFormData.subject}
                  onValueChange={(value) => handleEditSubjectChange(value as SubjectType)}
                  disabled={!editFormData.grade}
                >
                  <SelectTrigger id="edit-subject">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {getSubjectOptions(editFormData.grade || '').map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-class">Class *</Label>
                <Select
                  value={editFormData.className}
                  onValueChange={handleEditClassChange}
                  disabled={!editFormData.grade || !editFormData.subject}
                >
                  <SelectTrigger id="edit-class">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {getClassOptions(editFormData.subject, editFormData.grade || '').map((className) => (
                      <SelectItem key={className} value={className}>
                        Class {className}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notes & Instructions</Label>
              <Textarea
                id="edit-notes"
                value={editFormData.notes}
                onChange={(e) => setEditFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add any important notes or instructions for students..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={editFormData.status}
                onValueChange={(value) => setEditFormData(prev => ({ ...prev, status: value as 'upcoming' | 'completed' | 'cancelled' }))}
              >
                <SelectTrigger id="edit-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Selected Practical Details Modal */}
      {selectedPractical && (
        <Dialog open={!!selectedPractical} onOpenChange={(open) => !open && setSelectedPractical(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                {selectedPractical.title}
              </DialogTitle>
              <DialogDescription>
                Practical session details
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={getSubjectColor(selectedPractical.subject)}>
                  {selectedPractical.subject}
                </Badge>
                <Badge className={getStatusColor(selectedPractical.status)}>
                  {selectedPractical.status.toUpperCase()}
                </Badge>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 mb-1">Date & Time</h4>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-gray-600" />
                    <span>{selectedPractical.date}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-4 h-4 text-gray-600" />
                    <span>
                      Period {selectedPractical.period} • {getTimeForPeriod(selectedPractical.period)}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-500 mb-1">Class Information</h4>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-600" />
                    <span>{selectedPractical.fullClassName}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-500 mb-1">Location</h4>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-600" />
                    <span>{selectedPractical.location}</span>
                  </div>
                </div>

                {selectedPractical.notes && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 mb-1">Notes</h4>
                    <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                      {selectedPractical.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {canSchedule && (
                <div className="flex flex-col gap-2 pt-4 border-t">
                  <Button
                    onClick={() => {
                      setIsEditDialogOpen(true);
                      setSelectedPractical(null);
                    }}
                    className="w-full"
                  >
                    Edit Schedule
                  </Button>
                  
                  {selectedPractical.status === 'upcoming' && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => {
                          handleCompleteSchedule(selectedPractical.id);
                          setSelectedPractical(null);
                        }}
                        className="w-full"
                      >
                        Mark Complete
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" className="w-full">
                            Cancel Schedule
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Cancel Schedule</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to cancel this schedule? This will mark it as cancelled.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Keep</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => {
                                handleCancelSchedule(selectedPractical.id);
                                setSelectedPractical(null);
                              }}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Cancel Schedule
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}