'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { Quiz, QuizQuestion } from '@/lib/types'; 

interface QuizPlayerProps {
  quiz: Quiz;
  onSubmit: (attempt: any) => void;
  onClose: () => void;
}

export function QuizPlayer({ quiz, onSubmit, onClose }: QuizPlayerProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [timeLeft, setTimeLeft] = useState(quiz.timeLimit ? quiz.timeLimit * 60 : 0);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (quiz.timeLimit && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (questionId: string, answer: string | string[]) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const calculateResults = () => {
    let totalMarks = 0;
    const detailedAnswers = quiz.questions.map(question => {
      const userAnswer = answers[question.id];
      let isCorrect = false;
      let marksObtained = 0;

      if (question.type === 'multiple-choice' || question.type === 'true-false') {
        isCorrect = userAnswer === question.correctAnswer;
      } else if (question.type === 'short-answer') {
        isCorrect = (userAnswer as string)?.toLowerCase().trim() === 
                   (question.correctAnswer as string).toLowerCase().trim();
      }

      marksObtained = isCorrect ? question.marks : 0;
      totalMarks += marksObtained;

      return {
        questionId: question.id,
        answer: userAnswer || '',
        isCorrect,
        marksObtained
      };
    });

    const percentage = (totalMarks / quiz.totalMarks) * 100;
    const passed = percentage >= quiz.passingMarks;

    return {
      totalMarks: quiz.totalMarks,
      obtainedMarks: totalMarks,
      percentage,
      passed,
      detailedAnswers
    };
  };

  const handleSubmit = () => {
    const results = calculateResults();
    
    onSubmit({
      quizId: quiz.id,
      studentId: 'current-student',
      studentName: 'Current Student',
      ...results
    });
    
    setIsSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  const currentQ = quiz.questions[currentQuestion];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{quiz.title}</span>
            {quiz.timeLimit && (
              <div className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-medium flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatTime(timeLeft)}
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        {isSubmitted ? (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Quiz Submitted!</h3>
            <p className="text-gray-600">Your answers have been recorded.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Question {currentQuestion + 1} of {quiz.questions.length}</span>
                <span>{Math.round(((currentQuestion + 1) / quiz.questions.length) * 100)}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Current Question */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-6">
                  <h3 className="text-lg font-semibold">
                    Q{currentQuestion + 1}: {currentQ.question}
                  </h3>
                  <div className="px-2 py-1 rounded border text-sm">
                    {currentQ.marks} mark{currentQ.marks !== 1 ? 's' : ''}
                  </div>
                </div>

                {currentQ.type === 'multiple-choice' && currentQ.options && (
                  <RadioGroup
                    value={answers[currentQ.id] as string}
                    onValueChange={(value) => handleAnswer(currentQ.id, value)}
                    className="space-y-3"
                  >
                    {currentQ.options.map((option, idx) => (
                      <div key={idx} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                        <RadioGroupItem value={option} id={`option-${idx}`} />
                        <Label htmlFor={`option-${idx}`} className="flex-1 cursor-pointer">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {currentQ.type === 'true-false' && (
                  <RadioGroup
                    value={answers[currentQ.id] as string}
                    onValueChange={(value) => handleAnswer(currentQ.id, value)}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 flex-1">
                      <RadioGroupItem value="true" id="true" />
                      <Label htmlFor="true" className="cursor-pointer">True</Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 flex-1">
                      <RadioGroupItem value="false" id="false" />
                      <Label htmlFor="false" className="cursor-pointer">False</Label>
                    </div>
                  </RadioGroup>
                )}

                {currentQ.type === 'short-answer' && (
                  <Textarea
                    value={(answers[currentQ.id] as string) || ''}
                    onChange={(e) => handleAnswer(currentQ.id, e.target.value)}
                    placeholder="Type your answer here..."
                    rows={4}
                  />
                )}

                {currentQ.explanation && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertCircle className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-600">Hint</span>
                    </div>
                    <p className="text-sm text-blue-700">{currentQ.explanation}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                disabled={currentQuestion === 0}
              >
                Previous
              </Button>
              
              {currentQuestion === quiz.questions.length - 1 ? (
                <Button 
                  onClick={handleSubmit}
                  className="bg-gradient-to-r from-green-600 to-green-700"
                >
                  Submit Quiz
                </Button>
              ) : (
                <Button
                  onClick={() => setCurrentQuestion(prev => Math.min(quiz.questions.length - 1, prev + 1))}
                >
                  Next Question
                </Button>
              )}
            </div>

            {/* Question Navigation Dots */}
            <div className="flex flex-wrap gap-2">
              {quiz.questions.map((_, idx) => (
                <Button
                  key={idx}
                  variant={currentQuestion === idx ? "default" : "outline"}
                  size="sm"
                  className="w-8 h-8 p-0"
                  onClick={() => setCurrentQuestion(idx)}
                >
                  {idx + 1}
                </Button>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}