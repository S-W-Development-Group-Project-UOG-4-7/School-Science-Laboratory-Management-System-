'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Loader2, FileText, Upload, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { get, post } from '@/utils/api';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface StudentReportsPageProps {
  studentId: number;
}

interface ReportSubmission {
  id: number;
  fileUrl: string;
  grade: number | null;
  feedback: string | null;
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

export function StudentReportsPage({ studentId }: StudentReportsPageProps) {
  const [reports, setReports] = useState<ReportSubmission[]>([]);
  const [practicals, setPracticals] = useState<Practical[]>([]);
  const [selectedPracticalId, setSelectedPracticalId] = useState<string>('');
  const [fileUrl, setFileUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchReports();
    fetchPracticals();
  }, [studentId]);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const response = await get(`/api/reports?studentId=${studentId}`);
      if (response.success && response.data) {
        setReports(response.data);
      } else {
        toast.error(response.message || 'Failed to fetch reports');
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

  const submitReport = async () => {
    if (!selectedPracticalId) {
      toast.error('Please select a practical session');
      return;
    }

    if (!fileUrl.trim()) {
      toast.error('Please provide a file URL or description');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await post('/api/reports/submit', {
        studentId,
        practicalId: parseInt(selectedPracticalId),
        fileUrl: fileUrl.trim(),
      });

      if (response.success) {
        toast.success('Report submitted successfully!');
        setSelectedPracticalId('');
        setFileUrl('');
        fetchReports();
      } else {
        toast.error(response.message || 'Failed to submit report');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getGradeColor = (grade: number | null) => {
    if (grade === null) return 'bg-gray-100 text-gray-700';
    if (grade >= 80) return 'bg-green-100 text-green-700';
    if (grade >= 60) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Submit Report</h2>
        <p className="text-gray-600">Submit your practical reports</p>
      </div>

      {/* Submit Report Card */}
      <Card>
        <CardHeader>
          <CardTitle>Submit New Report</CardTitle>
          <CardDescription>Select a practical session and submit your report</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="practical">Select Practical Session</Label>
            <Select value={selectedPracticalId} onValueChange={setSelectedPracticalId}>
              <SelectTrigger id="practical">
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
          <div className="space-y-2">
            <Label htmlFor="fileUrl">Report File URL or Description</Label>
            <Textarea
              id="fileUrl"
              placeholder="Enter file URL or paste report content here..."
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              rows={6}
            />
            <p className="text-xs text-gray-500">
              Note: In production, you would upload a file. For now, paste the file URL or report content.
            </p>
          </div>
          <Button
            onClick={submitReport}
            disabled={isSubmitting || !selectedPracticalId || !fileUrl.trim()}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Submit Report
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Submitted Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Submitted Reports</CardTitle>
          <CardDescription>View all your submitted reports and grades</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No reports submitted yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <Card key={report.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{report.practical.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {report.practical.subject} - {report.practical.lab}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{report.practical.subject}</Badge>
                        {report.grade !== null && (
                          <Badge className={getGradeColor(report.grade)}>
                            {report.grade.toFixed(1)}%
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm text-gray-600">
                        <p><strong>Submitted:</strong> {new Date(report.createdAt).toLocaleDateString()}</p>
                        <p><strong>Practical Date:</strong> {new Date(report.practical.dateTime).toLocaleDateString()}</p>
                      </div>
                      
                      {report.grade !== null && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                            <span className="font-semibold text-lg">
                              Grade: {report.grade.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {report.feedback && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm font-semibold mb-1">Feedback:</p>
                          <p className="text-sm text-gray-700">{report.feedback}</p>
                        </div>
                      )}
                      
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(report.fileUrl, '_blank')}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          View Report
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}



