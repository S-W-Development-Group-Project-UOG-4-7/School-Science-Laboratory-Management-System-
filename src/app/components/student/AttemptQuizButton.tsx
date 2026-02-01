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
import { Loader2, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';

interface AttemptQuizButtonProps {
  studentId: string;
  practicalId: string;
  onSuccess?: () => void;
  customIcon?: React.ReactNode;
  buttonLabel?: string;
}

interface QuizQuestion {
  id: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string; // Added for local validation
  marks: number;
}

interface Quiz {
  id: string;
  title: string;
  totalMarks: number;
  questions: QuizQuestion[];
}

const DUMMY_QUIZ: Quiz = {
  id: 'dummy-1',
  title: 'Practical Knowledge Check',
  totalMarks: 100,
  questions: [
    {
      id: '1',
      questionText: 'What is the primary safety precaution when handling acids?',
      optionA: 'Taste it to check concentration',
      optionB: 'Wear safety goggles and gloves',
      optionC: 'Keep it near open flames',
      optionD: 'Pour water into acid',
      correctOption: 'B',
      marks: 30
    },
    {
      id: '2',
      questionText: 'Which instrument is best for measuring volume precisely?',
      optionA: 'Beaker',
      optionB: 'Test Tube',
      optionC: 'Volumetric Flask',
      optionD: 'Dropper',
      correctOption: 'C',
      marks: 30
    },
    {
      id: '3',
      questionText: 'What is the color of Phenolphthalein in a base?',
      optionA: 'Colorless',
      optionB: 'Pink',
      optionC: 'Blue',
      optionD: 'Red',
      correctOption: 'B',
      marks: 40
    }
  ]
};

export function AttemptQuizButton({
  studentId,
  practicalId,
  onSuccess,
  customIcon,
  buttonLabel = 'Attempt Quiz',
}: AttemptQuizButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAttempted, setHasAttempted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Simulate fetch
      setQuiz(DUMMY_QUIZ);
    }
  }, [isOpen]);

  const handleAnswerChange = (questionId: string, answer: string) => {
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

    // Simulate network delay
    setTimeout(() => {
      // Calculate score locally
      let totalEarned = 0;
      quiz.questions.forEach(q => {
        if (answers[q.id] === q.correctOption) {
          totalEarned += q.marks;
        }
      });

      setScore(totalEarned);
      setHasAttempted(true);
      toast.success('Quiz submitted successfully!');
      onSuccess?.();
      setIsSubmitting(false);
      setIsOpen(false); // Close dialog on success
    }, 1000);
  };

  // If attempted, display Score instead of the button
  if (hasAttempted && score !== null) {
    return (
      <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold border border-green-200 shadow-sm">
        Score: {score}%
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="hover:bg-blue-50 hover:border-blue-300"
        >
          {customIcon || <HelpCircle className="w-4 h-4 mr-2" />}
          {buttonLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{quiz?.title || 'Quiz'}</DialogTitle>
          <DialogDescription>
            Answer all questions. Your score will be calculated automatically.
          </DialogDescription>
        </DialogHeader>

        {quiz ? (
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
                    onValueChange={(value: string) => handleAnswerChange(question.id, value)}
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
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
