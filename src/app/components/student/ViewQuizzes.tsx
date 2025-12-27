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
import { Loader2, HelpCircle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { get } from '@/utils/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { AttemptQuizButton } from './AttemptQuizButton';

interface ViewQuizzesProps {
  studentId: number;
}

interface Quiz {
  id: number;
  title: string;
  totalMarks: number;
  createdAt: string;
  practical: {
    id: number;
    title: string;
    subject: string;
    lab: string;
    dateTime: string;
  };
  _count: {
    quizAttempts: number;
  };
}

export function ViewQuizzes({ studentId }: ViewQuizzesProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  useEffect(() => {
    if (isOpen) {
      fetchQuizzes();
    }
  }, [isOpen, selectedSubject]);

  const fetchQuizzes = async () => {
    setIsLoading(true);
    try {
      const response = await get('/api/quizzes');
      if (response.success && response.data) {
        let filteredQuizzes = response.data;
        
        // Filter by subject if selected
        if (selectedSubject !== 'all') {
          filteredQuizzes = filteredQuizzes.filter(
            (quiz: Quiz) => quiz.practical.subject.toLowerCase() === selectedSubject.toLowerCase()
          );
        }
        
        setQuizzes(filteredQuizzes);
        if (filteredQuizzes.length === 0) {
          toast.info('No quizzes available');
        }
      } else {
        toast.error(response.message || 'Failed to fetch quizzes');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const uniqueSubjects = Array.from(
    new Set(quizzes.map(quiz => quiz.practical.subject))
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="hover:bg-blue-50 hover:border-blue-300">
          <HelpCircle className="w-4 h-4 mr-2" />
          View Quizzes
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Available Quizzes</DialogTitle>
          <DialogDescription>
            Browse and attempt quizzes for practical sessions
          </DialogDescription>
        </DialogHeader>
        
        {/* Filter */}
        {quizzes.length > 0 && (
          <div className="mb-4">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Subjects</option>
              {uniqueSubjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : quizzes.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <HelpCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>No quizzes available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {quizzes.map((quiz) => (
              <Card key={quiz.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{quiz.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {quiz.practical.title} - {quiz.practical.lab}
                      </CardDescription>
                    </div>
                    <Badge variant="outline">{quiz.practical.subject}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-gray-600">
                      <p><strong>Total Marks:</strong> {quiz.totalMarks}</p>
                      <p><strong>Practical Date:</strong> {new Date(quiz.practical.dateTime).toLocaleDateString()}</p>
                      <p><strong>Created:</strong> {new Date(quiz.createdAt).toLocaleDateString()}</p>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <AttemptQuizButton
                        studentId={studentId}
                        practicalId={quiz.practical.id}
                        onSuccess={() => fetchQuizzes()}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          // Could navigate to quiz details or open questions view
                          toast.info('Quiz details coming soon');
                        }}
                      >
                        View Details
                        <ArrowRight className="w-4 h-4 ml-2" />
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



