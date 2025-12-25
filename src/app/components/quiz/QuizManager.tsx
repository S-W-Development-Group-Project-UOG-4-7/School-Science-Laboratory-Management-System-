'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Plus, Edit, Trash2, Eye, BarChart3, Users, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Quiz, QuizAttempt, UserRole } from '@/lib/types'; 
import { QuizForm } from './QuizForm';
import { QuizCard } from './QuizCard';
import { QuizAttemptsView } from './QuizAttemptsView';

interface QuizManagerProps {
  practicalId: string;
  userRole: UserRole;
  quizzes: Quiz[];
  onAddQuiz: (quiz: Omit<Quiz, 'id' | 'createdAt'>) => void;
  onEditQuiz: (id: string, quiz: Partial<Quiz>) => void;
  onDeleteQuiz: (id: string) => void;
  quizAttempts: QuizAttempt[];
}

export function QuizManager({ 
  practicalId, 
  userRole, 
  quizzes,
  onAddQuiz,
  onEditQuiz,
  onDeleteQuiz,
  quizAttempts 
}: QuizManagerProps) {
  const [isAddQuizOpen, setIsAddQuizOpen] = useState(false);
  const [selectedQuizForAttempts, setSelectedQuizForAttempts] = useState<Quiz | null>(null);

  const canManage = userRole === 'teacher' || userRole === 'lab-assistant' || userRole === 'admin';

  const handleViewAttempts = (quiz: Quiz) => {
    setSelectedQuizForAttempts(quiz);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Quizzes</h3>
        {canManage && (
          <Dialog open={isAddQuizOpen} onOpenChange={setIsAddQuizOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-gradient-to-r from-emerald-600 to-emerald-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Quiz
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Quiz</DialogTitle>
                <DialogDescription>
                  Add quiz questions for this practical
                </DialogDescription>
              </DialogHeader>
              <QuizForm
                practicalId={practicalId}
                onSubmit={(quizData) => {
                  onAddQuiz(quizData);
                  setIsAddQuizOpen(false);
                }}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {quizzes.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="py-8 text-center">
            <p className="text-gray-500">No quizzes added yet</p>
            {canManage && (
              <Button variant="outline" className="mt-2" onClick={() => setIsAddQuizOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Quiz
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {quizzes.map((quiz) => (
            <QuizCard
              key={quiz.id}
              quiz={quiz}
              userRole={userRole}
              onEdit={onEditQuiz}
              onDelete={onDeleteQuiz}
              attemptCount={quizAttempts.filter(a => a.quizId === quiz.id).length}
              onViewAttempts={() => handleViewAttempts(quiz)}
            />
          ))}
        </div>
      )}

      {/* View Attempts Dialog */}
      <Dialog open={!!selectedQuizForAttempts} onOpenChange={(open) => !open && setSelectedQuizForAttempts(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {selectedQuizForAttempts?.title} - Attempts
            </DialogTitle>
            <DialogDescription>
              View student submissions and marks
            </DialogDescription>
          </DialogHeader>
          {selectedQuizForAttempts && (
            <QuizAttemptsView 
              attempts={quizAttempts.filter(a => a.quizId === selectedQuizForAttempts.id)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}