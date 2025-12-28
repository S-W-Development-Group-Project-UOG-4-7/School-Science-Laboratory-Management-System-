'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Edit, Trash2, Play, BarChart3, Users, Clock, CheckCircle } from 'lucide-react';
import { Quiz, UserRole, QuizStatus } from '@/lib/types';

interface QuizCardProps {
  quiz: Quiz;
  userRole: UserRole;
  onEdit: (id: string, quiz: Partial<Quiz>) => void;
  onDelete: (id: string) => void;
  attemptCount: number;
  onViewAttempts: () => void;
  onStartQuiz?: (quiz: Quiz) => void;
}

export function QuizCard({ 
  quiz, 
  userRole, 
  onEdit, 
  onDelete, 
  attemptCount,
  onViewAttempts,
  onStartQuiz 
}: QuizCardProps) {
  const canManage = userRole === 'teacher' || userRole === 'lab-assistant' || userRole === 'admin';
  const isStudent = userRole === 'student';

  // Convert quiz.id to string for the function calls
  const quizIdString = quiz.id.toString();
  
  // Safely get questions count
  const questionsCount = quiz.questions?.length || 0;
  
  // Safely get isPublished
  const isPublished = quiz.isPublished ?? quiz.status === QuizStatus.PUBLISHED;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{quiz.title}</CardTitle>
            <CardDescription>{quiz.description || 'No description'}</CardDescription>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            isPublished 
              ? 'bg-green-100 text-green-700' 
              : 'bg-yellow-100 text-yellow-700'
          }`}>
            {isPublished ? 'Published' : 'Draft'}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          {quiz.timeLimit && (
            <div className="px-2 py-1 rounded border text-xs flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {quiz.timeLimit} min
            </div>
          )}
          <div className="px-2 py-1 rounded border text-xs">
            {questionsCount} question{questionsCount !== 1 ? 's' : ''}
          </div>
          <div className="px-2 py-1 rounded border text-xs bg-blue-50">
            {quiz.totalMarks} marks total
          </div>
          <div className="px-2 py-1 rounded border text-xs bg-orange-50">
            Pass: {quiz.passingMarks}%
          </div>
          {canManage && attemptCount > 0 && (
            <div className="px-2 py-1 rounded border text-xs flex items-center gap-1">
              <Users className="w-3 h-3" />
              {attemptCount} attempt{attemptCount !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {isStudent ? (
            <Button 
              size="sm" 
              className="bg-gradient-to-r from-emerald-600 to-emerald-700"
              onClick={() => onStartQuiz?.(quiz)}
              disabled={!isPublished || questionsCount === 0}
            >
              <Play className="w-4 h-4 mr-2" />
              {questionsCount === 0 ? 'No Questions' : 'Start Quiz'}
            </Button>
          ) : (
            <>
              {attemptCount > 0 && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={onViewAttempts}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Results ({attemptCount})
                </Button>
              )}
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onEdit(quizIdString, { 
                  isPublished: !isPublished,
                  status: !isPublished ? QuizStatus.PUBLISHED : QuizStatus.DRAFT
                })}
              >
                <Edit className="w-4 h-4 mr-2" />
                {isPublished ? 'Unpublish' : 'Publish'}
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => onDelete(quizIdString)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}