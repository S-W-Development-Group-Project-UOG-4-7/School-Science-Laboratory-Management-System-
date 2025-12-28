'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Plus } from 'lucide-react';
import { Quiz, QuizAttempt, UserRole, QuizStatus, CreateQuizInput, Question, QuestionType } from '@/lib/types'; 
import { QuizForm } from './QuizForm';
import { QuizCard } from './QuizCard';
import { QuizAttemptsView } from './QuizAttemptsView';
import { quizService } from '@/services/quizService';
import { Loader2 } from 'lucide-react';

interface QuizManagerProps {
  practicalId: string;
  userRole: UserRole;
  quizzes?: Quiz[];
  onAddQuiz?: (quiz: Omit<Quiz, 'id' | 'createdAt'>) => void;
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

  const canManage = userRole === 'teacher' || userRole === 'lab-assistant' || userRole === 'admin';

  // Fetch quizzes from database on mount
  useEffect(() => {
    fetchQuizzes();
  }, [practicalId]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const numericPracticalId = parseInt(practicalId);
      const fetchedQuizzes = await quizService.getAll(numericPracticalId);
      
      // Ensure isPublished is set correctly
      const formattedQuizzes = fetchedQuizzes.map(quiz => ({
        ...quiz,
        isPublished: quiz.isPublished || quiz.status === QuizStatus.PUBLISHED
      }));
      
      setQuizzes(formattedQuizzes);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      // Keep initial quizzes if fetch fails
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuiz = async (quizData: Omit<Quiz, 'id' | 'createdAt'>) => {
    try {
      // Convert questions to proper format
      const questions = quizData.questions?.map((q: any, index: number) => ({
        question: q.question,
        type: q.type,
        options: q.options || [],
        correctAnswer: q.correctAnswer || '',
        correctAnswers: q.correctAnswers || [],
        marks: q.marks || 1,
        explanation: q.explanation || '',
        order: index
      })) || [];

      // Convert to CreateQuizInput - handle null description properly
      const createData: CreateQuizInput = {
        title: quizData.title,
        description: quizData.description || null,
        practicalId: parseInt(practicalId),
        teacherId: 1, // Get from auth/session - this should be dynamic
        status: quizData.status || QuizStatus.DRAFT,
        totalMarks: quizData.totalMarks || 100,
        passingMarks: quizData.passingMarks || 60,
        timeLimit: quizData.timeLimit !== undefined ? quizData.timeLimit : null,
        questions: questions
      };
      
      const newQuiz = await quizService.create(createData);
      
      // Ensure isPublished is set
      const formattedQuiz = {
        ...newQuiz,
        isPublished: newQuiz.isPublished || newQuiz.status === QuizStatus.PUBLISHED
      };
      
      setQuizzes([formattedQuiz, ...quizzes]);
      
      // Call parent callback if provided
      if (onAddQuiz) {
        onAddQuiz(quizData);
      }
      
      setIsAddQuizOpen(false);
      return true;
    } catch (error) {
      console.error('Error creating quiz:', error);
      alert('Failed to create quiz. Please try again.');
      return false;
    }
  };

  const handleEditQuiz = async (quizId: string, updates: Partial<Quiz>) => {
    try {
      setRefreshing(true);
      const numericQuizId = parseInt(quizId);
      
      // Prepare update data - handle null description
      const updateData: any = {
        ...updates
      };
      
      // If isPublished is being set, update status accordingly
      if (updates.isPublished !== undefined) {
        updateData.status = updates.isPublished ? QuizStatus.PUBLISHED : QuizStatus.DRAFT;
      }
      
      // Handle description - convert undefined to null for database
      if ('description' in updates) {
        updateData.description = updates.description || null;
      }
      
      // Handle timeLimit - convert undefined to null for database
      if ('timeLimit' in updates) {
        updateData.timeLimit = updates.timeLimit !== undefined ? updates.timeLimit : null;
      }
      
      const updatedQuiz = await quizService.update(numericQuizId, updateData);
      
      // Ensure isPublished is set
      const formattedQuiz = {
        ...updatedQuiz,
        isPublished: updatedQuiz.isPublished || updatedQuiz.status === QuizStatus.PUBLISHED
      };
      
      // Update local state
      setQuizzes(quizzes.map(q => 
        q.id === formattedQuiz.id ? formattedQuiz : q
      ));
      
      // Call parent callback if provided
      if (onEditQuiz) {
        onEditQuiz(quizId, updates);
      }
      
      return true;
    } catch (error) {
      console.error('Error updating quiz:', error);
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
      const numericQuizId = parseInt(quizId);
      await quizService.delete(numericQuizId);
      
      // Update local state
      setQuizzes(quizzes.filter(q => q.id.toString() !== quizId));
      
      // Call parent callback if provided
      if (onDeleteQuiz) {
        onDeleteQuiz(quizId);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting quiz:', error);
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
    fetchQuizzes();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Quizzes</h3>
          {canManage && (
            <Button size="sm" variant="outline" disabled>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Loading...
            </Button>
          )}
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
              <Loader2 className="w-4 h-4 animate-spin" />
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
              a.quizId.toString() === quiz.id.toString()
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
                a.quizId.toString() === selectedQuizForAttempts.id.toString()
              )} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}