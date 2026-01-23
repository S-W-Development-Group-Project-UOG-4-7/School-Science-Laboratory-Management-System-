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
  CheckSquare, Package, PackageCheck, PackageX, PackageSearch, User, Bell,
  Shield, ShieldCheck, ShieldAlert, Briefcase, TestTube
} from 'lucide-react';
import type { UserRole } from '@/lib/types';

// Types based on Prisma schema
enum EquipmentCategory {
  GLASSWARE = 'GLASSWARE',
  INSTRUMENTS = 'INSTRUMENTS',
  CHEMICALS = 'CHEMICALS',
  SAFETY = 'SAFETY',
  ELECTRONICS = 'ELECTRONICS',
  BIOLOGY = 'BIOLOGY',
  OTHER = 'OTHER'
}

enum RequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

enum ScheduleStatus {
  UPCOMING = 'UPCOMING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

type SubjectType = 'Physics' | 'Chemistry' | 'Biology' | 'Science';

interface SchedulePageProps {
  userRole: UserRole;
  userId?: string;
  userName?: string;
  teacherId?: number;
  userEmail?: string;
}

interface PracticalSchedule {
  id: number;
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
  status: ScheduleStatus;
  attachments: PracticalScheduleAttachment[];
  createdAt: string;
  updatedAt: string;
}

interface PracticalScheduleAttachment {
  id: number;
  fileName: string;
  fileUrl: string;
  fileType?: string;
  fileSize?: number;
}

interface EquipmentItem {
  id: number;
  name: string;
  quantity: number;
  category: EquipmentCategory;
}

interface EquipmentRequest {
  id: number;
  teacherId: number;
  labAssistantId: number;
  practicalScheduleId?: number;
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
  practicalSchedule?: PracticalSchedule;
}

interface LabAssistant {
  id: number;
  userId: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  availability: string[];
}

interface GradeConfig {
  grades: string[];
  classSections: Record<string, string[]>;
}

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

const commonEquipmentItems = [
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
  { id: 11, name: 'Microscope', category: EquipmentCategory.INSTRUMENTS, subject: 'Biology' },
  { id: 12, name: 'Glass Slides', category: EquipmentCategory.GLASSWARE, subject: 'Biology' },
  { id: 13, name: 'Petri Dishes', category: EquipmentCategory.GLASSWARE, subject: 'Biology' },
  { id: 14, name: 'Forceps', category: EquipmentCategory.INSTRUMENTS, subject: 'Biology' },
  { id: 15, name: 'Scalpel', category: EquipmentCategory.INSTRUMENTS, subject: 'Biology' },
  { id: 16, name: 'Magnifying Glass', category: EquipmentCategory.INSTRUMENTS, subject: 'Biology' },
  { id: 17, name: 'Test Tube Rack', category: EquipmentCategory.GLASSWARE, subject: 'Biology' },
  { id: 18, name: 'Specimen Containers', category: EquipmentCategory.BIOLOGY, subject: 'Biology' },
  { id: 19, name: 'Pendulum Set', category: EquipmentCategory.INSTRUMENTS, subject: 'Physics' },
  { id: 20, name: 'Circuit Board', category: EquipmentCategory.ELECTRONICS, subject: 'Physics' },
  { id: 21, name: 'Multimeter', category: EquipmentCategory.ELECTRONICS, subject: 'Physics' },
  { id: 22, name: 'Spring Balance', category: EquipmentCategory.INSTRUMENTS, subject: 'Physics' },
  { id: 23, name: 'Magnet Set', category: EquipmentCategory.INSTRUMENTS, subject: 'Physics' },
  { id: 24, name: 'Optics Kit', category: EquipmentCategory.INSTRUMENTS, subject: 'Physics' },
  { id: 25, name: 'Droppers', category: EquipmentCategory.GLASSWARE, subject: 'Science' },
  { id: 26, name: 'Wash Bottle', category: EquipmentCategory.GLASSWARE, subject: 'Science' },
  { id: 27, name: 'Filter Paper', category: EquipmentCategory.OTHER, subject: 'Science' },
  { id: 28, name: 'Measuring Cylinders', category: EquipmentCategory.GLASSWARE, subject: 'Science' },
  { id: 29, name: 'Stopwatch', category: EquipmentCategory.INSTRUMENTS, subject: 'Science' },
  { id: 30, name: 'Ruler Set', category: EquipmentCategory.INSTRUMENTS, subject: 'Science' },
];

const equipmentQuickSelect: Record<EquipmentCategory, { id: number; name: string; icon: string }[]> = {
  [EquipmentCategory.GLASSWARE]: [
    { id: 1, name: 'Beakers (250ml)', icon: '🧪' },
    { id: 2, name: 'Test Tubes', icon: '🧪' },
    { id: 6, name: 'Graduated Cylinders', icon: '🧪' },
    { id: 7, name: 'Pipettes', icon: '🧪' },
  ],
  [EquipmentCategory.INSTRUMENTS]: [
    { id: 3, name: 'Bunsen Burner', icon: '🔥' },
    { id: 10, name: 'Thermometer', icon: '🌡️' },
    { id: 11, name: 'Microscope', icon: '🔬' },
    { id: 19, name: 'Pendulum Set', icon: '⏱️' },
  ],
  [EquipmentCategory.SAFETY]: [
    { id: 4, name: 'Safety Goggles', icon: '🥽' },
    { id: 5, name: 'Lab Coats', icon: '🥼' },
  ],
  [EquipmentCategory.ELECTRONICS]: [
    { id: 8, name: 'pH Meter', icon: '📊' },
    { id: 9, name: 'Digital Balance', icon: '⚖️' },
    { id: 20, name: 'Circuit Board', icon: '🔌' },
    { id: 21, name: 'Multimeter', icon: '🔋' },
  ],
  [EquipmentCategory.BIOLOGY]: [
    { id: 12, name: 'Glass Slides', icon: '🔬' },
    { id: 13, name: 'Petri Dishes', icon: '🧫' },
    { id: 14, name: 'Forceps', icon: '🔧' },
    { id: 15, name: 'Scalpel', icon: '🔪' },
  ],
  [EquipmentCategory.CHEMICALS]: [
    { id: 31, name: 'Sodium Chloride', icon: '🧂' },
    { id: 32, name: 'Hydrochloric Acid', icon: '⚠️' },
    { id: 33, name: 'Distilled Water', icon: '💧' },
    { id: 34, name: 'Ethanol', icon: '🍶' },
  ],
  [EquipmentCategory.OTHER]: [
    { id: 27, name: 'Filter Paper', icon: '📄' },
    { id: 35, name: 'Rubber Stoppers', icon: '🔘' },
    { id: 36, name: 'Wire Gauze', icon: '🔧' },
    { id: 37, name: 'Tripod Stand', icon: '🛠️' },
  ]
};

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
type StepType = 'schedule' | 'equipment';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export function SchedulePage({ 
  userRole, 
  userId, 
  userName, 
  teacherId, 
  userEmail 
}: SchedulePageProps) {
  const [selectedDay, setSelectedDay] = useState<DayType | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [practicalSchedules, setPracticalSchedules] = useState<PracticalSchedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<PracticalSchedule | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [currentStep, setCurrentStep] = useState<StepType>('schedule');
  const [labAssistants, setLabAssistants] = useState<LabAssistant[]>([]);
  const [equipmentRequests, setEquipmentRequests] = useState<EquipmentRequest[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [equipmentQuantity, setEquipmentQuantity] = useState(1);
  const [isCreatingRequest, setIsCreatingRequest] = useState(false);
  const [selectedEquipmentCategory, setSelectedEquipmentCategory] = useState<string>('all');
  const [equipmentSearch, setEquipmentSearch] = useState('');
  const [activeRequestTab, setActiveRequestTab] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    // Schedule step
    title: '',
    date: '',
    period: '',
    grade: '',
    className: 'A',
    fullClassName: '',
    subject: 'Science' as SubjectType,
    teacherId: teacherId || 0,
    teacherName: userName || '',
    location: 'Primary Lab',
    notes: '',
    status: ScheduleStatus.UPCOMING,
    
    // Equipment step
    labAssistantId: '',
    equipmentItems: [] as EquipmentItem[],
    additionalNotes: '',
    practicalTime: '',
  });

  const [editFormData, setEditFormData] = useState({
    id: 0,
    title: '',
    date: '',
    period: '',
    grade: '',
    className: 'A',
    fullClassName: '',
    subject: 'Science' as SubjectType,
    location: 'Primary Lab',
    notes: '',
    status: ScheduleStatus.UPCOMING,
  });

  const days: DayType[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const periods = ['1', '2', '3', '4', '5', '6', '7', '8'];

  // Check permissions
  const canSchedule = userRole === 'teacher' || userRole === 'lab-assistant' || userRole === 'admin';
  const isTeacher = userRole === 'teacher';
  const isLabAssistant = userRole === 'lab-assistant';
  const currentTeacherId = teacherId || parseInt(userId || '0');

  // Fetch initial data
  useEffect(() => {
    fetchInitialData();
  }, [userRole, currentTeacherId]);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      // Fetch practical schedules
      const scheduleResponse = await fetch(`/api/schedules?teacherId=${currentTeacherId}`);
      if (scheduleResponse.ok) {
        const data = await scheduleResponse.json();
        setPracticalSchedules(data.schedules || []);
      }

      // Fetch equipment requests based on user role
      let requestUrl = '/api/equipment-requests';
      if (isTeacher) {
        requestUrl += `?teacherId=${currentTeacherId}`;
      } else if (isLabAssistant) {
        requestUrl += `?labAssistantId=${currentTeacherId}`;
      }

      const requestResponse = await fetch(requestUrl);
      if (requestResponse.ok) {
        const data = await requestResponse.json();
        setEquipmentRequests(data.requests || []);
      }

      // Fetch lab assistants
      const assistantsResponse = await fetch('/api/lab-assistants');
      if (assistantsResponse.ok) {
        const data = await assistantsResponse.json();
        setLabAssistants(data.assistants || []);
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
      addToast('Failed to load data', 'error');
    } finally {
      setIsLoading(false);
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

  const getTimeForPeriod = (period: string): string => {
    const timeSlot = PERIOD_TIMES[period];
    if (timeSlot) {
      return `${timeSlot.start} - ${timeSlot.end}`;
    }
    return '';
  };

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
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

  const getStatusColor = (status: ScheduleStatus) => {
    switch (status) {
      case ScheduleStatus.UPCOMING: return 'bg-blue-100 text-blue-700';
      case ScheduleStatus.COMPLETED: return 'bg-green-100 text-green-700';
      case ScheduleStatus.CANCELLED: return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getRequestStatusColor = (status: RequestStatus) => {
    switch (status) {
      case RequestStatus.PENDING: return 'bg-yellow-100 text-yellow-800';
      case RequestStatus.APPROVED: return 'bg-blue-100 text-blue-800';
      case RequestStatus.REJECTED: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRequestStatusIcon = (status: RequestStatus) => {
    switch (status) {
      case RequestStatus.PENDING: return <Clock className="w-4 h-4" />;
      case RequestStatus.APPROVED: return <CheckCircle className="w-4 h-4" />;
      case RequestStatus.REJECTED: return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

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
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      weekday: 'short'
    });
  };

  // Handle card click
  const handleCardClick = (schedule: PracticalSchedule) => {
    setSelectedSchedule(schedule);
    setEditFormData({
      id: schedule.id,
      title: schedule.title,
      date: schedule.date.split('T')[0],
      period: schedule.period,
      grade: schedule.grade,
      className: schedule.className,
      fullClassName: schedule.fullClassName,
      subject: schedule.subject as SubjectType,
      location: schedule.location,
      notes: schedule.notes || '',
      status: schedule.status,
    });
  };

  // Form handlers
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
        practicalTime: timeSlot
      }));
    }
    
    setIsDialogOpen(true);
  };

  // Equipment handlers
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
            id: Date.now(),
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

  const handleQuickAddEquipment = (equipmentName: string) => {
    const equipment = commonEquipmentItems.find(item => item.name === equipmentName);
    if (!equipment) return;

    const existingItemIndex = formData.equipmentItems.findIndex(item => item.name === equipment.name);
    
    if (existingItemIndex > -1) {
      const updatedItems = [...formData.equipmentItems];
      updatedItems[existingItemIndex].quantity += 1;
      setFormData(prev => ({ ...prev, equipmentItems: updatedItems }));
    } else {
      setFormData(prev => ({
        ...prev,
        equipmentItems: [
          ...prev.equipmentItems,
          {
            id: Date.now(),
            name: equipment.name,
            quantity: 1,
            category: equipment.category,
          }
        ]
      }));
    }
    addToast(`Added ${equipmentName}`, 'success');
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
    
    if (selectedEquipmentCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedEquipmentCategory);
    }
    
    if (equipmentSearch) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(equipmentSearch.toLowerCase()) ||
        item.category.toLowerCase().includes(equipmentSearch.toLowerCase()) ||
        item.subject.toLowerCase().includes(equipmentSearch.toLowerCase())
      );
    }
    
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
      return equipmentRequests;
    }
    return equipmentRequests.filter(request => request.status === activeRequestTab);
  };

  // Calculate request counts for tabs
  const requestCounts = {
    all: equipmentRequests.length,
    [RequestStatus.PENDING]: equipmentRequests.filter(r => r.status === RequestStatus.PENDING).length,
    [RequestStatus.APPROVED]: equipmentRequests.filter(r => r.status === RequestStatus.APPROVED).length,
    [RequestStatus.REJECTED]: equipmentRequests.filter(r => r.status === RequestStatus.REJECTED).length,
  };

  // Main submission handler
  const handleSubmitAll = async () => {
    // Validate schedule data
    if (!formData.title || !formData.date || !formData.period || !formData.subject || !formData.grade || !formData.className) {
      addToast('Please fill in all schedule fields', 'error');
      setCurrentStep('schedule');
      return;
    }

    // Create schedule payload
    const schedulePayload = {
      title: formData.title,
      date: formData.date,
      period: formData.period,
      grade: formData.grade,
      className: formData.className,
      fullClassName: formData.fullClassName,
      subject: formData.subject,
      teacherId: currentTeacherId,
      teacherName: userName || 'Teacher',
      location: formData.location,
      notes: formData.notes,
      status: ScheduleStatus.UPCOMING,
    };


  try {
    // Step 1: Create schedule
    console.log('Sending schedule payload:', schedulePayload);
    
    const scheduleResponse = await fetch('/api/schedules', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(schedulePayload),
    });

    console.log('Schedule response status:', scheduleResponse.status);
    
    if (!scheduleResponse.ok) {
      const errorText = await scheduleResponse.text();
      console.error('Schedule response error:', errorText);
      throw new Error(`Failed to create schedule: ${scheduleResponse.status} ${errorText}`);
    }

    const scheduleData = await scheduleResponse.json();
    console.log('Schedule created:', scheduleData);
    // ... rest of the code ...
  } catch (error: any) {
    console.error('Error in handleSubmitAll:', error);
    addToast(error.message || 'Failed to create schedule', 'error');
  }
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

  const handleEdit = async () => {
    if (!editFormData.title || !editFormData.date || !editFormData.period || !editFormData.grade || !editFormData.className) {
      addToast('Please fill in all required fields', 'error');
      return;
    }

    try {
      const response = await fetch(`/api/schedules/${editFormData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editFormData,
          date: new Date(editFormData.date).toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update schedule');
      }

      const updatedSchedule = await response.json();
      
      setPracticalSchedules(prev => prev.map(s => 
        s.id === editFormData.id ? updatedSchedule.schedule : s
      ));

      addToast('Schedule updated successfully!', 'success');
      setIsEditDialogOpen(false);
      setSelectedSchedule(null);
    } catch (error) {
      console.error('Error updating schedule:', error);
      addToast('Failed to update schedule', 'error');
    }
  };

  const handleCancelSchedule = async (scheduleId: number) => {
    try {
      const response = await fetch(`/api/schedules/${scheduleId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: ScheduleStatus.CANCELLED
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel schedule');
      }

      setPracticalSchedules(prev => prev.map(s => 
        s.id === scheduleId ? { ...s, status: ScheduleStatus.CANCELLED } : s
      ));
      
      addToast('Schedule cancelled successfully!', 'success');
    } catch (error) {
      console.error('Error cancelling schedule:', error);
      addToast('Failed to cancel schedule', 'error');
    }
  };

  const handleCompleteSchedule = async (scheduleId: number) => {
    try {
      const response = await fetch(`/api/schedules/${scheduleId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: ScheduleStatus.COMPLETED
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to complete schedule');
      }

      setPracticalSchedules(prev => prev.map(s => 
        s.id === scheduleId ? { ...s, status: ScheduleStatus.COMPLETED } : s
      ));
      
      addToast('Marked as completed!', 'success');
    } catch (error) {
      console.error('Error completing schedule:', error);
      addToast('Failed to complete schedule', 'error');
    }
  };

  const handleDeleteSchedule = async (scheduleId: number) => {
    try {
      const response = await fetch(`/api/schedules/${scheduleId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete schedule');
      }

      setPracticalSchedules(prev => prev.filter(s => s.id !== scheduleId));
      addToast('Schedule deleted successfully!', 'success');
      setSelectedSchedule(null);
    } catch (error) {
      console.error('Error deleting schedule:', error);
      addToast('Failed to delete schedule', 'error');
    }
  };

  // Equipment request handlers for lab assistants
  const handleApproveRequest = async (requestId: number, responseNote?: string) => {
    try {
      const response = await fetch(`/api/equipment-requests/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: RequestStatus.APPROVED,
          responseNote: responseNote || 'Request approved',
          responseDate: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to approve request');
      }

      const updatedRequest = await response.json();
      
      setEquipmentRequests(prev => prev.map(req => 
        req.id === requestId ? updatedRequest.request : req
      ));
      
      addToast('Request approved successfully!', 'success');
    } catch (error) {
      console.error('Error approving request:', error);
      addToast('Failed to approve request', 'error');
    }
  };

  const handleRejectRequest = async (requestId: number, responseNote?: string) => {
    try {
      const response = await fetch(`/api/equipment-requests/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: RequestStatus.REJECTED,
          responseNote: responseNote || 'Request rejected',
          responseDate: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reject request');
      }

      const updatedRequest = await response.json();
      
      setEquipmentRequests(prev => prev.map(req => 
        req.id === requestId ? updatedRequest.request : req
      ));
      
      addToast('Request rejected', 'info');
    } catch (error) {
      console.error('Error rejecting request:', error);
      addToast('Failed to reject request', 'error');
    }
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
      teacherId: currentTeacherId,
      teacherName: userName || '',
      location: 'Primary Lab',
      notes: '',
      status: ScheduleStatus.UPCOMING,
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-600" />
          <p className="mt-4 text-gray-600">Loading schedule data...</p>
        </div>
      </div>
    );
  }

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
          <div className="flex items-center gap-3 text-gray-600">
            <div className="flex items-center gap-1">
              <UserCircle className="w-4 h-4" />
              <span className="font-medium">{userName}</span>
              <Badge variant="outline" className="ml-2">
                {userRole}
              </Badge>
            </div>
            {isTeacher && (
              <div className="flex items-center gap-1">
                <Briefcase className="w-4 h-4" />
                <span>Teacher ID: {currentTeacherId}</span>
              </div>
            )}
            {userEmail && (
              <div className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                <span>{userEmail}</span>
              </div>
            )}
          </div>
        </div>
        {canSchedule && (
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Schedule Practical
          </Button>
        )}
      </div>

      {/* Timetable Display - Only show for teachers */}
      {isTeacher && (
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
                              onClick={() => handlePeriodClick(day, period)}
                              className={`w-full h-full min-h-[60px] p-3 rounded-lg text-center transition-all hover:bg-blue-50 hover:border-blue-300 hover:shadow cursor-pointer bg-white border ${
                                selectedDay === day && selectedPeriod === period ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                              }`}
                            >
                              <div className="font-bold text-gray-900">{timetableClass}</div>
                              <div className="text-xs text-gray-600 mt-1">
                                {getTimeForPeriod(period)}
                              </div>
                              <div className="mt-1 text-xs text-blue-600">
                                Click to schedule
                              </div>
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
      )}

      {/* Scheduled Practicals Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">
            {isTeacher ? 'My Scheduled Practicals' : 'All Scheduled Practicals'}
          </h3>
          <Badge variant="outline">
            {practicalSchedules.length} Total
          </Badge>
        </div>

        {practicalSchedules.length === 0 ? (
          <Card className="text-center py-8">
            <CalendarX className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No scheduled practicals</h4>
            <p className="text-gray-600 mb-4">
              {isTeacher 
                ? 'Start by scheduling your first practical session'
                : 'No practical sessions have been scheduled yet'
              }
            </p>
            {isTeacher && (
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Schedule First Practical
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {practicalSchedules.map((schedule) => (
              <motion.div
                key={schedule.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card 
                  className="hover:shadow-lg transition-all cursor-pointer h-full"
                  onClick={() => handleCardClick(schedule)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={`${getSubjectColor(schedule.subject)}`}>
                        {schedule.subject}
                      </Badge>
                      <Badge className={`${getStatusColor(schedule.status)}`}>
                        {schedule.status.toLowerCase()}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg font-bold mb-1">{schedule.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <span className="font-medium">{schedule.fullClassName}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Period {schedule.period}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="w-4 h-4" />
                        <span className="font-medium">{formatDisplayDate(schedule.date)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">{getTimeForPeriod(schedule.period)}</span>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    {isTeacher && schedule.status === ScheduleStatus.UPCOMING && (
                      <div className="mt-3 flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCompleteSchedule(schedule.id);
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
                                onClick={() => handleCancelSchedule(schedule.id)}
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
        )}
      </div>

      {/* Equipment Requests Section */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Package className="w-6 h-6" />
            Equipment Requests
            {isLabAssistant && (
              <Badge className="ml-2 bg-orange-100 text-orange-800 border-orange-200">
                <Shield className="w-3 h-3 mr-1" />
                Lab Assistant View
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            {isTeacher 
              ? 'View and track your equipment requests for practical sessions'
              : isLabAssistant
              ? 'Review and manage equipment requests from teachers'
              : 'View equipment requests'
            }
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
              <TabsTrigger value={RequestStatus.REJECTED} className="flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                Rejected
                <Badge variant="secondary" className="ml-1">
                  {requestCounts[RequestStatus.REJECTED]}
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
                              {isTeacher && (
                                <div className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  Lab Assistant: {request.labAssistant.user.name}
                                </div>
                              )}
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
                            {request.equipmentItems.map((item) => (
                              <div key={item.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
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
                            <h4 className="font-semibold text-sm mb-1">Teacher's Notes:</h4>
                            <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                              {request.additionalNotes}
                            </p>
                          </div>
                        )}

                        {/* Lab Assistant Response */}
                        {request.responseNote && (
                          <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <h4 className="font-semibold text-sm mb-1 text-blue-900">
                              {request.status === RequestStatus.REJECTED ? 'Rejection Reason:' : 'Lab Assistant Response:'}
                            </h4>
                            <p className="text-sm text-blue-800">
                              {request.responseNote}
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
                              {request.status === RequestStatus.REJECTED ? 'Rejected' : 'Updated'} on: {formatDisplayDate(request.responseDate)}
                            </span>
                          )}
                        </div>

                        {/* Lab Assistant Action Buttons */}
                        {isLabAssistant && request.status === RequestStatus.PENDING && (
                          <div className="flex gap-2 mt-4 pt-3 border-t">
                            <Button
                              size="sm"
                              className="flex-1 bg-green-600 hover:bg-green-700"
                              onClick={() => {
                                const responseNote = prompt('Add a response note (optional):');
                                handleApproveRequest(request.id, responseNote || undefined);
                              }}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 text-red-600 hover:text-red-700"
                              onClick={() => {
                                const responseNote = prompt('Please provide a reason for rejection:');
                                if (responseNote) {
                                  handleRejectRequest(request.id, responseNote);
                                }
                              }}
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        )}
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
                {/* Left Column - Practical Details */}
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
                  
                  {/* Period and Date Section */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Timing *
                    </Label>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="period" className="text-xs font-medium text-gray-600 mb-1 block">
                          Select Period
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
                          <SelectTrigger id="period" className="w-full">
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
                      
                      <div>
                        <Label htmlFor="date" className="text-xs font-medium text-gray-600 mb-1 block">
                          Select Date
                        </Label>
                        <Input 
                          id="date" 
                          type="date" 
                          value={formData.date}
                          onChange={(e) => setFormData(prev => ({...prev, date: e.target.value}))}
                          required
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-sm font-semibold flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      Notes & Instructions
                    </Label>
                    <Textarea
                      id="notes"
                      placeholder="Add any important notes or instructions for students..."
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({...prev, notes: e.target.value}))}
                      rows={3}
                    />
                  </div>
                </div>

                {/* Right Column - Class Details */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="grade" className="text-sm font-semibold flex items-center gap-1">
                      <School className="w-4 h-4" />
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
                          <p className="text-xs text-blue-700 mt-2">
                            Full Class: {formData.fullClassName}
                          </p>
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
                        <p className="font-semibold">P{formData.period} ({formData.practicalTime})</p>
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
                {/* Lab Assistant Selection */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    Select Lab Assistant *
                  </Label>
                  <Select
                    value={formData.labAssistantId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, labAssistantId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a lab assistant to handle your request" />
                    </SelectTrigger>
                    <SelectContent>
                      {labAssistants.map((assistant) => (
                        <SelectItem key={assistant.id} value={assistant.id.toString()}>
                          <div className="flex items-center gap-2">
                            <UserCircle className="w-4 h-4" />
                            <div>
                              <p className="font-medium">{assistant.user.name}</p>
                              <p className="text-xs text-gray-500">{assistant.user.email}</p>
                              <p className="text-xs text-blue-600">
                                Available: {assistant.availability.join(', ')}
                              </p>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    Your equipment request will be sent to the selected lab assistant.
                  </p>
                </div>

                {/* Additional Notes */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Additional Notes for Lab Assistant</Label>
                  <Textarea
                    placeholder="Any special instructions, setup needs, or specific requirements..."
                    rows={2}
                    value={formData.additionalNotes}
                    onChange={(e) => setFormData(prev => ({ ...prev, additionalNotes: e.target.value }))}
                  />
                </div>

                {/* Equipment Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold">
                      Required Equipment (Optional)
                    </Label>
                    <Badge variant="outline">
                      {formData.equipmentItems.length} item(s)
                    </Badge>
                  </div>

                  {/* Quick Selection Grid */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700">Quick Select Common Equipment:</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {Object.entries(equipmentQuickSelect).map(([category, items]) => (
                        <div key={category} className="space-y-1">
                          <h4 className="text-xs font-medium text-gray-600">
                            {category.charAt(0) + category.slice(1).toLowerCase()}
                          </h4>
                          <div className="space-y-1">
                            {items.slice(0, 2).map((item) => (
                              <Button
                                key={item.id}
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuickAddEquipment(item.name)}
                                className="w-full justify-start text-xs h-8"
                              >
                                <span className="mr-2">{item.icon}</span>
                                <span className="truncate">{item.name}</span>
                              </Button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Search and Advanced Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div className="md:col-span-2">
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="Search equipment by name..."
                          value={equipmentSearch}
                          onChange={(e) => setEquipmentSearch(e.target.value)}
                          className="pl-8"
                        />
                      </div>
                    </div>
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

                  {/* Manual Equipment Selection */}
                  <div className="flex gap-2">
                    <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Or select from full list" />
                      </SelectTrigger>
                      <SelectContent>
                        {getFilteredEquipmentItems().map((item) => (
                          <SelectItem key={item.id} value={item.id.toString()}>
                            <div className="flex items-center gap-2">
                              <FlaskConical className="w-4 h-4 text-blue-600" />
                              <span>{item.name}</span>
                              <Badge variant="outline" className="ml-2 text-xs">
                                {item.category}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <div className="flex items-center gap-2">
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
                    onClick={async () => {
                      // Create schedule without equipment request
                      if (!formData.title || !formData.date || !formData.period || !formData.subject || !formData.grade || !formData.className) {
                        addToast('Please fill in all schedule fields', 'error');
                        return;
                      }

                      try {
                        const schedulePayload = {
                          title: formData.title,
                          date: new Date(formData.date).toISOString(),
                          period: formData.period,
                          grade: formData.grade,
                          className: formData.className,
                          fullClassName: formData.fullClassName,
                          subject: formData.subject,
                          teacherId: currentTeacherId,
                          teacherName: userName || 'Teacher',
                          location: formData.location,
                          notes: formData.notes,
                          status: ScheduleStatus.UPCOMING,
                        };

                        const response = await fetch('/api/schedules', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify(schedulePayload),
                        });

                        if (!response.ok) {
                          throw new Error('Failed to create schedule');
                        }

                        const scheduleData = await response.json();
                        
                        setPracticalSchedules(prev => [scheduleData.schedule, ...prev]);
                        setIsDialogOpen(false);
                        addToast('Schedule created successfully!', 'success');
                        resetForm();
                      } catch (error) {
                        console.error('Error creating schedule:', error);
                        addToast('Failed to create schedule', 'error');
                      }
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
                    ) : formData.equipmentItems.length > 0 ? (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Schedule & Send Request
                      </>
                    ) : (
                      'Schedule Only'
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

            <div className="space-y-3">
              <Label className="text-sm font-medium">Timing *</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="edit-period" className="text-xs text-gray-600">Period</Label>
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
                <div className="space-y-2">
                  <Label htmlFor="edit-date" className="text-xs text-gray-600">Date</Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={editFormData.date}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, date: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
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
                onValueChange={(value) => setEditFormData(prev => ({ ...prev, status: value as ScheduleStatus }))}
              >
                <SelectTrigger id="edit-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ScheduleStatus.UPCOMING}>Upcoming</SelectItem>
                  <SelectItem value={ScheduleStatus.COMPLETED}>Completed</SelectItem>
                  <SelectItem value={ScheduleStatus.CANCELLED}>Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete Schedule</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete this schedule and any associated equipment requests.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => {
                      handleDeleteSchedule(editFormData.id);
                      setIsEditDialogOpen(false);
                    }}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete Schedule
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEdit}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Selected Practical Details Modal */}
      {selectedSchedule && (
        <Dialog open={!!selectedSchedule} onOpenChange={(open) => !open && setSelectedSchedule(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                {selectedSchedule.title}
              </DialogTitle>
              <DialogDescription>
                Practical session details
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={getSubjectColor(selectedSchedule.subject)}>
                  {selectedSchedule.subject}
                </Badge>
                <Badge className={getStatusColor(selectedSchedule.status)}>
                  {selectedSchedule.status.toLowerCase()}
                </Badge>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 mb-1">Date & Time</h4>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-gray-600" />
                    <span>{formatDisplayDate(selectedSchedule.date)}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-4 h-4 text-gray-600" />
                    <span>
                      Period {selectedSchedule.period} • {getTimeForPeriod(selectedSchedule.period)}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-500 mb-1">Class Information</h4>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-600" />
                    <span>{selectedSchedule.fullClassName}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-500 mb-1">Location</h4>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-600" />
                    <span>{selectedSchedule.location}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-500 mb-1">Scheduled By</h4>
                  <div className="flex items-center gap-2">
                    <UserCircle className="w-4 h-4 text-gray-600" />
                    <span>{selectedSchedule.teacherName}</span>
                  </div>
                </div>

                {selectedSchedule.notes && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 mb-1">Notes</h4>
                    <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                      {selectedSchedule.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {isTeacher && (
                <div className="flex flex-col gap-2 pt-4 border-t">
                  <Button
                    onClick={() => {
                      setIsEditDialogOpen(true);
                      setSelectedSchedule(null);
                    }}
                    className="w-full"
                  >
                    Edit Schedule
                  </Button>
                  
                  {selectedSchedule.status === ScheduleStatus.UPCOMING && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => {
                          handleCompleteSchedule(selectedSchedule.id);
                          setSelectedSchedule(null);
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
                                handleCancelSchedule(selectedSchedule.id);
                                setSelectedSchedule(null);
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