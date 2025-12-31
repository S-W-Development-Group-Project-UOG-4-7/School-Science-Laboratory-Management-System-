'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Label } from '../ui/label';
import { Loader2, Upload, FileText, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { post, get } from '@/utils/api';
import { Card, CardContent } from '../ui/card';

interface SubmitReportButtonProps {
  studentId: number;
  practicalId: number;
  onSuccess?: () => void;
}

interface ReportSubmission {
  id: number;
  fileUrl: string;
  grade: number | null;
  feedback: string | null;
  createdAt: string;
}

export function SubmitReportButton({
  studentId,
  practicalId,
  onSuccess,
}: SubmitReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submission, setSubmission] = useState<ReportSubmission | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      checkExistingSubmission();
    }
  }, [isOpen, studentId, practicalId]);

  const checkExistingSubmission = async () => {
    try {
      const response = await get(`/api/reports?studentId=${studentId}`);
      if (response.success && response.data) {
        const existingSubmission = response.data.find(
          (sub: any) => sub.practicalId === practicalId
        );
        if (existingSubmission) {
          setHasSubmitted(true);
          setSubmission(existingSubmission);
        }
      }
    } catch (error) {
      // Silent fail
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(selectedFile.type)) {
        toast.error('Please upload a PDF or DOCX file');
        return;
      }
      setFile(selectedFile);
      // For now, we'll use a placeholder URL. In production, upload to storage service
      setFileUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    // In a real application, you would upload the file to a storage service (S3, Cloudinary, etc.)
    // and get the URL. For now, we'll simulate with a data URL or use a placeholder
    setIsUploading(true);

    try {
      // TODO: Upload file to storage service and get URL
      // For now, using a placeholder URL
      const uploadedFileUrl = fileUrl || `https://storage.example.com/reports/${studentId}-${practicalId}-${Date.now()}.pdf`;

      const response = await post('/api/reports/submit', {
        studentId,
        practicalId,
        fileUrl: uploadedFileUrl,
      });

      if (response.success) {
        toast.success('Report submitted successfully!');
        setFile(null);
        setFileUrl('');
        setIsOpen(false);
        setHasSubmitted(true);
        if (response.data) {
          setSubmission(response.data);
        }
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        onSuccess?.();
      } else {
        if (response.message?.includes('already')) {
          toast.error('You have already submitted a report for this practical');
          setHasSubmitted(true);
        } else {
          toast.error(response.message || 'Failed to submit report');
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            disabled={hasSubmitted}
            className="hover:bg-blue-50 hover:border-blue-300"
          >
            {hasSubmitted ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Report Submitted
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Submit Report
              </>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Practical Report</DialogTitle>
            <DialogDescription>
              Upload your practical report (PDF or DOCX format)
            </DialogDescription>
          </DialogHeader>
          {hasSubmitted && submission ? (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-semibold">Report Submitted</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      Submitted on {new Date(submission.createdAt).toLocaleDateString()}
                    </p>
                    {submission.grade !== null && (
                      <p className="text-lg font-semibold mt-2">
                        Grade: {submission.grade}%
                      </p>
                    )}
                    {submission.feedback && (
                      <div className="mt-2">
                        <p className="text-sm font-semibold">Feedback:</p>
                        <p className="text-sm text-gray-700 mt-1">{submission.feedback}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reportFile">Report File (PDF/DOCX) *</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-1">
                    {file ? file.name : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs text-gray-500">PDF or DOCX up to 10MB</p>
                  <input
                    ref={fileInputRef}
                    id="reportFile"
                    type="file"
                    accept=".pdf,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isUploading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    Select File
                  </Button>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={isUploading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isUploading || !file}>
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Submit Report
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}





