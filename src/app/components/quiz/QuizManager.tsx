'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Plus } from 'lucide-react';
import { Quiz, QuizAttempt, UserRole, QuizStatus } from '@/lib/types'; 
import { QuizForm } from './QuizForm';
import { QuizCard } from './QuizCard';
import { QuizAttemptsView } from './QuizAttemptsView';
import { Loader2 } from 'lucide-react';

interface QuizManagerProps {
  practicalId: string;
  userRole: UserRole;
  quizzes?: Quiz[];
  onAddQuiz?: (quiz: any) => void;
  onEditQuiz?: (id: string, quiz: Partial<Quiz>) => void;
  onDeleteQuiz?: (id: string) => void;
  quizAttempts?: QuizAttempt[];
}

export function QuizManager({ 
  practicalId, 
  userRole, 
  quizzes: initialQuizzes = [],
  onAddQuiz,
  onEditQuiz,
  onDeleteQuiz,
  quizAttempts = []
}: QuizManagerProps) {
  const [isAddQuizOpen, setIsAddQuizOpen] = useState(false);
  const [selectedQuizForAttempts, setSelectedQuizForAttempts] = useState<Quiz | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>(initialQuizzes);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user can manage quizzes
  const canManage = ['teacher', 'lab-assistant', 'admin', 'principal'].includes(userRole);

  // Simple initialization - NO async calls
  useEffect(() => {
    console.log('QuizManager mounted with practicalId:', practicalId);
    // Just use the initial quizzes
    if (initialQuizzes.length > 0) {
      setQuizzes(initialQuizzes);
    }
  }, [practicalId, initialQuizzes]);

  // Remove the fetchQuizzes function entirely for now
  // const fetchQuizzes = async () => { ... }

  const handleAddQuiz = async (quizData: any) => {
    try {
      setError(null);
      
      // Create a new quiz object
      const newQuiz: Quiz = {
        id: Date.now(),
        title: quizData.title || 'New Quiz',
        description: quizData.description || null,
        practicalId: parseInt(practicalId) || 1,
        totalMarks: quizData.totalMarks || quizData.questions?.reduce((sum: number, q: any) => sum + (q.marks || 1), 0) || 100,
        passingMarks: quizData.passingMarks || 60,
        timeLimit: quizData.timeLimit !== undefined ? quizData.timeLimit : null,
        status: QuizStatus.DRAFT,
        teacherId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        questions: quizData.questions || [],
        isPublished: false
      };
      
      console.log('Creating quiz:', newQuiz);
      
      // Add to local state
      setQuizzes(prev => [newQuiz, ...prev]);
      
      // Call parent callback if provided
      if (onAddQuiz) {
        onAddQuiz(quizData);
      }
      
      setIsAddQuizOpen(false);
      return true;
    } catch (error: any) {
      console.error('Error creating quiz:', error);
      setError(`Failed to create quiz: ${error.message || 'Unknown error'}`);
      alert('Failed to create quiz. Please try again.');
      return false;
    }
  };

  const handleEditQuiz = async (quizId: string, updates: Partial<Quiz>) => {
    try {
      setRefreshing(true);
      setError(null);
      
      const numericQuizId = parseInt(quizId);
      
      // Update local state
      setQuizzes(prev => prev.map(q => {
        if (q.id === numericQuizId) {
          return {
            ...q,
            ...updates,
            updatedAt: new Date(),
            isPublished: updates.status === QuizStatus.PUBLISHED
          };
        }
        return q;
      }));
      
      // Call parent callback if provided
      if (onEditQuiz) {
        onEditQuiz(quizId, updates);
      }
      
      return true;
    } catch (error: any) {
      console.error('Error updating quiz:', error);
      setError(`Failed to update quiz: ${error.message || 'Unknown error'}`);
      alert('Failed to update quiz. Please try again.');
      return false;
    } finally {
      setRefreshing(false);
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm('Are you sure you want to delete this quiz? All questions and attempts will also be deleted.')) {
      return false;
    }

    try {
      setRefreshing(true);
      setError(null);
      
      const numericQuizId = parseInt(quizId);
      
      // Update local state
      setQuizzes(prev => prev.filter(q => q.id !== numericQuizId));
      
      // Call parent callback if provided
      if (onDeleteQuiz) {
        onDeleteQuiz(quizId);
      }
      
      return true;
    } catch (error: any) {
      console.error('Error deleting quiz:', error);
      setError(`Failed to delete quiz: ${error.message || 'Unknown error'}`);
      alert('Failed to delete quiz. Please try again.');
      return false;
    } finally {
      setRefreshing(false);
    }
  };

  const handleViewAttempts = (quiz: Quiz) => {
    setSelectedQuizForAttempts(quiz);
  };

  const handleRefresh = () => {
    // Simple refresh - just log for now
    console.log('Refresh clicked');
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Quizzes</h3>
          <Button size="sm" variant="outline" disabled>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Loading...
          </Button>
        </div>
        <Card className="border-dashed border-2">
          <CardContent className="py-12 text-center">
            <Loader2 className="w-8 h-8 mx-auto animate-spin text-gray-400" />
            <p className="mt-2 text-gray-500">Loading quizzes...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Quizzes</h3>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              'Refresh'
            )}
          </Button>
          
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
                  onSubmit={async (quizData) => {
                    const success = await handleAddQuiz(quizData);
                    if (success) {
                      setIsAddQuizOpen(false);
                    }
                  }}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
          <Button 
            size="sm" 
            variant="ghost" 
            className="mt-1 text-red-700 hover:text-red-800 hover:bg-red-100"
            onClick={() => setError(null)}
          >
            Dismiss
          </Button>
        </div>
      )}

      {quizzes.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="py-8 text-center">
            <p className="text-gray-500">No quizzes added yet</p>
            {canManage && (
              <Button 
                variant="outline" 
                className="mt-2" 
                onClick={() => setIsAddQuizOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Quiz
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {quizzes.map((quiz) => {
            // Calculate attempt count
            const attemptCount = quizAttempts.filter(a => 
              a.quizId === quiz.id
            ).length;
            
            return (
              <QuizCard
                key={quiz.id}
                quiz={quiz}
                userRole={userRole}
                onEdit={handleEditQuiz}
                onDelete={handleDeleteQuiz}
                attemptCount={attemptCount}
                onViewAttempts={() => handleViewAttempts(quiz)}
              />
            );
          })}
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
              attempts={quizAttempts.filter(a => 
                a.quizId === selectedQuizForAttempts.id
              )} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}