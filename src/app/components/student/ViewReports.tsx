'use client';

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Loader2, FileText, ExternalLink, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { get } from '@/utils/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

interface ViewReportsProps {
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

export function ViewReports({ studentId }: ViewReportsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reports, setReports] = useState<ReportSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchReports();
    }
  }, [isOpen, studentId]);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const response = await get(`/api/reports?studentId=${studentId}`);
      if (response.success && response.data) {
        setReports(response.data);
        if (response.data.length === 0) {
          toast.info('No reports submitted yet');
        }
      } else {
        toast.error(response.message || 'Failed to fetch reports');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const getGradeColor = (grade: number | null) => {
    if (grade === null) return 'bg-gray-100 text-gray-700';
    if (grade >= 80) return 'bg-green-100 text-green-700';
    if (grade >= 60) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="hover:bg-blue-50 hover:border-blue-300">
          <FileText className="w-4 h-4 mr-2" />
          View Reports
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Submitted Reports</DialogTitle>
          <DialogDescription>
            View all your submitted practical reports and grades
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : reports.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>No reports submitted yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <Card key={report.id}>
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
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Report
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

