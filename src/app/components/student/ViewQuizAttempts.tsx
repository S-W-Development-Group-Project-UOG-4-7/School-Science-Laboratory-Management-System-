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
import { Loader2, Award, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { get } from '@/utils/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

interface ViewQuizAttemptsProps {
  studentId: number;
}

interface QuizAttempt {
  id: number;
  score: number;
  createdAt: string;
  quiz: {
    id: number;
    title: string;
    totalMarks: number;
    practical: {
      id: number;
      title: string;
      subject: string;
      lab: string;
    };
  };
}

export function ViewQuizAttempts({ studentId }: ViewQuizAttemptsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAttempts();
    }
  }, [isOpen, studentId]);

  const fetchAttempts = async () => {
    setIsLoading(true);
    try {
      const response = await get(`/api/quizzes/attempt?studentId=${studentId}`);
      if (response.success && response.data) {
        setAttempts(response.data);
        if (response.data.length === 0) {
          toast.info('No quiz attempts found');
        }
      } else {
        toast.error(response.message || 'Failed to fetch quiz attempts');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-700';
    if (score >= 60) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Great';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Pass';
    return 'Needs Improvement';
  };

  const averageScore = attempts.length > 0
    ? attempts.reduce((sum, attempt) => sum + attempt.score, 0) / attempts.length
    : 0;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="hover:bg-blue-50 hover:border-blue-300">
          <Award className="w-4 h-4 mr-2" />
          Quiz Scores
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quiz Attempts & Scores</DialogTitle>
          <DialogDescription>
            View your past quiz attempts and performance scores
          </DialogDescription>
        </DialogHeader>
        
        {/* Summary */}
        {attempts.length > 0 && (
          <Card className="mb-4 bg-gradient-to-r from-blue-50 to-purple-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Attempts</p>
                  <p className="text-2xl font-bold">{attempts.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Average Score</p>
                  <p className="text-2xl font-bold">{averageScore.toFixed(1)}%</p>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : attempts.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <Award className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>No quiz attempts found</p>
            <p className="text-sm mt-2">Complete quizzes to see your scores here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {attempts.map((attempt) => (
              <Card key={attempt.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{attempt.quiz.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {attempt.quiz.practical.title} - {attempt.quiz.practical.lab}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant="outline">{attempt.quiz.practical.subject}</Badge>
                      <Badge className={getScoreColor(attempt.score)}>
                        {attempt.score.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        <p><strong>Attempted:</strong> {new Date(attempt.createdAt).toLocaleDateString()}</p>
                        <p><strong>Total Marks:</strong> {attempt.quiz.totalMarks}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-600">
                          {getScoreBadge(attempt.score)}
                        </p>
                      </div>
                    </div>
                    
                    {/* Score Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          attempt.score >= 80 ? 'bg-green-500' :
                          attempt.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(attempt.score, 100)}%` }}
                      />
                    </div>
                    
                    <div className="text-center pt-2">
                      <p className="text-2xl font-bold" style={{ color: getScoreColor(attempt.score).split(' ')[1] }}>
                        {attempt.score.toFixed(1)} / {attempt.quiz.totalMarks}
                      </p>
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

