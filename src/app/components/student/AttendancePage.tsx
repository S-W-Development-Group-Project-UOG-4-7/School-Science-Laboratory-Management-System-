'use client';

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Loader2, CheckCircle2, Calendar, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { get, post } from '@/utils/api';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface AttendancePageProps {
  studentId: number;
}

interface AttendanceRecord {
  id: number;
  status: string;
  createdAt: string;
  practical: {
    id: number;
    title: string;
    subject: string;
    lab: string;
    dateTime: string;
  };
}

interface Practical {
  id: number;
  title: string;
  subject: string;
  lab: string;
  dateTime: string;
}

export function AttendancePage({ studentId }: AttendancePageProps) {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [practicals, setPracticals] = useState<Practical[]>([]);
  const [selectedPracticalId, setSelectedPracticalId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMarking, setIsMarking] = useState(false);

  useEffect(() => {
    fetchAttendanceRecords();
    fetchPracticals();
  }, [studentId]);

  const fetchAttendanceRecords = async () => {
    setIsLoading(true);
    try {
      const response = await get(`/api/attendance?studentId=${studentId}`);
      if (response.success && response.data) {
        setRecords(response.data);
      } else {
        toast.error(response.message || 'Failed to fetch attendance records');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPracticals = async () => {
    try {
      // You'll need to create this API route or use existing one
      const response = await get('/api/practicals');
      if (response.success && response.data) {
        setPracticals(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch practicals:', error);
    }
  };

  const markAttendance = async () => {
    if (!selectedPracticalId) {
      toast.error('Please select a practical session');
      return;
    }

    setIsMarking(true);
    try {
      const response = await post('/api/attendance', {
        studentId,
        practicalId: parseInt(selectedPracticalId),
        status: 'PRESENT',
      });

      if (response.success) {
        toast.success('Attendance marked successfully!');
        setSelectedPracticalId('');
        fetchAttendanceRecords();
      } else {
        toast.error(response.message || 'Failed to mark attendance');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsMarking(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return 'bg-green-100 text-green-700';
      case 'LATE':
        return 'bg-yellow-100 text-yellow-700';
      case 'ABSENT':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Mark Attendance</h2>
        <p className="text-gray-600">Mark your attendance for practical sessions</p>
      </div>

      {/* Mark Attendance Card */}
      <Card>
        <CardHeader>
          <CardTitle>Mark Attendance</CardTitle>
          <CardDescription>Select a practical session and mark your attendance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Practical Session</label>
            <Select value={selectedPracticalId} onValueChange={setSelectedPracticalId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a practical session" />
              </SelectTrigger>
              <SelectContent>
                {practicals.map((practical) => (
                  <SelectItem key={practical.id} value={practical.id.toString()}>
                    {practical.title} - {practical.subject} ({new Date(practical.dateTime).toLocaleDateString()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={markAttendance}
            disabled={isMarking || !selectedPracticalId}
            className="w-full"
          >
            {isMarking ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Marking...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Mark Attendance
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Attendance History */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance History</CardTitle>
          <CardDescription>View your attendance records</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No attendance records found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {records.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{record.practical.title}</h3>
                      <Badge className={getStatusColor(record.status)}>
                        {record.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(record.practical.dateTime).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(record.createdAt).toLocaleString()}
                      </div>
                      <span>{record.practical.subject} - {record.practical.lab}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

