'use client';

import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Download, Eye, CheckCircle, XCircle } from 'lucide-react';
import { QuizAttempt, QuizAttemptStatus } from '@/src/app/lib/types';

interface QuizAttemptsViewProps {
  attempts: QuizAttempt[];
}

export function QuizAttemptsView({ attempts }: QuizAttemptsViewProps) {
  const exportToCSV = () => {
    const headers = [
      'Student Name',
      'Total Marks',
      'Obtained Marks',
      'Percentage',
      'Status',
      'Date',
    ];

    const csvData = attempts.map((attempt) => [
      attempt.studentName,
      attempt.totalMarks.toString(),
      attempt.obtainedMarks.toString(),
      `${attempt.percentage.toFixed(1)}%`,
      attempt.passed ? 'Passed' : 'Failed',
      attempt.completedAt
        ? new Date(attempt.completedAt).toLocaleDateString()
        : 'Not completed',
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map((row) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quiz-results.csv';
    a.click();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-600">
            Total Attempts:{' '}
            <span className="font-semibold">{attempts.length}</span>
          </p>
          <p className="text-sm text-gray-600">
            Average Score:{' '}
            <span className="font-semibold">
              {attempts.length > 0
                ? (
                    attempts.reduce((sum, a) => sum + a.percentage, 0) /
                    attempts.length
                  ).toFixed(1)
                : 0}
              %
            </span>
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={exportToCSV}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Attempts List */}
      <div className="space-y-3">
        {attempts.map((attempt) => {
          const displayDate = attempt.completedAt
            ? new Date(attempt.completedAt).toLocaleDateString()
            : 'Not completed';

          const isCompleted =
            attempt.status === QuizAttemptStatus.COMPLETED;

          return (
            <Card key={attempt.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  {/* Student Info */}
                  <div>
                    <h4 className="font-semibold">
                      {attempt.studentName}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {isCompleted ? 'Completed' : 'In Progress'} : {displayDate}
                    </p>
                  </div>

                  {/* Result */}
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          isCompleted
                            ? attempt.passed
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {isCompleted
                          ? attempt.passed
                            ? 'Passed'
                            : 'Failed'
                          : 'In Progress'}
                      </div>

                      {isCompleted &&
                        (attempt.passed ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        ))}
                    </div>

                    <p className="text-lg font-bold">
                      {attempt.obtainedMarks}/{attempt.totalMarks} (
                      {attempt.percentage.toFixed(1)}%)
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-4 border-t">
                  <Button variant="outline" size="sm" className="w-full">
                    <Eye className="w-4 h-4 mr-2" />
                    View Detailed Answers
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
