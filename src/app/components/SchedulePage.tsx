// app/(dashboard)/schedule/page.tsx or your component location
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, ChevronLeft, ChevronRight, Plus, Clock, Users, FileText, AlertCircle, Trash2, Edit, Download, Upload, X, CheckCircle, XCircle, User } from 'lucide-react';
import type { UserRole } from '@/lib/types';
import { scheduleApi, transformToApiFormat } from '@/api/schedules';

interface SchedulePageProps {
  userRole: UserRole;
  currentTeacher?: string;
  teacherId?: number;
}

interface ScheduledPractical {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  grade: string;
  className: string;
  fullClassName: string;
  subject: 'Physics' | 'Chemistry' | 'Biology' | 'Science';
  teacher: string;
  location: string;
  notes?: string;
  studentRequirements?: string;
  daySchedule?: string;
  attachments?: string[];
  maxStudents: number;
  status: 'upcoming' | 'completed' | 'cancelled';
}

type SubjectType = 'Physics' | 'Chemistry' | 'Biology' | 'Science';
type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface GradeConfig {
  grades: string[];
  classSections: string[];
}

const GRADE_CONFIG: Record<SubjectType, GradeConfig> = {
  'Science': {
    grades: ['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11'],
    classSections: ['A', 'B', 'C', 'D']
  },
  'Physics': {
    grades: ['Grade 12', 'Grade 13'],
    classSections: ['A', 'B', 'C']
  },
  'Chemistry': {
    grades: ['Grade 12', 'Grade 13'],
    classSections: ['A', 'B', 'C']
  },
  'Biology': {
    grades: ['Grade 12', 'Grade 13'],
    classSections: ['A', 'B', 'C']
  }
};

const currentTeacherName = "John Doe";

export default function SchedulePage({ 
  userRole, 
  currentTeacher = currentTeacherName,
  teacherId = 1
}: SchedulePageProps) {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 10, 12));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [practicals, setPracticals] = useState<ScheduledPractical[]>([]);
  const [selectedPractical, setSelectedPractical] = useState<ScheduledPractical | null>(null);
  const [formData, setFormData] = useState<Partial<ScheduledPractical>>({
    title: '',
    date: '',
    time: '',
    duration: '1 hour',
    grade: '',
    className: 'A',
    fullClassName: '',
    subject: 'Science',
    teacher: currentTeacher,
    location: '',
    notes: '',
    studentRequirements: '',
    daySchedule: '',
    maxStudents: 20,
    status: 'upcoming',
  });
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isCheckingConflict, setIsCheckingConflict] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const canSchedule = userRole === 'teacher' || userRole === 'lab-assistant' || userRole === 'admin';

  // Fetch schedules
  useEffect(() => {
    fetchSchedules();
  }, []);

  useEffect(() => {
    if (currentTeacher) {
      setFormData(prev => ({
        ...prev,
        teacher: currentTeacher
      }));
    }
  }, [currentTeacher]);

  const fetchSchedules = async () => {
    try {
      setIsLoading(true);
      const schedules = await scheduleApi.getSchedules({ teacherId });
      setPracticals(schedules);
    } catch (error: any) {
      addToast(error.message || 'Failed to load schedules', 'error');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToast = (message: string, type: ToastType = 'info') => {
    const id = Date.now().toString();
    const newToast = { id, message, type };
    setToasts(prev => [...prev, newToast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  };

  const getGradeOptions = (subject: SubjectType): string[] => {
    return GRADE_CONFIG[subject]?.grades || [];
  };

  const getClassOptions = (subject: SubjectType, grade: string): string[] => {
    if (!grade) return GRADE_CONFIG[subject]?.classSections || [];
    return GRADE_CONFIG[subject]?.classSections || [];
  };

  useEffect(() => {
    if (formData.grade && formData.className) {
      setFormData(prev => ({
        ...prev,
        fullClassName: `${formData.grade} - ${formData.className}`
      }));
    }
  }, [formData.grade, formData.className]);

  const handleSubjectChange = (subject: SubjectType) => {
    const validGrades = getGradeOptions(subject);
    const currentGrade = formData.grade;
    
    if (currentGrade && !validGrades.includes(currentGrade)) {
      const firstClass = GRADE_CONFIG[subject]?.classSections[0] || 'A';
      setFormData({
        ...formData,
        subject,
        grade: '',
        className: firstClass,
        fullClassName: ''
      });
    } else {
      const firstClass = GRADE_CONFIG[subject]?.classSections[0] || 'A';
      setFormData({
        ...formData,
        subject,
        className: firstClass,
        fullClassName: formData.grade ? `${formData.grade} - ${firstClass}` : ''
      });
    }
  };

  const handleGradeChange = (grade: string) => {
    const subject = formData.subject as SubjectType;
    const firstClass = GRADE_CONFIG[subject]?.classSections[0] || 'A';
    setFormData({
      ...formData,
      grade,
      className: firstClass,
      fullClassName: `${grade} - ${firstClass}`
    });
  };

  const handleClassChange = (className: string) => {
    setFormData({
      ...formData,
      className,
      fullClassName: formData.grade ? `${formData.grade} - ${className}` : ''
    });
  };

  const checkScheduleConflict = async (newPractical: Partial<ScheduledPractical>, isEdit: boolean = false) => {
    setIsCheckingConflict(true);
    
    try {
      const { date, time, location, fullClassName } = newPractical;
      
      const conflicts = practicals.filter(p => {
        if (isEdit && p.id === selectedPractical?.id) return false;
        
        if (p.date === date && p.time === time) {
          if (p.location === location) return true;
          if (p.fullClassName === fullClassName) return true;
          if (p.teacher === newPractical.teacher) return true;
        }
        return false;
      });
      
      return conflicts.length > 0;
    } catch (error) {
      console.error('Error checking conflicts:', error);
      return false;
    } finally {
      setIsCheckingConflict(false);
    }
  };

  // Calendar functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getPracticalsForDate = (dateString: string) => {
    return practicals.filter((p) => p.date === dateString);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getSubjectColor = (subject: string) => {
    switch (subject) {
      case 'Chemistry':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Physics':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'Biology':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Science':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-700';
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // CRUD Operations
  const handleCreate = async () => {
    if (!formData.title || !formData.date || !formData.time || !formData.subject || !formData.grade || !formData.className) {
      addToast('Please fill in all required fields', 'error');
      return;
    }

    try {
      const hasConflict = await checkScheduleConflict(formData);
      if (hasConflict) {
        addToast('Schedule conflict detected! This time slot is already booked for the same location or class. Please choose a different time.', 'error');
        return;
      }

      const apiData = transformToApiFormat(formData, teacherId);
      const newSchedule = await scheduleApi.createSchedule(apiData);
      
      setPracticals(prev => [...prev, newSchedule]);
      resetForm();
      setIsAddDialogOpen(false);
      addToast('Practical scheduled successfully!', 'success');
    } catch (error: any) {
      addToast(error.message || 'Failed to schedule practical', 'error');
    }
  };

  const handleUpdate = async () => {
    if (!selectedPractical || !formData.title || !formData.date || !formData.time || !formData.grade || !formData.className) {
      addToast('Please fill in all required fields', 'error');
      return;
    }

    try {
      const hasConflict = await checkScheduleConflict(formData, true);
      if (hasConflict) {
        addToast('Schedule conflict detected! This time slot is already booked for the same location or class. Please choose a different time.', 'error');
        return;
      }

      const apiData = transformToApiFormat(formData, teacherId);
      const updatedSchedule = await scheduleApi.updateSchedule(selectedPractical.id, apiData);
      
      setPracticals(prev => prev.map(p => 
        p.id === selectedPractical.id ? updatedSchedule : p
      ));
      resetForm();
      setIsEditDialogOpen(false);
      addToast('Practical updated successfully!', 'success');
    } catch (error: any) {
      addToast(error.message || 'Failed to update practical', 'error');
    }
  };

  const handleDelete = async () => {
    if (!selectedPractical) return;

    try {
      await scheduleApi.deleteSchedule(selectedPractical.id);
      
      setPracticals(prev => prev.filter(p => p.id !== selectedPractical.id));
      setIsDeleteDialogOpen(false);
      setSelectedPractical(null);
      addToast('Practical deleted successfully!', 'success');
    } catch (error: any) {
      addToast(error.message || 'Failed to delete practical', 'error');
    }
  };

  const handleEditClick = (practical: ScheduledPractical) => {
    setSelectedPractical(practical);
    setFormData({
      title: practical.title,
      date: practical.date,
      time: practical.time,
      duration: practical.duration,
      grade: practical.grade,
      className: practical.className,
      fullClassName: practical.fullClassName,
      subject: practical.subject,
      teacher: practical.teacher,
      location: practical.location,
      notes: practical.notes,
      studentRequirements: practical.studentRequirements,
      daySchedule: practical.daySchedule,
      maxStudents: practical.maxStudents,
      status: practical.status,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (practical: ScheduledPractical) => {
    setSelectedPractical(practical);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    const firstClass = GRADE_CONFIG['Science']?.classSections[0] || 'A';
    setFormData({
      title: '',
      date: '',
      time: '',
      duration: '1 hour',
      grade: '',
      className: firstClass,
      fullClassName: '',
      subject: 'Science',
      teacher: currentTeacher,
      location: '',
      notes: '',
      studentRequirements: '',
      daySchedule: '',
      maxStudents: 20,
      status: 'upcoming',
    });
    setAttachmentFiles([]);
    setSelectedPractical(null);
    setIsCheckingConflict(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachmentFiles([...attachmentFiles, ...files]);
  };

  const removeAttachment = (index: number) => {
    const newFiles = [...attachmentFiles];
    newFiles.splice(index, 1);
    setAttachmentFiles(newFiles);
  };

  const removeExistingAttachment = (practicalId: string, attachmentName: string) => {
    const updatedPracticals = practicals.map(p => {
      if (p.id === practicalId) {
        const newAttachments = p.attachments?.filter(att => att !== attachmentName) || [];
        return { ...p, attachments: newAttachments };
      }
      return p;
    });
    setPracticals(updatedPracticals);
    addToast('Attachment removed!', 'success');
  };

  const handleStatusChange = async (practicalId: string, newStatus: 'upcoming' | 'completed' | 'cancelled') => {
    try {
      const practical = practicals.find(p => p.id === practicalId);
      if (!practical) return;

      const apiData = transformToApiFormat({ ...practical, status: newStatus }, teacherId);
      await scheduleApi.updateSchedule(practicalId, apiData);
      
      const updatedPracticals = practicals.map(p => 
        p.id === practicalId ? { ...p, status: newStatus } : p
      );
      setPracticals(updatedPracticals);
      addToast(`Status changed to ${newStatus}`, 'success');
    } catch (error: any) {
      addToast(error.message || 'Failed to update status', 'error');
    }
  };

  const selectedDatePracticals = selectedDate ? getPracticalsForDate(selectedDate) : [];

  const getLabLocations = () => {
    const labs = [
      'Chemistry Lab A',
      'Chemistry Lab B', 
      'Physics Lab',
      'Biology Lab',
      'Science Lab',
      'Main Lab'
    ];
    
    const subject = formData.subject;
    if (subject === 'Chemistry') {
      return labs.filter(lab => lab.includes('Chemistry') || lab === 'Main Lab');
    } else if (subject === 'Physics') {
      return labs.filter(lab => lab.includes('Physics') || lab === 'Main Lab');
    } else if (subject === 'Biology') {
      return labs.filter(lab => lab.includes('Biology') || lab === 'Main Lab');
    }
    return labs;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-gray-900 mb-2">Schedule & Calendar</h2>
            <p className="text-gray-600">Loading schedules...</p>
          </div>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
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
          <h2 className="text-gray-900 mb-2">Schedule & Calendar</h2>
          <p className="text-gray-600">
            {canSchedule
              ? 'Schedule and manage practical sessions'
              : 'View scheduled practical sessions'}
          </p>
        </div>
        {canSchedule && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="w-4 h-4" />
              <span>Logged in as: {currentTeacher}</span>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
              setIsAddDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule Practical
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Schedule New Practical</DialogTitle>
                  <DialogDescription>
                    Add a new practical session for a specific class
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={(e) => { e.preventDefault(); handleCreate(); }} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="title">Practical Title *</Label>
                      <Input 
                        id="title" 
                        placeholder="e.g., Acid-Base Titration"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="subject">Subject *</Label>
                      <Select 
                        value={formData.subject}
                        onValueChange={(value) => handleSubjectChange(value as SubjectType)}
                      >
                        <SelectTrigger id="subject">
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Science">Science</SelectItem>
                          <SelectItem value="Physics">Physics</SelectItem>
                          <SelectItem value="Chemistry">Chemistry</SelectItem>
                          <SelectItem value="Biology">Biology</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="grade">Grade *</Label>
                      <Select 
                        value={formData.grade}
                        onValueChange={handleGradeChange}
                        disabled={!formData.subject}
                      >
                        <SelectTrigger id="grade">
                          <SelectValue placeholder="Select grade" />
                        </SelectTrigger>
                        <SelectContent>
                          {getGradeOptions(formData.subject as SubjectType).map((grade) => (
                            <SelectItem key={grade} value={grade}>
                              {grade}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="className">Class *</Label>
                      <Select 
                        value={formData.className}
                        onValueChange={handleClassChange}
                        disabled={!formData.grade}
                      >
                        <SelectTrigger id="className">
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                          {getClassOptions(formData.subject as SubjectType, formData.grade || '').map((className) => (
                            <SelectItem key={className} value={className}>
                              Class {className}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {formData.grade && formData.className && (
                      <div className="col-span-2">
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-900">
                              Selected Class: {formData.fullClassName}
                            </span>
                          </div>
                          <p className="text-xs text-blue-700 mt-1">
                            You are scheduling for {formData.grade} Class {formData.className}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <Label htmlFor="date">Date *</Label>
                      <Input 
                        id="date" 
                        type="date" 
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        required
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="time">Time *</Label>
                      <Input 
                        id="time" 
                        type="time" 
                        value={formData.time}
                        onChange={(e) => setFormData({...formData, time: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="duration">Duration *</Label>
                      <Select 
                        value={formData.duration}
                        onValueChange={(value) => setFormData({...formData, duration: value})}
                      >
                        <SelectTrigger id="duration">
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30 mins">30 minutes</SelectItem>
                          <SelectItem value="1 hour">1 hour</SelectItem>
                          <SelectItem value="1.5 hours">1.5 hours</SelectItem>
                          <SelectItem value="2 hours">2 hours</SelectItem>
                          <SelectItem value="2.5 hours">2.5 hours</SelectItem>
                          <SelectItem value="3 hours">3 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="location">Lab Location *</Label>
                      <Select 
                        value={formData.location}
                        onValueChange={(value) => setFormData({...formData, location: value})}
                      >
                        <SelectTrigger id="location">
                          <SelectValue placeholder="Select lab" />
                        </SelectTrigger>
                        <SelectContent>
                          {getLabLocations().map((location) => (
                            <SelectItem key={location} value={location}>
                              {location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="maxStudents">Max Students *</Label>
                      <Input 
                        id="maxStudents" 
                        type="number" 
                        placeholder="30"
                        value={formData.maxStudents}
                        onChange={(e) => setFormData({...formData, maxStudents: parseInt(e.target.value)})}
                        required
                        min="1"
                        max="40"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="teacher">Teacher</Label>
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                        <User className="w-4 h-4 text-gray-600" />
                        <span className="text-sm text-gray-900">{formData.teacher}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Auto-filled with your account</p>
                    </div>
                    
                    <div className="col-span-2">
                      <Label htmlFor="studentRequirements">What Students Should Bring</Label>
                      <Textarea
                        id="studentRequirements"
                        placeholder="e.g., Lab coat, safety goggles, calculator, notebook..."
                        value={formData.studentRequirements}
                        onChange={(e) => setFormData({...formData, studentRequirements: e.target.value})}
                        rows={2}
                      />
                    </div>
                    
                    <div className="col-span-2">
                      <Label htmlFor="daySchedule">Day Schedule/Timeline</Label>
                      <Textarea
                        id="daySchedule"
                        placeholder="e.g., 09:00-09:15: Safety briefing\n09:15-10:00: Demonstration\n10:00-11:00: Hands-on practical"
                        value={formData.daySchedule}
                        onChange={(e) => setFormData({...formData, daySchedule: e.target.value})}
                        rows={3}
                      />
                    </div>
                    
                    <div className="col-span-2">
                      <Label htmlFor="notes">Notes & Instructions</Label>
                      <Textarea
                        id="notes"
                        placeholder="Add any important notes, prerequisites, or instructions for students..."
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        rows={4}
                      />
                    </div>
                    
                    <div className="col-span-2">
                      <Label htmlFor="attachments">Attachments</Label>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Input
                            id="attachments"
                            type="file"
                            multiple
                            onChange={handleFileUpload}
                            className="flex-1"
                          />
                          <Upload className="w-4 h-4" />
                        </div>
                        {attachmentFiles.length > 0 && (
                          <div className="space-y-1">
                            {attachmentFiles.map((file, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <span className="text-sm truncate">{file.name}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeAttachment(index)}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select 
                        value={formData.status}
                        onValueChange={(value) => setFormData({...formData, status: value as any})}
                      >
                        <SelectTrigger id="status">
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
                  
                  {isCheckingConflict && (
                    <div className="col-span-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-900">
                          Checking for schedule conflicts...
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={isCheckingConflict}
                    >
                      {isCheckingConflict ? 'Checking...' : 'Schedule Practical'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Practical</DialogTitle>
            <DialogDescription>
              Update practical session details
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleUpdate(); }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="edit-title">Practical Title *</Label>
                <Input 
                  id="edit-title" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="edit-subject">Subject *</Label>
                <Select 
                  value={formData.subject}
                  onValueChange={(value) => handleSubjectChange(value as SubjectType)}
                >
                  <SelectTrigger id="edit-subject">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Science">Science</SelectItem>
                    <SelectItem value="Physics">Physics</SelectItem>
                    <SelectItem value="Chemistry">Chemistry</SelectItem>
                    <SelectItem value="Biology">Biology</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="edit-grade">Grade *</Label>
                <Select 
                  value={formData.grade}
                  onValueChange={handleGradeChange}
                  disabled={!formData.subject}
                >
                  <SelectTrigger id="edit-grade">
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {getGradeOptions(formData.subject as SubjectType).map((grade) => (
                      <SelectItem key={grade} value={grade}>
                        {grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="edit-className">Class *</Label>
                <Select 
                  value={formData.className}
                  onValueChange={handleClassChange}
                  disabled={!formData.grade}
                >
                  <SelectTrigger id="edit-className">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {getClassOptions(formData.subject as SubjectType, formData.grade || '').map((className) => (
                      <SelectItem key={className} value={className}>
                        Class {className}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {formData.grade && formData.className && (
                <div className="col-span-2">
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">
                        Selected Class: {formData.fullClassName}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              <div>
                <Label htmlFor="edit-date">Date *</Label>
                <Input 
                  id="edit-date" 
                  type="date" 
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="edit-time">Time *</Label>
                <Input 
                  id="edit-time" 
                  type="time" 
                  value={formData.time}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="edit-duration">Duration *</Label>
                <Select 
                  value={formData.duration}
                  onValueChange={(value) => setFormData({...formData, duration: value})}
                >
                  <SelectTrigger id="edit-duration">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30 mins">30 minutes</SelectItem>
                    <SelectItem value="1 hour">1 hour</SelectItem>
                    <SelectItem value="1.5 hours">1.5 hours</SelectItem>
                    <SelectItem value="2 hours">2 hours</SelectItem>
                    <SelectItem value="2.5 hours">2.5 hours</SelectItem>
                    <SelectItem value="3 hours">3 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="edit-location">Lab Location *</Label>
                <Select 
                  value={formData.location}
                  onValueChange={(value) => setFormData({...formData, location: value})}
                >
                  <SelectTrigger id="edit-location">
                    <SelectValue placeholder="Select lab" />
                  </SelectTrigger>
                  <SelectContent>
                    {getLabLocations().map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="edit-maxStudents">Max Students *</Label>
                <Input 
                  id="edit-maxStudents" 
                  type="number" 
                  value={formData.maxStudents}
                  onChange={(e) => setFormData({...formData, maxStudents: parseInt(e.target.value)})}
                  required
                  min="1"
                  max="40"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-teacher">Teacher</Label>
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                  <User className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-900">{formData.teacher}</span>
                </div>
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="edit-studentRequirements">What Students Should Bring</Label>
                <Textarea
                  id="edit-studentRequirements"
                  value={formData.studentRequirements}
                  onChange={(e) => setFormData({...formData, studentRequirements: e.target.value})}
                  rows={2}
                />
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="edit-daySchedule">Day Schedule/Timeline</Label>
                <Textarea
                  id="edit-daySchedule"
                  value={formData.daySchedule}
                  onChange={(e) => setFormData({...formData, daySchedule: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="edit-notes">Notes & Instructions</Label>
                <Textarea
                  id="edit-notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows={4}
                />
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="edit-attachments">Add More Attachments</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      id="edit-attachments"
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="flex-1"
                    />
                    <Upload className="w-4 h-4" />
                  </div>
                  {attachmentFiles.length > 0 && (
                    <div className="space-y-1">
                      {attachmentFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm truncate">{file.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAttachment(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select 
                  value={formData.status}
                  onValueChange={(value) => setFormData({...formData, status: value as any})}
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
            
            {isCheckingConflict && (
              <div className="col-span-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-900">
                    Checking for schedule conflicts...
                  </span>
                </div>
              </div>
            )}
            
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isCheckingConflict}
              >
                {isCheckingConflict ? 'Checking...' : 'Update Practical'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Practical</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedPractical?.title}" for {selectedPractical?.fullClassName}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Calendar and Practicals List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={previousMonth}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={nextMonth}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1">
              {dayNames.map((day) => (
                <div key={day} className="text-center p-2 text-sm text-gray-600">
                  {day}
                </div>
              ))}

              {Array.from({ length: startingDayOfWeek }).map((_, index) => (
                <div key={`empty-${index}`} className="p-2" />
              ))}

              {Array.from({ length: daysInMonth }).map((_, index) => {
                const day = index + 1;
                const dateString = formatDate(
                  currentDate.getFullYear(),
                  currentDate.getMonth(),
                  day
                );
                const datePracticals = getPracticalsForDate(dateString);
                const isToday = dateString === '2025-11-12';
                const isSelected = dateString === selectedDate;

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(dateString)}
                    className={`p-2 min-h-[80px] border rounded-lg text-left transition-colors hover:bg-gray-50 ${
                      isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                  >
                    <div className="text-sm text-gray-900 mb-1">{day}</div>
                    <div className="space-y-1">
                      {datePracticals.slice(0, 2).map((practical) => (
                        <div
                          key={practical.id}
                          className={`text-xs px-1 py-0.5 rounded truncate ${getSubjectColor(
                            practical.subject
                          )}`}
                        >
                          <div className="font-medium">{practical.time}</div>
                          <div>{practical.subject} - {practical.fullClassName}</div>
                        </div>
                      ))}
                      {datePracticals.length > 2 && (
                        <div className="text-xs text-gray-600">+{datePracticals.length - 2} more</div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Practicals List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Upcoming Practicals</CardTitle>
            <CardDescription>Next scheduled sessions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {practicals
              .filter((p) => p.status === 'upcoming')
              .slice(0, 5)
              .map((practical) => (
                <div
                  key={practical.id}
                  className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer"
                  onClick={() => setSelectedDate(practical.date)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <Badge className={getSubjectColor(practical.subject)} variant="outline">
                      {practical.subject}
                    </Badge>
                    <div className="text-right">
                      <span className="text-xs font-medium text-gray-900">{practical.fullClassName}</span>
                      <div className="text-xs text-gray-600">{practical.grade}</div>
                    </div>
                  </div>
                  <h4 className="text-sm text-gray-900 mb-1">{practical.title}</h4>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Clock className="w-3 h-3" />
                    <span>
                      {practical.date} at {practical.time}
                    </span>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>

      {/* Selected Date Details */}
      {selectedDate && selectedDatePracticals.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-900">
              Practicals on {selectedDate}
            </h3>
            {canSchedule && (
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                variant="outline"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add to this date
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4">
            {selectedDatePracticals.map((practical) => (
              <Card key={practical.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge className={getSubjectColor(practical.subject)}>
                          {practical.subject}
                        </Badge>
                        <Badge variant="outline" className="font-medium">
                          {practical.fullClassName}
                        </Badge>
                        <Badge className={getStatusColor(practical.status)} variant="outline">
                          {practical.status}
                        </Badge>
                      </div>
                      <CardTitle>{practical.title}</CardTitle>
                      <CardDescription>Teacher: {practical.teacher}</CardDescription>
                    </div>
                    {canSchedule && (
                      <div className="flex gap-2">
                        <Select
                          value={practical.status}
                          onValueChange={(value) => handleStatusChange(practical.id, value as any)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="upcoming">Upcoming</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="outline" size="sm" onClick={() => handleEditClick(practical)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteClick(practical)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-600" />
                      <div>
                        <p className="text-sm text-gray-600">Time</p>
                        <p className="text-gray-900">{practical.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-600" />
                      <div>
                        <p className="text-sm text-gray-600">Duration</p>
                        <p className="text-gray-900">{practical.duration}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-600" />
                      <div>
                        <p className="text-sm text-gray-600">Max Students</p>
                        <p className="text-gray-900">{practical.maxStudents}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-gray-600" />
                      <div>
                        <p className="text-sm text-gray-600">Location</p>
                        <p className="text-gray-900">{practical.location}</p>
                      </div>
                    </div>
                  </div>

                  {/* Class Information */}
                  <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                    <h4 className="text-indigo-900 mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Class Information
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Grade & Class</p>
                        <p className="text-gray-900 font-medium">{practical.fullClassName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Subject</p>
                        <p className="text-gray-900 font-medium">{practical.subject}</p>
                      </div>
                    </div>
                  </div>

                  {/* Student Requirements */}
                  {practical.studentRequirements && (
                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <h4 className="text-yellow-900 mb-2 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        What Students Should Bring
                      </h4>
                      <p className="text-sm text-gray-700">{practical.studentRequirements}</p>
                    </div>
                  )}

                  {/* Day Schedule */}
                  {practical.daySchedule && (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <h4 className="text-green-900 mb-2 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Day Schedule/Timeline
                      </h4>
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap">{practical.daySchedule}</pre>
                    </div>
                  )}

                  {/* Notes */}
                  {practical.notes && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="text-blue-900 mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Notes & Instructions
                      </h4>
                      <p className="text-sm text-gray-700">{practical.notes}</p>
                    </div>
                  )}

                  {/* Attachments */}
                  {practical.attachments && practical.attachments.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-gray-900 font-medium">Attachments</h4>
                        {canSchedule && (
                          <Button variant="outline" size="sm" asChild>
                            <label htmlFor={`upload-${practical.id}`} className="cursor-pointer flex items-center gap-2">
                              <Upload className="w-4 h-4" />
                              Add More
                              <input
                                id={`upload-${practical.id}`}
                                type="file"
                                multiple
                                className="hidden"
                                onChange={(e) => {
                                  const files = Array.from(e.target.files || []);
                                  const updated = practicals.map(p =>
                                    p.id === practical.id
                                      ? { 
                                          ...p, 
                                          attachments: [...(p.attachments || []), ...files.map(f => f.name)]
                                        }
                                      : p
                                  );
                                  setPracticals(updated);
                                  addToast('Files added!', 'success');
                                }}
                              />
                            </label>
                          </Button>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {practical.attachments.map((attachment, index) => (
                          <div key={index} className="flex items-center gap-1 bg-gray-100 rounded-md p-1">
                            <Button variant="outline" size="sm" className="flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              <span className="truncate max-w-[150px]">{attachment}</span>
                              <Download className="w-3 h-3" />
                            </Button>

                            {canSchedule && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const updated = practicals.map(p =>
                                    p.id === practical.id
                                      ? { 
                                          ...p, 
                                          attachments: p.attachments ? p.attachments.filter((a) => a !== attachment) : []
                                        }
                                      : p
                                  );
                                  setPracticals(updated);
                                  addToast('Attachment removed!', 'success');
                                }}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {selectedDate && selectedDatePracticals.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-gray-900 mb-2">No practicals scheduled</h3>
            <p className="text-gray-600 mb-4">No practical sessions scheduled for {selectedDate}</p>
            {canSchedule && (
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Schedule a Practical
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}