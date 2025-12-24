'use client';

import { useState } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Plus, Trash2, X } from 'lucide-react';
import { QuizQuestion } from '@/lib/types'; // UPDATED IMPORT

interface QuizFormProps {
  practicalId: string;
  onSubmit: (quizData: any) => void;
  initialData?: any;
}

export function QuizForm({ practicalId, onSubmit, initialData }: QuizFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [passingMarks, setPassingMarks] = useState(initialData?.passingMarks || 50);
  const [timeLimit, setTimeLimit] = useState(initialData?.timeLimit || 30);
  const [questions, setQuestions] = useState<QuizQuestion[]>(initialData?.questions || []);

  const [newQuestion, setNewQuestion] = useState({
    question: '',
    type: 'multiple-choice' as const,
    options: ['', '', '', ''],
    correctAnswer: '',
    marks: 1,
    explanation: ''
  });

  const addQuestion = () => {
    if (!newQuestion.question.trim() || !newQuestion.correctAnswer) return;

    const question: QuizQuestion = {
      id: Date.now().toString(),
      ...newQuestion,
      options: newQuestion.type === 'multiple-choice' ? newQuestion.options.filter(o => o.trim()) : undefined
    };

    setQuestions([...questions, question]);
    setNewQuestion({
      question: '',
      type: 'multiple-choice',
      options: ['', '', '', ''],
      correctAnswer: '',
      marks: 1,
      explanation: ''
    });
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);
    
    onSubmit({
      practicalId,
      title,
      description,
      totalMarks,
      passingMarks,
      timeLimit,
      questions,
      isPublished: true,
      createdBy: 'current-user' // Replace with actual user
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4">
        <div>
          <Label htmlFor="title">Quiz Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Acid-Base Titration Quiz"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of the quiz..."
            rows={2}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="passingMarks">Passing Percentage (%)</Label>
            <Input
              id="passingMarks"
              type="number"
              min="0"
              max="100"
              value={passingMarks}
              onChange={(e) => setPassingMarks(parseInt(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
            <Input
              id="timeLimit"
              type="number"
              min="1"
              value={timeLimit}
              onChange={(e) => setTimeLimit(parseInt(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* Question Builder */}
      <div className="border rounded-lg p-4">
        <h4 className="font-medium mb-4">Add Questions</h4>
        
        <div className="space-y-4 mb-4">
          <div>
            <Label>Question</Label>
            <Textarea
              value={newQuestion.question}
              onChange={(e) => setNewQuestion({...newQuestion, question: e.target.value})}
              placeholder="Enter your question..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Question Type</Label>
              <Select
                value={newQuestion.type}
                onValueChange={(value: any) => setNewQuestion({...newQuestion, type: value, options: value === 'multiple-choice' ? ['', '', '', ''] : undefined})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                  <SelectItem value="true-false">True/False</SelectItem>
                  <SelectItem value="short-answer">Short Answer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Marks</Label>
              <Input
                type="number"
                min="1"
                value={newQuestion.marks}
                onChange={(e) => setNewQuestion({...newQuestion, marks: parseInt(e.target.value)})}
              />
            </div>
          </div>

          {newQuestion.type === 'multiple-choice' && (
            <div className="space-y-2">
              <Label>Options</Label>
              {newQuestion.options?.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...newQuestion.options!];
                      newOptions[index] = e.target.value;
                      setNewQuestion({...newQuestion, options: newOptions});
                    }}
                    placeholder={`Option ${index + 1}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newOptions = newQuestion.options!.filter((_, i) => i !== index);
                      setNewQuestion({...newQuestion, options: newOptions});
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setNewQuestion({...newQuestion, options: [...newQuestion.options!, '']})}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Option
              </Button>
            </div>
          )}

          <div>
            <Label>Correct Answer</Label>
            {newQuestion.type === 'multiple-choice' ? (
              <Select
                value={newQuestion.correctAnswer}
                onValueChange={(value) => setNewQuestion({...newQuestion, correctAnswer: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select correct option" />
                </SelectTrigger>
                <SelectContent>
                  {newQuestion.options?.map((option, index) => (
                    <SelectItem key={index} value={option}>{option || `Option ${index + 1}`}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : newQuestion.type === 'true-false' ? (
              <Select
                value={newQuestion.correctAnswer}
                onValueChange={(value) => setNewQuestion({...newQuestion, correctAnswer: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select correct answer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">True</SelectItem>
                  <SelectItem value="false">False</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Input
                value={newQuestion.correctAnswer}
                onChange={(e) => setNewQuestion({...newQuestion, correctAnswer: e.target.value})}
                placeholder="Enter correct answer..."
              />
            )}
          </div>

          <div>
            <Label>Explanation (Optional)</Label>
            <Textarea
              value={newQuestion.explanation}
              onChange={(e) => setNewQuestion({...newQuestion, explanation: e.target.value})}
              placeholder="Explain why this answer is correct..."
              rows={2}
            />
          </div>

          <Button type="button" onClick={addQuestion} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Question
          </Button>
        </div>

        {/* Questions List */}
        {questions.length > 0 && (
          <div className="border-t pt-4">
            <h5 className="font-medium mb-2">Added Questions ({questions.length})</h5>
            <div className="space-y-3">
              {questions.map((q, index) => (
                <div key={q.id} className="flex items-start justify-between border rounded p-3">
                  <div>
                    <p className="font-medium">Q{index + 1}: {q.question}</p>
                    <p className="text-sm text-gray-600">
                      {q.type} • {q.marks} mark{q.marks !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeQuestion(q.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" className="bg-gradient-to-r from-blue-600 to-blue-700">
          Save Quiz
        </Button>
      </div>
    </form>
  );
}