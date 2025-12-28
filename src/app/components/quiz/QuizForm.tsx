'use client';

import { useState } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Plus, Trash2, X } from 'lucide-react';
import { Question, QuestionType } from '@/lib/types';

interface QuizFormProps {
  practicalId: string;
  onSubmit: (quizData: any) => void;
  initialData?: any;
}

type NewQuestionState = {
  question: string;
  type: QuestionType;
  options: string[];
  correctAnswer: string;
  correctAnswers: string[];
  marks: number;
  explanation: string;
};

export function QuizForm({ practicalId, onSubmit, initialData }: QuizFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [passingMarks, setPassingMarks] = useState(initialData?.passingMarks || 50);
  const [timeLimit, setTimeLimit] = useState(initialData?.timeLimit || 30);
  const [questions, setQuestions] = useState<Question[]>(initialData?.questions || []);

  const [newQuestion, setNewQuestion] = useState<NewQuestionState>({
    question: '',
    type: QuestionType.MULTIPLE_CHOICE,
    options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
    correctAnswer: '',
    correctAnswers: [],
    marks: 1,
    explanation: ''
  });

  const addQuestion = () => {
    if (!newQuestion.question.trim()) return;

    // Validate based on question type
    if (newQuestion.type === QuestionType.MULTIPLE_CHOICE && !newQuestion.correctAnswer) {
      alert('Please select a correct answer for multiple choice question');
      return;
    }
    
    if (newQuestion.type === QuestionType.MSQ && newQuestion.correctAnswers.length === 0) {
      alert('Please select at least one correct answer for MSQ');
      return;
    }
    
    if (newQuestion.type === QuestionType.TRUE_FALSE && !newQuestion.correctAnswer) {
      alert('Please select correct answer for True/False question');
      return;
    }
    
    if (newQuestion.type === QuestionType.SHORT_ANSWER && !newQuestion.correctAnswer.trim()) {
      alert('Please enter correct answer for short answer question');
      return;
    }

    const question: Question = {
      id: Date.now(), // Changed to number
      quizId: 0, // Temporary number, will be set when quiz is created
      question: newQuestion.question,
      type: newQuestion.type,
      options: (newQuestion.type === QuestionType.MULTIPLE_CHOICE || newQuestion.type === QuestionType.MSQ) 
        ? newQuestion.options.filter(o => o.trim()) 
        : [],
      correctAnswer: newQuestion.type === QuestionType.MSQ 
        ? newQuestion.correctAnswers.join(', ')
        : newQuestion.correctAnswer,
      correctAnswers: newQuestion.type === QuestionType.MSQ ? newQuestion.correctAnswers : undefined,
      marks: newQuestion.marks,
      explanation: newQuestion.explanation,
      order: questions.length,
      createdAt: new Date() // ADD THIS LINE
    };

    setQuestions([...questions, question]);
    setNewQuestion({
      question: '',
      type: QuestionType.MULTIPLE_CHOICE,
      options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
      correctAnswer: '',
      correctAnswers: [],
      marks: 1,
      explanation: ''
    });
  };

  const removeQuestion = (id: number) => { // Changed parameter type to number
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleMSQOptionChange = (option: string, checked: boolean) => {
    if (checked) {
      setNewQuestion({
        ...newQuestion,
        correctAnswers: [...newQuestion.correctAnswers, option]
      });
    } else {
      setNewQuestion({
        ...newQuestion,
        correctAnswers: newQuestion.correctAnswers.filter(a => a !== option)
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (questions.length === 0) {
      alert('Please add at least one question');
      return;
    }
    
    const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);
    
    onSubmit({
      practicalId,
      title,
      description,
      totalMarks,
      passingMarks,
      timeLimit,
      questions,
      status: 'DRAFT',
      isPublished: true,
      createdBy: 'current-user'
    });
  };

  const isMultipleChoiceOrMSQ = (type: QuestionType): boolean => {
    return type === QuestionType.MULTIPLE_CHOICE || type === QuestionType.MSQ;
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
              onChange={(e) => setPassingMarks(parseInt(e.target.value) || 0)}
            />
          </div>
          <div>
            <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
            <Input
              id="timeLimit"
              type="number"
              min="1"
              value={timeLimit}
              onChange={(e) => setTimeLimit(parseInt(e.target.value) || 1)}
            />
          </div>
        </div>
      </div>

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
                onValueChange={(value: QuestionType) => {
                  const resetState: NewQuestionState = {
                    question: newQuestion.question,
                    type: value,
                    options: isMultipleChoiceOrMSQ(value) 
                      ? ['Option 1', 'Option 2', 'Option 3', 'Option 4'] 
                      : [],
                    correctAnswer: '',
                    correctAnswers: [],
                    marks: newQuestion.marks,
                    explanation: newQuestion.explanation
                  };
                  setNewQuestion(resetState);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={QuestionType.MULTIPLE_CHOICE}>Multiple Choice (Single Answer)</SelectItem>
                  <SelectItem value={QuestionType.MSQ}>Multiple Select (MSQ)</SelectItem>
                  <SelectItem value={QuestionType.TRUE_FALSE}>True/False</SelectItem>
                  <SelectItem value={QuestionType.SHORT_ANSWER}>Short Answer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Marks</Label>
              <Input
                type="number"
                min="1"
                value={newQuestion.marks}
                onChange={(e) => setNewQuestion({...newQuestion, marks: parseInt(e.target.value) || 1})}
              />
            </div>
          </div>

          {isMultipleChoiceOrMSQ(newQuestion.type) && newQuestion.options.length > 0 && (
            <div className="space-y-2">
              <Label>Options</Label>
              {newQuestion.options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  {newQuestion.type === QuestionType.MSQ ? (
                    <div className="flex items-center gap-2 w-full">
                      <Checkbox
                        checked={newQuestion.correctAnswers.includes(option)}
                        onCheckedChange={(checked) => 
                          handleMSQOptionChange(option, checked as boolean)
                        }
                      />
                      <Input
                        value={option}
                        onChange={(e) => {
                          const oldOption = option;
                          const newOptions = [...newQuestion.options];
                          newOptions[index] = e.target.value;
                          
                          const updatedCorrectAnswers = newQuestion.correctAnswers.map(a => 
                            a === oldOption ? e.target.value : a
                          );
                          
                          setNewQuestion({
                            ...newQuestion, 
                            options: newOptions,
                            correctAnswers: updatedCorrectAnswers
                          });
                        }}
                        placeholder={`Option ${index + 1}`}
                      />
                    </div>
                  ) : (
                    <Input
                      value={option}
                      onChange={(e) => {
                        const oldOption = option;
                        const newOptions = [...newQuestion.options];
                        newOptions[index] = e.target.value;
                        
                        const updatedCorrectAnswer = 
                          newQuestion.correctAnswer === oldOption ? e.target.value : newQuestion.correctAnswer;
                        
                        setNewQuestion({
                          ...newQuestion, 
                          options: newOptions,
                          correctAnswer: updatedCorrectAnswer
                        });
                      }}
                      placeholder={`Option ${index + 1}`}
                    />
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const optionToRemove = option;
                      const newOptions = newQuestion.options.filter((_, i) => i !== index);
                      
                      const updatedCorrectAnswer = 
                        newQuestion.correctAnswer === optionToRemove ? '' : newQuestion.correctAnswer;
                      
                      const updatedCorrectAnswers = newQuestion.correctAnswers.filter(
                        a => a !== optionToRemove
                      );
                      
                      setNewQuestion({
                        ...newQuestion, 
                        options: newOptions,
                        correctAnswer: updatedCorrectAnswer,
                        correctAnswers: updatedCorrectAnswers
                      });
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
                onClick={() => setNewQuestion({
                  ...newQuestion, 
                  options: [...newQuestion.options, `Option ${newQuestion.options.length + 1}`]
                })}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Option
              </Button>
            </div>
          )}

          <div>
            <Label>
              Correct Answer
              {newQuestion.type === QuestionType.MSQ && ' (Select all that apply)'}
            </Label>
            
            {newQuestion.type === QuestionType.MULTIPLE_CHOICE ? (
              <Select
                value={newQuestion.correctAnswer}
                onValueChange={(value) => setNewQuestion({...newQuestion, correctAnswer: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select correct option" />
                </SelectTrigger>
                <SelectContent>
                  {newQuestion.options.map((option, index) => {
                    const value = option.trim() === "" ? `option-${index}` : option;
                    const label = option.trim() === "" ? `Option ${index + 1}` : option;
                    
                    return (
                      <SelectItem key={index} value={value}>
                        {label}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            ) : newQuestion.type === QuestionType.MSQ ? (
              <div className="mt-2 space-y-2">
                <p className="text-sm text-gray-600">
                  Selected: {newQuestion.correctAnswers.length} option(s)
                </p>
                {newQuestion.correctAnswers.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {newQuestion.correctAnswers.map((answer, idx) => (
                      <span key={idx} className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                        {answer}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : newQuestion.type === QuestionType.TRUE_FALSE ? (
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

          <Button 
            type="button" 
            onClick={addQuestion} 
            className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Question to Quiz
          </Button>
        </div>

        {questions.length > 0 && (
          <div className="border-t pt-4">
            <h5 className="font-medium mb-2">Added Questions ({questions.length})</h5>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {questions.map((q, index) => (
                <div key={q.id} className="flex items-start justify-between border rounded p-3 hover:bg-gray-50"> {/* Removed .toString() */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">Q{index + 1}: {q.question}</p>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
                        {q.type === QuestionType.MSQ ? 'MSQ' : 
                         q.type === QuestionType.MULTIPLE_CHOICE ? 'MCQ' : 
                         q.type === QuestionType.TRUE_FALSE ? 'T/F' : 'Short'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {q.type === QuestionType.MSQ 
                        ? `Correct answers: ${Array.isArray(q.correctAnswers) ? q.correctAnswers.length : 0} selected`
                        : `Answer: ${q.correctAnswer}`
                      }
                      {' • '}{q.marks} mark{q.marks !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeQuestion(q.id)} 
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center pt-4 border-t">
        <div className="text-sm text-gray-600">
          Total Marks: <span className="font-bold">{questions.reduce((sum, q) => sum + q.marks, 0)}</span>
          {' • '}Questions: <span className="font-bold">{questions.length}</span>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => setQuestions([])}>
            Clear All Questions
          </Button>
          <Button type="submit" className="bg-gradient-to-r from-blue-600 to-blue-700">
            Save Quiz
          </Button>
        </div>
      </div>
    </form>
  );
}