'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Loader2, HelpCircle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { get } from '@/utils/api';
import { Badge } from '../ui/badge';
import { useRouter } from 'next/navigation';

interface StudentQuizzesPageProps {
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

export function StudentQuizzesPage({ studentId }: StudentQuizzesPageProps) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const router = useRouter();

  useEffect(() => {
    fetchQuizzes();
  }, [selectedSubject]);

  const fetchQuizzes = async () => {
    setIsLoading(true);
    try {
      const response = await get('/api/quizzes');
      if (response.success && response.data) {
        let filteredQuizzes = response.data;
        
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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Available Quizzes</h2>
        <p className="text-gray-600">Browse and attempt quizzes for practical sessions</p>
      </div>

      {/* Filter */}
      {quizzes.length > 0 && (
        <div className="flex gap-2">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <HelpCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>No quizzes available</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
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
                  
                  <Button
                    className="w-full"
                    onClick={() => {
                      // Navigate to quiz attempt page
                      // For now, we'll use the AttemptQuizButton component
                      toast.info('Use the "Attempt Quiz" button from the Practicals page or open quiz details');
                    }}
                  >
                    View Details
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}



