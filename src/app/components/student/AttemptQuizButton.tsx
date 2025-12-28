'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Loader2, HelpCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { get, post } from '@/utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';

interface AttemptQuizButtonProps {
  studentId: number;
  practicalId: number;
  onSuccess?: () => void;
  customIcon?: React.ReactNode;
  buttonLabel?: string;
}

interface QuizQuestion {
  id: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  marks: number;
}

interface Quiz {
  id: number;
  title: string;
  totalMarks: number;
  questions: QuizQuestion[];
}

export function AttemptQuizButton({
  studentId,
  practicalId,
  onSuccess,
  customIcon,
  buttonLabel = 'Attempt Quiz',
}: AttemptQuizButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAttempted, setHasAttempted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchQuiz();
    }
  }, [isOpen, practicalId]);

  const fetchQuiz = async () => {
    setIsLoading(true);
    try {
      const response = await get(`/api/quizzes?practicalId=${practicalId}`);
      if (response.success && response.data && response.data.length > 0) {
        setQuiz(response.data[0]); // Get first quiz
      } else {
        toast.info('No quiz available for this practical');
        setIsOpen(false);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch quiz');
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleSubmit = async () => {
    if (!quiz) return;

    // Check if all questions are answered
    const unansweredQuestions = quiz.questions.filter(
      (q) => !answers[q.id]
    );
    if (unansweredQuestions.length > 0) {
      toast.error(`Please answer all ${unansweredQuestions.length} remaining question(s)`);
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert answers to the format expected by the API
      const answersPayload: Record<string, string> = {};
      Object.keys(answers).forEach((key) => {
        answersPayload[key] = answers[parseInt(key)];
      });

      const response = await post('/api/quizzes/attempt', {
        quizId: quiz.id,
        studentId,
        answers: answersPayload,
      });

      if (response.success) {
        if (response.data?.detailedScore) {
          setScore(response.data.detailedScore.percentage);
        } else if (response.data?.score) {
          setScore(response.data.score);
        }
        setHasAttempted(true);
        toast.success('Quiz submitted successfully!');
        onSuccess?.();
      } else {
        if (response.message?.includes('already')) {
          toast.error('You have already attempted this quiz');
          setHasAttempted(true);
        } else {
          toast.error(response.message || 'Failed to submit quiz');
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          disabled={hasAttempted}
          className="hover:bg-blue-50 hover:border-blue-300"
        >
          {hasAttempted ? (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Quiz Completed
            </>
          ) : (
            <>
              {customIcon || <HelpCircle className="w-4 h-4 mr-2" />}
              {buttonLabel}
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{quiz?.title || 'Quiz'}</DialogTitle>
          <DialogDescription>
            Answer all questions. Your score will be calculated automatically.
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : hasAttempted && score !== null ? (
          <Card>
            <CardHeader>
              <CardTitle>Quiz Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="text-6xl font-bold text-blue-600 mb-4">
                  {score.toFixed(1)}%
                </div>
                <p className="text-lg text-gray-600">
                  Your score: {score.toFixed(1)} out of {quiz?.totalMarks || 100}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : quiz ? (
          <div className="space-y-6">
            {quiz.questions.map((question, index) => (
              <Card key={question.id}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Question {index + 1} ({question.marks} marks)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-gray-700">{question.questionText}</p>
                  <RadioGroup
                    value={answers[question.id] || ''}
                    onValueChange={(value) => handleAnswerChange(question.id, value)}
                    disabled={isSubmitting}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="A" id={`q${question.id}-A`} />
                        <Label htmlFor={`q${question.id}-A`} className="cursor-pointer">
                          A. {question.optionA}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="B" id={`q${question.id}-B`} />
                        <Label htmlFor={`q${question.id}-B`} className="cursor-pointer">
                          B. {question.optionB}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="C" id={`q${question.id}-C`} />
                        <Label htmlFor={`q${question.id}-C`} className="cursor-pointer">
                          C. {question.optionC}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="D" id={`q${question.id}-D`} />
                        <Label htmlFor={`q${question.id}-D`} className="cursor-pointer">
                          D. {question.optionD}
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            ))}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Quiz'
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-gray-500">
            <p>No quiz available</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}



