'use client';

import { useState } from 'react';
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
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar, ChevronLeft, ChevronRight, Plus, Clock, Users, FileText, AlertCircle } from 'lucide-react';
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
  location: string;
  notes: string;
  attachments?: string[];
  maxStudents: number;
  status: 'upcoming' | 'completed' | 'cancelled';
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
    location: 'Chemistry Lab A',
    notes: 'Students must bring their lab coats and safety goggles. Pre-read Chapter 8 on acid-base reactions. Lab sheets will be provided.',
    attachments: ['titration_procedure.pdf', 'safety_guidelines.pdf'],
    maxStudents: 25,
    status: 'upcoming',
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
    location: 'Biology Lab',
    notes: 'Introduction to compound microscope usage. Students will observe prepared slides of plant and animal cells.',
    attachments: ['microscope_guide.pdf'],
    maxStudents: 30,
    status: 'upcoming',
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
    location: 'Physics Lab',
    notes: 'Study of simple harmonic motion. Bring calculators for data analysis. Work in pairs.',
    attachments: ['pendulum_theory.pdf', 'data_sheet.xlsx'],
    maxStudents: 20,
    status: 'upcoming',
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
    location: 'Biology Lab',
    notes: 'Investigating factors affecting photosynthesis rate using aquatic plants. Completed successfully.',
    maxStudents: 30,
    status: 'completed',
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
    location: 'Chemistry Lab B',
    notes: 'Advanced practical for A/L students. Systematic identification of cations and anions. Essential for exam preparation.',
    attachments: ['salt_analysis_flowchart.pdf', 'reagent_list.pdf'],
    maxStudents: 20,
    status: 'upcoming',
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
    location: 'Physics Lab',
    notes: 'Verification of Ohm\'s law using resistors and ammeters. Graph plotting required.',
    attachments: ['circuit_diagram.pdf'],
    maxStudents: 24,
    status: 'upcoming',
  },
];

export function SchedulePage({ userRole }: SchedulePageProps) {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 10, 12)); // November 2025
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const canSchedule = userRole === 'teacher' || userRole === 'staff';

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
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Physics':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'Biology':
        return 'bg-blue-50 text-blue-700 border-blue-200';
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

  const selectedDatePracticals = selectedDate ? getPracticalsForDate(selectedDate) : [];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
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
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
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
                  Add a new practical session to the calendar
                </DialogDescription>
              </DialogHeader>
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="title">Practical Title</Label>
                    <Input id="title" placeholder="e.g., Acid-Base Titration" />
                  </div>
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Select>
                      <SelectTrigger id="subject">
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Physics">Physics</SelectItem>
                        <SelectItem value="Chemistry">Chemistry</SelectItem>
                        <SelectItem value="Biology">Biology</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="grade">Grade</Label>
                    <Select>
                      <SelectTrigger id="grade">
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="9">Grade 9</SelectItem>
                        <SelectItem value="10">Grade 10</SelectItem>
                        <SelectItem value="11">Grade 11</SelectItem>
                        <SelectItem value="12">Grade 12</SelectItem>
                        <SelectItem value="13">Grade 13</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" type="date" />
                  </div>
                  <div>
                    <Label htmlFor="time">Time</Label>
                    <Input id="time" type="time" />
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration</Label>
                    <Input id="duration" placeholder="e.g., 2 hours" />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" placeholder="e.g., Chemistry Lab A" />
                  </div>
                  <div>
                    <Label htmlFor="maxStudents">Max Students</Label>
                    <Input id="maxStudents" type="number" placeholder="30" />
                  </div>
                  <div>
                    <Label htmlFor="teacher">Teacher</Label>
                    <Input id="teacher" placeholder="Teacher name" />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="notes">Notes & Instructions</Label>
                    <Textarea
                      id="notes"
                      placeholder="Add any important notes, prerequisites, or instructions for students..."
                      rows={4}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    Schedule Practical
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

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
              {/* Day headers */}
              {dayNames.map((day) => (
                <div key={day} className="text-center p-2 text-sm text-gray-600">
                  {day}
                </div>
              ))}

              {/* Empty cells for days before month starts */}
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
                    className={`p-2 min-h-[80px] border rounded-lg text-left transition-colors hover:bg-gray-50 ${
                      isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                  >
                    <div className="text-sm text-gray-900 mb-1">{day}</div>
                    <div className="space-y-1">
                      {practicals.slice(0, 2).map((practical) => (
                        <div
                          key={practical.id}
                          className={`text-xs px-1 py-0.5 rounded truncate ${getSubjectColor(
                            practical.subject
                          )}`}
                        >
                          {practical.time} {practical.subject}
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

        {/* Upcoming Practicals List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Upcoming Practicals</CardTitle>
            <CardDescription>Next scheduled sessions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {scheduledPracticals
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
                    <span className="text-xs text-gray-600">{practical.grade}</span>
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
          <h3 className="text-gray-900">
            Practicals on {selectedDate}
          </h3>
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
                        <Badge variant="outline">{practical.grade}</Badge>
                        <Badge className={getStatusColor(practical.status)} variant="outline">
                          {practical.status}
                        </Badge>
                      </div>
                      <CardTitle>{practical.title}</CardTitle>
                      <CardDescription>Teacher: {practical.teacher}</CardDescription>
                    </div>
                    {canSchedule && practical.status === 'upcoming' && (
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
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
                      <div className="flex flex-wrap gap-2">
                        {practical.attachments.map((attachment, index) => (
                          <Button key={index} variant="outline" size="sm">
                            <FileText className="w-4 h-4 mr-2" />
                            {attachment}
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