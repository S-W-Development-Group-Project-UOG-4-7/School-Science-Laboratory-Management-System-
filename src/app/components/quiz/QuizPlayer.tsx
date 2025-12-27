'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Quiz, QuizAttempt, QuizQuestion, QuizAnswer } from '@/lib/types';

interface QuizPlayerProps {
  quiz: Quiz;
  onSubmit: (attempt: Omit<QuizAttempt, 'id' | 'startedAt' | 'completedAt'>) => void; // Changed to QuizAttempt
  onClose: () => void;
}

export function QuizPlayer({ quiz, onSubmit, onClose }: QuizPlayerProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [timeLeft, setTimeLeft] = useState(quiz.timeLimit ? quiz.timeLimit * 60 : 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [results, setResults] = useState<{
    obtainedMarks: number;
    percentage: number;
    passed: boolean;
  } | null>(null);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  // Timer effect
  useEffect(() => {
    if (!quiz.timeLimit || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quiz.timeLimit, timeLeft]);

  const handleAnswerChange = (questionId: string, answer: string | string[]) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    setIsSubmitting(true);

    // Calculate score
    let obtainedMarks = 0;
    const answerResults: QuizAnswer[] = [];

    quiz.questions.forEach((question) => {
      const questionId = question.id.toString();
      const userAnswer = answers[questionId];
      let isCorrect = false;
      let marksObtained = 0;

      if (userAnswer) {
        if (question.type === 'msq') {
          // Multiple select question
          const userAnswers = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
          const correctAnswers = question.correctAnswers || [];
          
          // Check if all correct answers are selected and no incorrect ones
          const allCorrectSelected = correctAnswers.every((ans: string) => 
            userAnswers.includes(ans)
          );
          const noIncorrectSelected = userAnswers.every((ans: string) => 
            correctAnswers.includes(ans)
          );
          
          isCorrect = allCorrectSelected && noIncorrectSelected;
        } else {
          // Single answer question
          isCorrect = userAnswer === question.correctAnswer;
        }

        marksObtained = isCorrect ? question.marks : 0;
        obtainedMarks += marksObtained;
      }

      answerResults.push({
        questionId: question.id.toString(),
        answer: Array.isArray(userAnswer) ? JSON.stringify(userAnswer) : (userAnswer || ''),
        isCorrect,
        marksObtained,
      });
    });

    const percentage = (obtainedMarks / quiz.totalMarks) * 100;
    const passed = percentage >= quiz.passingMarks;

    setResults({
      obtainedMarks,
      percentage,
      passed,
    });
    setIsCompleted(true);
    setIsSubmitting(false);

    // Submit QUIZ ATTEMPT (not quiz)
    onSubmit({
      quizId: quiz.id.toString(),
      studentId: 'current-student-id', // Replace with actual student ID
      studentName: 'Current Student', // Replace with actual student name
      answers: answerResults,
      totalMarks: quiz.totalMarks,
      obtainedMarks,
      percentage,
      passed,
      status: 'completed', // This is correct for QuizAttempt
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isCompleted && results) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Quiz Results</DialogTitle>
            <DialogDescription>
              You have completed the quiz!
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto w-32 h-32 rounded-full flex items-center justify-center mb-4">
                {results.passed ? (
                  <div className="bg-green-100 p-8 rounded-full">
                    <CheckCircle className="w-16 h-16 text-green-600" />
                  </div>
                ) : (
                  <div className="bg-red-100 p-8 rounded-full">
                    <XCircle className="w-16 h-16 text-red-600" />
                  </div>
                )}
              </div>
              
              <h3 className="text-2xl font-bold mb-2">
                {results.passed ? 'Congratulations!' : 'Try Again!'}
              </h3>
              <p className="text-gray-600 mb-6">
                {results.passed 
                  ? `You passed the quiz with ${results.percentage.toFixed(1)}%`
                  : `You scored ${results.percentage.toFixed(1)}%. Need ${quiz.passingMarks}% to pass.`}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-blue-600">{results.obtainedMarks}</div>
                  <div className="text-sm text-gray-600">Marks Obtained</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-blue-600">{quiz.totalMarks}</div>
                  <div className="text-sm text-gray-600">Total Marks</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-blue-600">{results.percentage.toFixed(1)}%</div>
                  <div className="text-sm text-gray-600">Percentage</div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Your Answers:</h4>
              {quiz.questions.map((question, index) => {
                const questionId = question.id.toString();
                const userAnswer = answers[questionId];
                const result = results.obtainedMarks > 0 ? 
                  (Array.isArray(userAnswer) 
                    ? JSON.parse(userAnswer as any)
                    : userAnswer) : null;
                
                return (
                  <Card key={questionId}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                          result ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          <span className="text-sm font-medium">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium mb-2">{question.question}</h5>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>
                              <span className="font-medium">Your answer: </span>
                              {Array.isArray(userAnswer) 
                                ? userAnswer.join(', ')
                                : userAnswer || 'Not answered'}
                            </div>
                            {question.correctAnswer && (
                              <div>
                                <span className="font-medium">Correct answer: </span>
                                {question.correctAnswer}
                              </div>
                            )}
                            {question.correctAnswers && (
                              <div>
                                <span className="font-medium">Correct answers: </span>
                                {question.correctAnswers.join(', ')}
                              </div>
                            )}
                            {question.explanation && (
                              <div className="mt-2 p-3 bg-blue-50 rounded-md">
                                <span className="font-medium">Explanation: </span>
                                {question.explanation}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="flex justify-end">
              <Button onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle>{quiz.title}</DialogTitle>
              <DialogDescription>
                Question {currentQuestionIndex + 1} of {quiz.questions.length}
              </DialogDescription>
            </div>
            {quiz.timeLimit && (
              <div className="flex items-center gap-2 text-red-600 font-medium">
                <Clock className="w-4 h-4" />
                {formatTime(timeLeft)}
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{currentQuestionIndex + 1}/{quiz.questions.length}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Question */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <h3 className="text-lg font-medium">
                  {currentQuestion.question}
                </h3>

                {/* Multiple Choice */}
                {currentQuestion.type === 'multiple-choice' && (
                  <RadioGroup
                    value={answers[currentQuestion.id.toString()] as string || ''}
                    onValueChange={(value) => handleAnswerChange(currentQuestion.id.toString(), value)}
                  >
                    <div className="space-y-3">
                      {currentQuestion.options?.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <RadioGroupItem value={option} id={`option-${index}`} />
                          <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                )}

                {/* Multiple Select (MSQ) */}
                {currentQuestion.type === 'msq' && (
                  <div className="space-y-3">
                    {currentQuestion.options?.map((option, index) => {
                      const currentAnswers = answers[currentQuestion.id.toString()] as string[] || [];
                      return (
                        <div key={index} className="flex items-center space-x-2">
                          <Checkbox
                            id={`msq-option-${index}`}
                            checked={currentAnswers.includes(option)}
                            onCheckedChange={(checked) => {
                              const newAnswers = checked
                                ? [...currentAnswers, option]
                                : currentAnswers.filter((ans: string) => ans !== option);
                              handleAnswerChange(currentQuestion.id.toString(), newAnswers);
                            }}
                          />
                          <Label htmlFor={`msq-option-${index}`} className="flex-1 cursor-pointer">
                            {option}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* True/False */}
                {currentQuestion.type === 'true-false' && (
                  <RadioGroup
                    value={answers[currentQuestion.id.toString()] as string || ''}
                    onValueChange={(value) => handleAnswerChange(currentQuestion.id.toString(), value)}
                  >
                    <div className="space-y-3">
                      {['True', 'False'].map((option) => (
                        <div key={option} className="flex items-center space-x-2">
                          <RadioGroupItem value={option} id={`tf-${option}`} />
                          <Label htmlFor={`tf-${option}`} className="flex-1 cursor-pointer">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                )}

                {/* Short Answer */}
                {currentQuestion.type === 'short-answer' && (
                  <Input
                    value={answers[currentQuestion.id.toString()] as string || ''}
                    onChange={(e) => handleAnswerChange(currentQuestion.id.toString(), e.target.value)}
                    placeholder="Type your answer here..."
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentQuestionIndex === 0 || isSubmitting}
            >
              Previous
            </Button>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              
              <Button
                onClick={handleNext}
                disabled={isSubmitting}
              >
                {currentQuestionIndex === quiz.questions.length - 1 ? 'Submit' : 'Next'}
              </Button>
            </div>
          </div>

          {/* Question Navigation */}
          <div className="grid grid-cols-5 gap-2">
            {quiz.questions.map((question, index) => {
              const questionId = question.id.toString();
              const isAnswered = answers[questionId];
              const isCurrent = index === currentQuestionIndex;
              
              return (
                <Button
                  key={questionId}
                  variant={isCurrent ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={isAnswered ? "bg-green-100 text-green-700 hover:bg-green-200" : ""}
                >
                  {index + 1}
                </Button>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}