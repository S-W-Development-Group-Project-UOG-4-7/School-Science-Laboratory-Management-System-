'use client';

import React, { useState, useEffect } from 'react';
import { Button, buttonVariants } from '../ui/button';
import type { VariantProps } from 'class-variance-authority';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '../ui/dialog';
import { Loader2, Award, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { get } from '../../../utils/api';
import { Card, CardContent } from '../ui/card';

type ButtonProps = React.ComponentProps<'button'> & VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
};

interface QuizScoreButtonProps extends ButtonProps {
    studentId: number;
    practicalId: number;
    buttonText?: string;
}

interface QuizAttempt {
    id: number;
    score: number;
    createdAt: string;
    quiz: {
        id: number;
        title: string;
        totalMarks: number;
    };
}

export function QuizScoreButton({
    studentId,
    practicalId,
    buttonText = 'Quiz Score',
    className,
    variant = 'outline',
    size = 'sm',
    ...props
}: QuizScoreButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchScore();
        }
    }, [isOpen, practicalId, studentId]);

    const fetchScore = async () => {
        setIsLoading(true);
        setError(null);
        setAttempt(null);
        try {
            // 1. Get the quiz for this practical
            const quizResponse = await get(`/api/quizzes?practicalId=${practicalId}`);

            if (!quizResponse.success || !quizResponse.data || quizResponse.data.length === 0) {
                setError('No quiz found for this practical.');
                return;
            }

            const quizId = quizResponse.data[0].id;

            // 2. Get the attempt for this quiz and student
            const attemptResponse = await get(`/api/quizzes/attempt?studentId=${studentId}&quizId=${quizId}`);

            if (attemptResponse.success && attemptResponse.data && attemptResponse.data.length > 0) {
                setAttempt(attemptResponse.data[0]);
            } else {
                setError('You have not attempted this quiz yet.');
            }
        } catch (err: any) {
            console.error('Error fetching score:', err);
            setError(err.message || 'Failed to fetch score');
        } finally {
            setIsLoading(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getProgressBarColor = (score: number) => {
        if (score >= 80) return 'bg-green-500';
        if (score >= 60) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant={variant}
                    size={size}
                    className={className}
                    {...props}
                >
                    <Award className="w-4 h-4 mr-2" />
                    {buttonText}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Quiz Result</DialogTitle>
                    <DialogDescription>
                        Your performance on this practical's quiz
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-8">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
                            <p className="text-sm text-gray-500">Loading result...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-6 text-center">
                            <AlertCircle className="w-10 h-10 text-gray-400 mb-3" />
                            <p className="text-gray-900 font-medium mb-1">{error}</p>
                            <p className="text-sm text-gray-500">
                                {error.includes('not attempted')
                                    ? 'Complete the quiz to see your score here.'
                                    : 'Please check back later.'}
                            </p>
                        </div>
                    ) : attempt ? (
                        <div className="space-y-6">
                            <div className="text-center">
                                <h3 className="text-lg font-medium text-gray-900 mb-1">
                                    {attempt.quiz.title}
                                </h3>
                                <p className="text-sm text-gray-500">
                                    Attempted on {new Date(attempt.createdAt).toLocaleDateString()}
                                </p>
                            </div>

                            <div className="flex justify-center">
                                <div className="relative flex items-center justify-center w-32 h-32 rounded-full border-4 border-gray-100">
                                    <div className="text-center">
                                        <span className={`text-3xl font-bold ${getScoreColor(attempt.score)}`}>
                                            {attempt.score.toFixed(0)}%
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Score</span>
                                        <span className="font-medium">
                                            {((attempt.score / 100) * attempt.quiz.totalMarks).toFixed(1)} / {attempt.quiz.totalMarks}
                                        </span>
                                    </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div
                                        className={`h-2.5 rounded-full ${getProgressBarColor(attempt.score)}`}
                                        style={{ width: `${Math.min(attempt.score, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
            </DialogContent>
        </Dialog>
    );
}
