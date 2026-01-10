'use client';

import { useState, useEffect } from 'react';
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
  DialogClose,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  Users, 
  FileText, 
  Download,
  AlertCircle, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle,
  CalendarDays,
  Search,
  Filter,
  Eye,
  EyeOff,
  User,
  Building,
  Bell,
  Check
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Switch } from './ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import type { UserRole } from '@/lib/types';

interface SchedulePageProps {
  userRole: UserRole;
}

interface ScheduledPractical {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  grade: string;
  subject: 'Physics' | 'Chemistry' | 'Biology';
  teacher: string;
  teacherEmail?: string;
  location: string;
  notes: string;
  attachments?: { name: string; url: string; size: string }[];
  maxStudents: number;
  enrolledStudents?: number;
  status: 'upcoming' | 'completed' | 'cancelled';
  recurring?: 'none' | 'weekly' | 'biweekly' | 'monthly';
  roomSetup?: string;
  equipmentRequired?: string[];
}

const scheduledPracticals: ScheduledPractical[] = [
  {
    id: '1',
    title: 'Acid-Base Titration',
    date: '2025-11-13',
    time: '09:00',
    duration: '2 hours',
    grade: 'Grade 11',
    subject: 'Chemistry',
    teacher: 'Mrs. Perera',
    teacherEmail: 'perera@school.edu',
    location: 'Chemistry Lab A',
    notes: 'Students must bring their lab coats and safety goggles. Pre-read Chapter 8 on acid-base reactions. Lab sheets will be provided.',
    attachments: [
      { name: 'titration_procedure.pdf', url: '/downloads/titration_procedure.pdf', size: '2.4 MB' },
      { name: 'safety_guidelines.pdf', url: '/downloads/safety_guidelines.pdf', size: '1.1 MB' }
    ],
    maxStudents: 25,
    enrolledStudents: 24,
    status: 'upcoming',
    roomSetup: 'Lab benches with burettes, pipettes, and titration setups',
    equipmentRequired: ['Burettes', 'Pipettes', 'Conical Flasks', 'Indicators']
  },
  {
    id: '2',
    title: 'Microscope Practical',
    date: '2025-11-14',
    time: '10:30',
    duration: '1.5 hours',
    grade: 'Grade 9',
    subject: 'Biology',
    teacher: 'Mr. Silva',
    teacherEmail: 'silva@school.edu',
    location: 'Biology Lab',
    notes: 'Introduction to compound microscope usage. Students will observe prepared slides of plant and animal cells.',
    attachments: [
      { name: 'microscope_guide.pdf', url: '/downloads/microscope_guide.pdf', size: '3.2 MB' }
    ],
    maxStudents: 30,
    enrolledStudents: 28,
    status: 'upcoming',
    roomSetup: 'Microscopes arranged in stations with prepared slides',
    equipmentRequired: ['Compound Microscopes', 'Prepared Slides', 'Lens Paper']
  },
  {
    id: '3',
    title: 'Simple Pendulum Experiment',
    date: '2025-11-15',
    time: '14:00',
    duration: '1 hour',
    grade: 'Grade 10',
    subject: 'Physics',
    teacher: 'Mr. Fernando',
    teacherEmail: 'fernando@school.edu',
    location: 'Physics Lab',
    notes: 'Study of simple harmonic motion. Bring calculators for data analysis. Work in pairs.',
    attachments: [
      { name: 'pendulum_theory.pdf', url: '/downloads/pendulum_theory.pdf', size: '1.8 MB' },
      { name: 'data_sheet.xlsx', url: '/downloads/data_sheet.xlsx', size: '0.8 MB' }
    ],
    maxStudents: 20,
    enrolledStudents: 18,
    status: 'upcoming',
    roomSetup: 'Stand and clamp setups with pendulum bobs',
    equipmentRequired: ['Pendulum Stands', 'Stopwatches', 'Meter Rules']
  },
  {
    id: '4',
    title: 'Photosynthesis Experiment',
    date: '2025-11-12',
    time: '09:00',
    duration: '2 hours',
    grade: 'Grade 10',
    subject: 'Biology',
    teacher: 'Mr. Silva',
    teacherEmail: 'silva@school.edu',
    location: 'Biology Lab',
    notes: 'Investigating factors affecting photosynthesis rate using aquatic plants. Completed successfully.',
    attachments: [],
    maxStudents: 30,
    enrolledStudents: 30,
    status: 'completed',
    roomSetup: 'Light sources and aquatic plant setups',
    equipmentRequired: ['Elodea Plants', 'Test Tubes', 'Lamps']
  },
  {
    id: '5',
    title: 'Qualitative Salt Analysis',
    date: '2025-11-18',
    time: '13:00',
    duration: '3 hours',
    grade: 'Grade 12',
    subject: 'Chemistry',
    teacher: 'Mrs. Perera',
    teacherEmail: 'perera@school.edu',
    location: 'Chemistry Lab B',
    notes: 'Advanced practical for A/L students. Systematic identification of cations and anions. Essential for exam preparation.',
    attachments: [
      { name: 'salt_analysis_flowchart.pdf', url: '/downloads/salt_analysis_flowchart.pdf', size: '4.5 MB' },
      { name: 'reagent_list.pdf', url: '/downloads/reagent_list.pdf', size: '1.2 MB' }
    ],
    maxStudents: 20,
    enrolledStudents: 19,
    status: 'upcoming',
    recurring: 'weekly',
    roomSetup: 'Individual workstations with reagent bottles',
    equipmentRequired: ['Test Tubes', 'Reagent Bottles', 'Bunsen Burners']
  },
  {
    id: '6',
    title: 'Ohm\'s Law Verification',
    date: '2025-11-20',
    time: '11:00',
    duration: '1.5 hours',
    grade: 'Grade 11',
    subject: 'Physics',
    teacher: 'Mr. Fernando',
    teacherEmail: 'fernando@school.edu',
    location: 'Physics Lab',
    notes: 'Verification of Ohm\'s law using resistors and ammeters. Graph plotting required.',
    attachments: [
      { name: 'circuit_diagram.pdf', url: '/downloads/circuit_diagram.pdf', size: '1.5 MB' }
    ],
    maxStudents: 24,
    enrolledStudents: 22,
    status: 'upcoming',
    roomSetup: 'Circuit boards and power supplies',
    equipmentRequired: ['Power Supplies', 'Resistors', 'Ammeters', 'Voltmeters']
  },
];

export function SchedulePage({ userRole }: SchedulePageProps) {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 10, 12)); // November 2025
  const [selectedDate, setSelectedDate] = useState<string | null>('2025-11-13');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPractical, setSelectedPractical] = useState<ScheduledPractical | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterGrade, setFilterGrade] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [showPastSessions, setShowPastSessions] = useState(false);

  const canSchedule = userRole === 'teacher' || userRole === 'lab-assistant' || userRole === 'admin';
  const canEdit = userRole === 'teacher' || userRole === 'lab-assistant' || userRole === 'admin';

  // New practical form state
  const [newPractical, setNewPractical] = useState({
    title: '',
    date: '',
    time: '',
    duration: '',
    grade: '',
    subject: '' as 'Physics' | 'Chemistry' | 'Biology' | '',
    teacher: '',
    teacherEmail: '',
    location: '',
    notes: '',
    maxStudents: 25,
    recurring: 'none' as 'none' | 'weekly' | 'biweekly' | 'monthly',
    roomSetup: '',
    equipmentRequired: '',
    attachments: [] as { name: string; file: File }[],
  });

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

  const goToToday = () => {
    setCurrentDate(new Date(2025, 10, 12));
    setSelectedDate('2025-11-12');
  };

  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getPracticalsForDate = (dateString: string) => {
    return scheduledPracticals.filter((p) => p.date === dateString);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getSubjectColor = (subject: string) => {
    switch (subject) {
      case 'Chemistry':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Physics':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Biology':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
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

  const handleDownloadAttachment = (attachment: { name: string; url: string; size: string }) => {
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddPractical = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Adding new practical:', newPractical);
    setIsAddDialogOpen(false);
    setNewPractical({
      title: '',
      date: '',
      time: '',
      duration: '',
      grade: '',
      subject: '',
      teacher: '',
      teacherEmail: '',
      location: '',
      notes: '',
      maxStudents: 25,
      recurring: 'none',
      roomSetup: '',
      equipmentRequired: '',
      attachments: [],
    });
  };

  const handleEditPractical = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Editing practical:', selectedPractical);
    setIsEditDialogOpen(false);
  };

  const handleDeletePractical = (id: string) => {
    if (window.confirm('Are you sure you want to delete this practical?')) {
      console.log('Deleting practical:', id);
    }
  };

  const handleMarkAsCompleted = (id: string) => {
    console.log('Marking as completed:', id);
  };

  const handleCancelPractical = (id: string) => {
    if (window.confirm('Are you sure you want to cancel this practical?')) {
      console.log('Canceling practical:', id);
    }
  };

  const handleEnrollStudent = (id: string) => {
    console.log('Enrolling student in:', id);
  };

  const handleViewAttendance = (id: string) => {
    console.log('Viewing attendance for:', id);
  };

  const selectedDatePracticals = selectedDate ? getPracticalsForDate(selectedDate) : [];

  const filteredPracticals = scheduledPracticals.filter((practical) => {
    const matchesSearch = practical.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         practical.teacher.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || practical.status === filterStatus;
    const matchesSubject = filterSubject === 'all' || practical.subject === filterSubject;
    const matchesGrade = filterGrade === 'all' || practical.grade === filterGrade;
    const matchesDate = showPastSessions || practical.status === 'upcoming';
    
    return matchesSearch && matchesStatus && matchesSubject && matchesGrade && matchesDate;
  });

  const upcomingPracticals = scheduledPracticals
    .filter((p) => p.status === 'upcoming')
    .slice(0, 6);

  const totalUpcoming = scheduledPracticals.filter(p => p.status === 'upcoming').length;
  const totalCompleted = scheduledPracticals.filter(p => p.status === 'completed').length;
  const totalCancelled = scheduledPracticals.filter(p => p.status === 'cancelled').length;
  const occupancyRate = Math.round(
    scheduledPracticals.reduce((acc, p) => acc + (p.enrolledStudents || 0), 0) /
    scheduledPracticals.reduce((acc, p) => acc + p.maxStudents, 0) * 100
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-gray-900 mb-2">Schedule & Calendar</h2>
          <p className="text-gray-600">
            {canSchedule
              ? 'Schedule and manage practical sessions'
              : 'View scheduled practical sessions'}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            onClick={goToToday}
            className="border-gray-300 hover:border-blue-400"
          >
            Today
          </Button>
          
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <Button 
              variant={viewMode === 'calendar' ? 'default' : 'ghost'} 
              onClick={() => setViewMode('calendar')}
              className="rounded-none"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Calendar
            </Button>
            <Button 
              variant={viewMode === 'list' ? 'default' : 'ghost'} 
              onClick={() => setViewMode('list')}
              className="rounded-none"
            >
              <CalendarDays className="w-4 h-4 mr-2" />
              List
            </Button>
          </div>
          
          {canSchedule && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule Practical
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border border-gray-200 shadow-xl">
                <DialogHeader>
                  <DialogTitle>Schedule New Practical</DialogTitle>
                  <DialogDescription>
                    Add a new practical session to the calendar
                  </DialogDescription>
                </DialogHeader>
                <form className="space-y-4" onSubmit={handleAddPractical}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="title">Practical Title *</Label>
                      <Input 
                        id="title" 
                        placeholder="e.g., Acid-Base Titration" 
                        value={newPractical.title}
                        onChange={(e) => setNewPractical({...newPractical, title: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="subject">Subject *</Label>
                      <Select 
                        value={newPractical.subject} 
                        onValueChange={(value) => setNewPractical({...newPractical, subject: value as any})}
                      >
                        <SelectTrigger id="subject" className="bg-white">
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-gray-200 shadow-lg">
                          <SelectItem value="Physics">Physics</SelectItem>
                          <SelectItem value="Chemistry">Chemistry</SelectItem>
                          <SelectItem value="Biology">Biology</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="grade">Grade *</Label>
                      <Select 
                        value={newPractical.grade} 
                        onValueChange={(value) => setNewPractical({...newPractical, grade: value})}
                      >
                        <SelectTrigger id="grade" className="bg-white">
                          <SelectValue placeholder="Select grade" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-gray-200 shadow-lg">
                          <SelectItem value="Grade 9">Grade 9</SelectItem>
                          <SelectItem value="Grade 10">Grade 10</SelectItem>
                          <SelectItem value="Grade 11">Grade 11</SelectItem>
                          <SelectItem value="Grade 12">Grade 12</SelectItem>
                          <SelectItem value="Grade 13">Grade 13</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="date">Date *</Label>
                      <Input 
                        id="date" 
                        type="date" 
                        value={newPractical.date}
                        onChange={(e) => setNewPractical({...newPractical, date: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="time">Time *</Label>
                      <Input 
                        id="time" 
                        type="time" 
                        value={newPractical.time}
                        onChange={(e) => setNewPractical({...newPractical, time: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="duration">Duration *</Label>
                      <Input 
                        id="duration" 
                        placeholder="e.g., 2 hours" 
                        value={newPractical.duration}
                        onChange={(e) => setNewPractical({...newPractical, duration: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="recurring">Recurring</Label>
                      <Select 
                        value={newPractical.recurring} 
                        onValueChange={(value) => setNewPractical({...newPractical, recurring: value as any})}
                      >
                        <SelectTrigger id="recurring" className="bg-white">
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-gray-200 shadow-lg">
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="biweekly">Bi-weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="location">Location *</Label>
                      <Input 
                        id="location" 
                        placeholder="e.g., Chemistry Lab A" 
                        value={newPractical.location}
                        onChange={(e) => setNewPractical({...newPractical, location: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxStudents">Max Students *</Label>
                      <Input 
                        id="maxStudents" 
                        type="number" 
                        placeholder="30" 
                        value={newPractical.maxStudents}
                        onChange={(e) => setNewPractical({...newPractical, maxStudents: parseInt(e.target.value)})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="teacher">Teacher *</Label>
                      <Input 
                        id="teacher" 
                        placeholder="Teacher name" 
                        value={newPractical.teacher}
                        onChange={(e) => setNewPractical({...newPractical, teacher: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="teacherEmail">Teacher Email</Label>
                      <Input 
                        id="teacherEmail" 
                        type="email" 
                        placeholder="teacher@school.edu"
                        value={newPractical.teacherEmail}
                        onChange={(e) => setNewPractical({...newPractical, teacherEmail: e.target.value})}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="roomSetup">Room Setup Requirements</Label>
                      <Input 
                        id="roomSetup" 
                        placeholder="Describe the room setup needed..."
                        value={newPractical.roomSetup}
                        onChange={(e) => setNewPractical({...newPractical, roomSetup: e.target.value})}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="equipmentRequired">Equipment Required</Label>
                      <Input 
                        id="equipmentRequired" 
                        placeholder="List required equipment separated by commas..."
                        value={newPractical.equipmentRequired}
                        onChange={(e) => setNewPractical({...newPractical, equipmentRequired: e.target.value})}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="notes">Notes & Instructions</Label>
                      <Textarea
                        id="notes"
                        placeholder="Add any important notes, prerequisites, or instructions for students..."
                        rows={4}
                        value={newPractical.notes}
                        onChange={(e) => setNewPractical({...newPractical, notes: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2 pt-4 border-t">
                    <Label>Upload Attachments</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
                         onClick={() => document.getElementById('attachments')?.click()}>
                      <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-1">Click to upload files or drag and drop</p>
                      <p className="text-xs text-gray-500">PDF, DOC, XLS up to 10MB each</p>
                      <Input 
                        id="attachments" 
                        type="file" 
                        multiple 
                        className="hidden" 
                        accept=".pdf,.doc,.docx,.xls,.xlsx"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          setNewPractical({
                            ...newPractical,
                            attachments: files.map(file => ({ name: file.name, file }))
                          });
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-4">
                    <DialogClose asChild>
                      <Button type="button" variant="outline">
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                      Schedule Practical
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-blue-600">{totalUpcoming}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{totalCompleted}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Occupancy Rate</p>
                <p className="text-2xl font-bold text-purple-600">{occupancyRate}%</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cancelled</p>
                <p className="text-2xl font-bold text-red-600">{totalCancelled}</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {viewMode === 'calendar' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <Card className="lg:col-span-2 border border-gray-200 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </CardTitle>
                <div className="flex items-center gap-2">
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
                {/* Day headers */}
                {dayNames.map((day) => (
                  <div key={day} className="text-center p-2 text-sm font-medium text-gray-700">
                    {day}
                  </div>
                ))}

                {/* Empty cells */}
                {Array.from({ length: startingDayOfWeek }).map((_, index) => (
                  <div key={`empty-${index}`} className="p-2" />
                ))}

                {/* Calendar days */}
                {Array.from({ length: daysInMonth }).map((_, index) => {
                  const day = index + 1;
                  const dateString = formatDate(
                    currentDate.getFullYear(),
                    currentDate.getMonth(),
                    day
                  );
                  const practicals = getPracticalsForDate(dateString);
                  const isToday = dateString === '2025-11-12';
                  const isSelected = dateString === selectedDate;

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDate(dateString)}
                      className={`p-2 min-h-[80px] border rounded-lg text-left transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      } ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}
                    >
                      <div className={`flex justify-between items-center mb-1 ${
                        isToday ? 'text-blue-600 font-semibold' : 'text-gray-900'
                      }`}>
                        <span className="text-sm">{day}</span>
                        {isToday && (
                          <span className="text-xs bg-blue-100 text-blue-600 px-1 rounded">Today</span>
                        )}
                      </div>
                      <div className="space-y-1">
                        {practicals.slice(0, 2).map((practical) => (
                          <div
                            key={practical.id}
                            className={`text-xs px-1 py-0.5 rounded truncate ${getSubjectColor(
                              practical.subject
                            )}`}
                          >
                            {practical.time.slice(0, 5)} {practical.subject.slice(0, 3)}
                          </div>
                        ))}
                        {practicals.length > 2 && (
                          <div className="text-xs text-gray-600">+{practicals.length - 2} more</div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Practicals Sidebar */}
          <div className="space-y-6">
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle>Upcoming Practicals</CardTitle>
                <CardDescription>Next scheduled sessions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingPracticals.map((practical) => (
                  <div
                    key={practical.id}
                    className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer bg-white hover:shadow-sm"
                    onClick={() => {
                      setSelectedDate(practical.date);
                      setSelectedPractical(practical);
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={getSubjectColor(practical.subject)} variant="outline">
                        {practical.subject}
                      </Badge>
                      <span className="text-xs text-gray-600">{practical.grade}</span>
                    </div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1 line-clamp-1">{practical.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Clock className="w-3 h-3" />
                      <span>
                        {practical.date} at {practical.time}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {practical.enrolledStudents}/{practical.maxStudents} students
                      </span>
                      <span className="text-xs font-medium">
                        {practical.location}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* List View */
        <div className="space-y-4">
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-auto md:flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search practicals..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white"
                  />
                </div>
                
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                  <Select value={filterSubject} onValueChange={setFilterSubject}>
                    <SelectTrigger className="w-full md:w-40 bg-white">
                      <SelectValue placeholder="Subject" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg">
                      <SelectItem value="all">All Subjects</SelectItem>
                      <SelectItem value="Physics">Physics</SelectItem>
                      <SelectItem value="Chemistry">Chemistry</SelectItem>
                      <SelectItem value="Biology">Biology</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={filterGrade} onValueChange={setFilterGrade}>
                    <SelectTrigger className="w-full md:w-40 bg-white">
                      <SelectValue placeholder="Grade" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg">
                      <SelectItem value="all">All Grades</SelectItem>
                      <SelectItem value="Grade 9">Grade 9</SelectItem>
                      <SelectItem value="Grade 10">Grade 10</SelectItem>
                      <SelectItem value="Grade 11">Grade 11</SelectItem>
                      <SelectItem value="Grade 12">Grade 12</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full md:w-40 bg-white">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg">
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="flex items-center gap-2">
                    <Switch 
                      id="show-past" 
                      checked={showPastSessions}
                      onCheckedChange={setShowPastSessions}
                    />
                    <Label htmlFor="show-past" className="text-sm whitespace-nowrap">
                      Show Past Sessions
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 gap-4">
            {filteredPracticals.map((practical) => (
              <Card key={practical.id} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-start gap-2 mb-2">
                        <Badge className={getSubjectColor(practical.subject)}>
                          {practical.subject}
                        </Badge>
                        <Badge variant="outline">{practical.grade}</Badge>
                        <Badge className={getStatusColor(practical.status)} variant="outline">
                          {practical.status}
                        </Badge>
                        {practical.recurring && practical.recurring !== 'none' && (
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                            Recurring: {practical.recurring}
                          </Badge>
                        )}
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{practical.title}</h3>
                      <div className="text-sm text-gray-600 mb-2">
                        {/* FIXED: Removed CardDescription wrapper and used a div instead */}
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4 text-gray-500" />
                          <span>Teacher: {practical.teacher} • {practical.location}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-700">{practical.date} at {practical.time}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-700">{practical.duration}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-700">
                            {practical.enrolledStudents}/{practical.maxStudents} students
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {practical.status === 'upcoming' && canEdit && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedPractical(practical);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleMarkAsCompleted(practical.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Complete
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => handleCancelPractical(practical.id)}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                        </>
                      )}
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border border-gray-200 shadow-xl">
                          <DialogHeader>
                            <DialogTitle>{practical.title}</DialogTitle>
                            <DialogDescription>
                              Complete details and information
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-gray-600">Subject</p>
                                <p className="text-gray-900">{practical.subject}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Grade</p>
                                <p className="text-gray-900">{practical.grade}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Teacher</p>
                                <p className="text-gray-900">{practical.teacher}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Email</p>
                                <p className="text-gray-900">{practical.teacherEmail}</p>
                              </div>
                            </div>
                            
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                              <h4 className="text-gray-900 mb-2">Schedule Information</h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                  <p className="text-sm text-gray-600">Date</p>
                                  <p className="text-gray-900">{practical.date}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Time</p>
                                  <p className="text-gray-900">{practical.time}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Duration</p>
                                  <p className="text-gray-900">{practical.duration}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Location</p>
                                  <p className="text-gray-900">{practical.location}</p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                              <h4 className="text-blue-900 mb-2">Notes & Instructions</h4>
                              <p className="text-sm text-gray-700">{practical.notes}</p>
                            </div>
                            
                            {practical.attachments && practical.attachments.length > 0 && (
                              <div>
                                <h4 className="text-gray-900 mb-2">Attachments</h4>
                                <div className="space-y-2">
                                  {practical.attachments.map((attachment, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                      <div className="flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-gray-500" />
                                        <div>
                                          <p className="text-sm text-gray-900">{attachment.name}</p>
                                          <p className="text-xs text-gray-500">{attachment.size}</p>
                                        </div>
                                      </div>
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => handleDownloadAttachment(attachment)}
                                      >
                                        <Download className="w-4 h-4 mr-2" />
                                        Download
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {filteredPracticals.length === 0 && (
              <Card className="py-12 border border-gray-200 shadow-sm">
                <CardContent className="text-center">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-gray-900 mb-2 font-semibold">No practicals found</h3>
                  <p className="text-gray-600">Try adjusting your filters or schedule a new practical</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Selected Date Details */}
      {selectedDate && selectedDatePracticals.length > 0 && viewMode === 'calendar' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-900">
              Practicals on {selectedDate}
            </h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSelectedDate(null)}
            >
              Clear Selection
            </Button>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {selectedDatePracticals.map((practical) => (
              <Card key={practical.id} className="border border-gray-200 shadow-sm">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={getSubjectColor(practical.subject)}>
                          {practical.subject}
                        </Badge>
                        <Badge variant="outline">{practical.grade}</Badge>
                        <Badge className={getStatusColor(practical.status)} variant="outline">
                          {practical.status}
                        </Badge>
                        {practical.enrolledStudents !== undefined && (
                          <Badge variant="outline" className="bg-gray-50">
                            {practical.enrolledStudents}/{practical.maxStudents} enrolled
                          </Badge>
                        )}
                      </div>
                      <CardTitle>{practical.title}</CardTitle>
                      {/* FIXED: Replaced CardDescription with a regular div */}
                      <div className="text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          Teacher: {practical.teacher}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {canEdit && practical.status === 'upcoming' && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedPractical(practical);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          {userRole === 'teacher' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewAttendance(practical.id)}
                            >
                              <Users className="w-4 h-4 mr-2" />
                              Attendance
                            </Button>
                          )}
                        </>
                      )}
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border border-gray-200 shadow-xl">
                          <DialogHeader>
                            <DialogTitle>{practical.title}</DialogTitle>
                            <DialogDescription>
                              Detailed information and instructions
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
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
                                <Building className="w-4 h-4 text-gray-600" />
                                <div>
                                  <p className="text-sm text-gray-600">Location</p>
                                  <p className="text-gray-900">{practical.location}</p>
                                </div>
                              </div>
                            </div>

                            {practical.notes && (
                              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <h4 className="text-blue-900 mb-2 flex items-center gap-2">
                                  <FileText className="w-4 h-4" />
                                  Notes & Instructions
                                </h4>
                                <p className="text-sm text-gray-700">{practical.notes}</p>
                              </div>
                            )}

                            {practical.attachments && practical.attachments.length > 0 && (
                              <div>
                                <h4 className="text-gray-900 mb-2">Attachments</h4>
                                <div className="space-y-2">
                                  {practical.attachments.map((attachment, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                      <div className="flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-gray-500" />
                                        <div>
                                          <p className="text-sm text-gray-900">{attachment.name}</p>
                                          <p className="text-xs text-gray-500">{attachment.size}</p>
                                        </div>
                                      </div>
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => handleDownloadAttachment(attachment)}
                                      >
                                        <Download className="w-4 h-4 mr-2" />
                                        Download
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {practical.attachments && practical.attachments.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-gray-900">Attachments</h4>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            practical.attachments?.forEach(handleDownloadAttachment);
                          }}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download All
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {practical.attachments.map((attachment, index) => (
                          <Button 
                            key={index} 
                            variant="outline" 
                            size="sm"
                            className="hover:border-blue-300 hover:bg-blue-50"
                            onClick={() => handleDownloadAttachment(attachment)}
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            {attachment.name}
                          </Button>
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

      {selectedDate && selectedDatePracticals.length === 0 && viewMode === 'calendar' && (
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="py-12 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-gray-900 mb-2 font-semibold">No practicals scheduled</h3>
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
