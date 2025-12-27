'use client';

import { useState, useEffect, useRef, useId } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Search, Play, FileText, Download, BookOpen, Plus, Upload, Video as VideoIcon, Clock, BarChart3, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { UserRole, Quiz, QuizAttempt, Practical, QuizQuestion } from '@/lib/types'; 
import { ImageWithFallback } from './figma/ImageWithFallback';
import { QuizManager } from './quiz/QuizManager';
import { QuizPlayer } from './quiz/QuizPlayer';

interface PracticalsPageProps {
  userRole: UserRole;
}

// Sample data with quizzes - ensure unique IDs
const practicals: Practical[] = [
  {
    id: 'practical-1',
    title: 'Acid-Base Titration',
    grade: 'Grade 11',
    subject: 'Chemistry',
    videoUrl: '#',
    labSheetUrl: '#',
    duration: '45 min',
    difficulty: 'Intermediate',
    description: 'Learn the proper technique for conducting acid-base titrations using standard solutions.',
    thumbnail: 'https://images.unsplash.com/photo-1761095596584-34731de3e568?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGVtaXN0cnklMjBsYWJvcmF0b3J5JTIwYmVha2VyfGVufDF8fHx8MTc2Mjk2NDk4NHww&ixlib=rb-4.1.0&q=80&w=1080',
    quizzes: [
      {
        id: 'quiz-1',
        practicalId: 'practical-1',
        title: 'Acid-Base Titration Quiz',
        description: 'Test your knowledge of acid-base titration concepts',
        totalMarks: 20,
        passingMarks: 60,
        timeLimit: 30,
        status: 'PUBLISHED',
        teacherId: 1,
        questions: [
          {
            id: 'q-1-1',
            quizId: 'quiz-1',
            question: 'What is the endpoint in a titration?',
            type: 'multiple-choice' as const,
            options: [
              'When the indicator changes color',
              'When all reactant is consumed',
              'When pH equals 7',
              'When temperature stabilizes'
            ],
            correctAnswer: 'When the indicator changes color',
            marks: 5,
            explanation: 'The endpoint is indicated by a color change of the indicator.',
            order: 0
          }
        ],
        isPublished: true,
        createdAt: new Date(),
        createdBy: 'teacher1'
      }
    ]
  },
  {
    id: 'practical-2',
    title: 'Microscope Usage and Cell Observation',
    grade: 'Grade 9',
    subject: 'Biology',
    videoUrl: '#',
    labSheetUrl: '#',
    duration: '30 min',
    difficulty: 'Beginner',
    description: 'Introduction to compound microscope operation and observing plant and animal cells.',
    thumbnail: 'https://images.unsplash.com/photo-1614308457932-e16d85c5d053?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaWNyb3Njb3BlJTIwc2NpZW5jZSUyMGxhYnxlbnwxfHx8fDE3NjI4ODI3NzR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    quizzes: []
  },
  {
    id: 'practical-3',
    title: "Newton's Laws of Motion Experiments",
    grade: 'Grade 10',
    subject: 'Physics',
    videoUrl: '#',
    labSheetUrl: '#',
    duration: '60 min',
    difficulty: 'Intermediate',
    description: 'Practical demonstrations of Newton\'s three laws of motion with calculations.',
    thumbnail: 'https://images.unsplash.com/photo-1606206605628-0a09580d44a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYWJvcmF0b3J5JTIwdGVzdCUyMHR1YmVzfGVufDF8fHx8MTc2Mjg3NzgzM3ww&ixlib=rb-4.1.0&q=80&w=1080',
    quizzes: []
  },
  {
    id: 'practical-4',
    title: 'Chemical Reactions and Equations',
    grade: 'Grade 10',
    subject: 'Chemistry',
    videoUrl: '#',
    labSheetUrl: '#',
    duration: '50 min',
    difficulty: 'Intermediate',
    description: 'Observe and identify different types of chemical reactions.',
    thumbnail: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGVtaXN0cnklMjBsYWJvcmF0b3J5JTIwYmVha2VyfGVufDF8fHx8MTc2MzE2ODA5Nnww&ixlib=rb-4.1.0&q=80&w=1080',
    quizzes: []
  },
  {
    id: 'practical-5',
    title: 'Photosynthesis Experiment',
    grade: 'Grade 9',
    subject: 'Biology',
    videoUrl: '#',
    labSheetUrl: '#',
    duration: '40 min',
    difficulty: 'Beginner',
    description: 'Demonstrate the process of photosynthesis in plants.',
    thumbnail: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaG90b3N5bnRoZXNpc3xlbnwxfHx8fDE3NjMxNjgxMTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    quizzes: []
  },
];

// Mock quiz attempts data
const mockQuizAttempts: QuizAttempt[] = [
  {
    id: 'attempt-1',
    quizId: 'quiz-1',
    studentId: 'student-1',
    studentName: 'John Doe',
    answers: [
      {
        questionId: 'q-1-1',
        answer: 'When the indicator changes color',
        isCorrect: true,
        marksObtained: 5
      }
    ],
    totalMarks: 20,
    obtainedMarks: 18,
    percentage: 90,
    passed: true,
    startedAt: new Date(),
    completedAt: new Date(),
    status: 'completed'
  }
];

export function PracticalsPage({ userRole }: PracticalsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedPractical, setSelectedPractical] = useState<Practical | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>(mockQuizAttempts);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Generate unique ID for the component
  const componentId = useId();

  const canUpload = userRole === 'teacher' || userRole === 'lab-assistant' || userRole === 'admin';

  const filteredPracticals = practicals.filter((practical) => {
    const matchesSearch = searchQuery === '' || 
      practical.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (practical.description && practical.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSubject = selectedSubject === 'all' || practical.subject === selectedSubject;
    const matchesGrade = selectedGrade === 'all' || practical.grade === selectedGrade;
    return matchesSearch && matchesSubject && matchesGrade;
  });

  const getSubjectColor = (subject: string) => {
    switch (subject) {
      case 'Chemistry':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Physics':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Biology':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Science':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-pink-100 text-pink-700 border-pink-200';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-700';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-700';
      case 'Advanced':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Clear search function
  const clearSearch = () => {
    setSearchQuery('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Quiz Management Functions - CORRECTED VERSION
  const handleAddQuiz = (quizData: {
    practicalId: string | number;
    title: string;
    description?: string;
    totalMarks: number;
    passingMarks: number;
    timeLimit?: number;
    questions: Array<{
      question: string;
      type: 'multiple-choice' | 'true-false' | 'short-answer' | 'msq';
      options: string[];
      correctAnswer?: string;
      correctAnswers?: string[];
      marks: number;
      explanation?: string;
    }>;
    status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    teacherId?: number;
  }) => {
    const quizId = `quiz-${crypto.randomUUID()}`;
    
    const newQuiz: Quiz = {
      ...quizData,
      id: quizId,
      practicalId: quizData.practicalId,
      createdAt: new Date(),
      status: quizData.status || 'DRAFT',
      teacherId: quizData.teacherId || 1,
      questions: quizData.questions.map((q, index) => ({
        ...q,
        id: `q-${quizId}-${index}`,
        quizId: quizId,
        order: index,
      })),
      isPublished: (quizData.status || 'DRAFT') === 'PUBLISHED',
      createdBy: 'teacher1'
    };
    
    console.log('Adding quiz:', newQuiz);
    
    // Update the practical with new quiz
    const practicalIndex = practicals.findIndex(p => p.id.toString() === quizData.practicalId.toString());
    if (practicalIndex !== -1) {
      practicals[practicalIndex].quizzes = [...(practicals[practicalIndex].quizzes || []), newQuiz];
    }
  };

  const handleEditQuiz = (quizId: string, updates: Partial<Quiz>) => {
    // In real app, update database
    console.log('Editing quiz:', quizId, updates);
  };

  const handleDeleteQuiz = (quizId: string) => {
    // In real app, delete from database
    console.log('Deleting quiz:', quizId);
  };

  const handleStartQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
  };

  const handleSubmitQuiz = (attempt: Omit<QuizAttempt, 'id' | 'startedAt' | 'completedAt'>) => {
    const newAttempt: QuizAttempt = {
      ...attempt,
      id: `attempt-${crypto.randomUUID()}`,
      startedAt: new Date(),
      completedAt: new Date(),
      status: 'completed'
    };
    
    setQuizAttempts([...quizAttempts, newAttempt]);
    setSelectedQuiz(null);
    
    // In real app, save to database
    console.log('Quiz submitted:', newAttempt);
  };

  // Helper function to get safe thumbnail URL
  const getSafeThumbnail = (thumbnail: string | null | undefined): string => {
    if (!thumbnail || thumbnail === '#') {
      return '/default-thumbnail.jpg';
    }
    return thumbnail;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          key={`${componentId}-header`}
        >
          <h2 className="text-gray-900 mb-2">Practical Videos & Lab Sheets</h2>
          <p className="text-gray-600">
            Access video demonstrations and downloadable lab sheets for your science practicals
          </p>
        </motion.div>
        {canUpload && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            key={`${componentId}-add-button`}
          >
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Practical
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Practical</DialogTitle>
                  <DialogDescription>
                    Upload a new practical video and lab sheet for students
                  </DialogDescription>
                </DialogHeader>
                <form className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="title">Practical Title</Label>
                      <Input id="title" placeholder="e.g., Acid-Base Titration" />
                    </div>
                    <div>
                      <Label htmlFor="subject">Subject</Label>
                      <Select>
                        <SelectTrigger id="subject">
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Physics">Physics</SelectItem>
                          <SelectItem value="Chemistry">Chemistry</SelectItem>
                          <SelectItem value="Biology">Biology</SelectItem>
                          <SelectItem value="Science">Science</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="grade">Grade</Label>
                      <Select>
                        <SelectTrigger id="grade">
                          <SelectValue placeholder="Select grade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Grade 6">Grade 6</SelectItem>
                          <SelectItem value="Grade 7">Grade 7</SelectItem>
                          <SelectItem value="Grade 8">Grade 8</SelectItem>
                          <SelectItem value="Grade 9">Grade 9</SelectItem>
                          <SelectItem value="Grade 10">Grade 10</SelectItem>
                          <SelectItem value="Grade 11">Grade 11</SelectItem>
                          <SelectItem value="Grade 12">Grade 12</SelectItem>
                          <SelectItem value="Grade 13">Grade 13</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="difficulty">Difficulty Level</Label>
                      <Select>
                        <SelectTrigger id="difficulty">
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Beginner">Beginner</SelectItem>
                          <SelectItem value="Intermediate">Intermediate</SelectItem>
                          <SelectItem value="Advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="duration">Duration</Label>
                      <Input id="duration" placeholder="e.g., 45 min" />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe the practical and learning objectives..."
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <h4 className="text-gray-900">Upload Files</h4>
                    
                    <div className="space-y-2">
                      <Label htmlFor="video">Practical Video</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-emerald-400 transition-colors cursor-pointer">
                        <VideoIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-1">Click to upload video or drag and drop</p>
                        <p className="text-xs text-gray-500">MP4, AVI, MOV up to 500MB</p>
                        <Input id="video" type="file" accept="video/*" className="hidden" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="labsheet">Lab Sheet (PDF)</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-emerald-400 transition-colors cursor-pointer">
                        <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-1">Click to upload PDF or drag and drop</p>
                        <p className="text-xs text-gray-500">PDF up to 10MB</p>
                        <Input id="labsheet" type="file" accept=".pdf" className="hidden" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="thumbnail">Thumbnail Image</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-emerald-400 transition-colors cursor-pointer">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-1">Click to upload image or drag and drop</p>
                        <p className="text-xs text-gray-500">JPG, PNG up to 5MB</p>
                        <Input id="thumbnail" type="file" accept="image/*" className="hidden" />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Practical
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </motion.div>
        )}
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        key={`${componentId}-filters`}
      >
        <Card className="shadow-md hover:shadow-lg transition-shadow border-blue-100">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    ref={searchInputRef}
                    placeholder="Search practicals..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    className="pl-10 pr-10 transition-all hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                  {searchQuery && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      type="button"
                      aria-label="Clear search"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {isSearchFocused && searchQuery && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute z-10 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg w-full md:w-[calc(50%-0.5rem)]"
                  >
                    <div className="p-2">
                      <p className="text-xs text-gray-500 px-2 py-1">Search results for "{searchQuery}"</p>
                      {filteredPracticals.length > 0 ? (
                        filteredPracticals.slice(0, 3).map((practical) => (
                          <button
                            key={`search-result-${practical.id}`}
                            className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded-md transition-colors"
                            onClick={() => {
                              setSearchQuery(practical.title);
                              setIsSearchFocused(false);
                            }}
                            type="button"
                          >
                            <p className="font-medium text-gray-800">{practical.title}</p>
                            <p className="text-sm text-gray-600 truncate">{practical.description || ''}</p>
                          </button>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-gray-500">
                          No practicals found for "{searchQuery}"
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
              <div>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="hover:border-blue-400 transition-colors">
                    <SelectValue placeholder="Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    <SelectItem value="Physics">Physics</SelectItem>
                    <SelectItem value="Chemistry">Chemistry</SelectItem>
                    <SelectItem value="Biology">Biology</SelectItem>
                    <SelectItem value="Science">Science</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                  <SelectTrigger className="hover:border-blue-400 transition-colors">
                    <SelectValue placeholder="Grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Grades</SelectItem>
                    <SelectItem value="Grade 9">Grade 9</SelectItem>
                    <SelectItem value="Grade 10">Grade 10</SelectItem>
                    <SelectItem value="Grade 11">Grade 11</SelectItem>
                    <SelectItem value="Grade 12">Grade 12</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Results Count with Search Status */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600">
            Showing <span className="text-blue-700 font-medium">{filteredPracticals.length}</span> practical{filteredPracticals.length !== 1 ? 's' : ''}
            {searchQuery && (
              <span className="text-gray-500 ml-2">
                for "<span className="font-medium">{searchQuery}</span>"
              </span>
            )}
          </p>
        </div>
        {(searchQuery || selectedSubject !== 'all' || selectedGrade !== 'all') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchQuery('');
              setSelectedSubject('all');
              setSelectedGrade('all');
            }}
            className="text-gray-500 hover:text-gray-700"
            key={`${componentId}-clear-filters`}
          >
            <X className="w-4 h-4 mr-1" />
            Clear filters
          </Button>
        )}
      </div>

      {/* Practicals Grid */}
      <AnimatePresence mode="wait">
        {filteredPracticals.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredPracticals.map((practical) => (
              <motion.div
                key={practical.id.toString()}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                layout
              >
                <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-gray-200 hover:border-blue-300 group">
                  <div className="flex flex-col sm:flex-row">
                    {/* Thumbnail */}
                    <div className="sm:w-48 h-48 sm:h-auto bg-gray-100 flex-shrink-0 relative overflow-hidden">
                      <ImageWithFallback
                        src={getSafeThumbnail(practical.thumbnail)}
                        alt={practical.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-12 h-12 text-white" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col">
                      <CardHeader>
                        <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                          <Badge className={getSubjectColor(practical.subject)}>
                            {practical.subject}
                          </Badge>
                          <Badge variant="outline">{practical.grade}</Badge>
                        </div>
                        <CardTitle className="text-lg">{practical.title}</CardTitle>
                        <CardDescription>{practical.description || ''}</CardDescription>
                      </CardHeader>

                      <CardContent className="flex-1 flex flex-col justify-between">
                        <div className="flex flex-wrap gap-2 mb-4">
                          <Badge className={getDifficultyColor(practical.difficulty)} variant="outline">
                            {practical.difficulty}
                          </Badge>
                          <Badge variant="outline" className="bg-gray-50">
                            ⏱️ {practical.duration}
                          </Badge>
                          {practical.quizzes && practical.quizzes.length > 0 && (
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                              📝 {practical.quizzes.length} quiz{practical.quizzes.length !== 1 ? 'zes' : ''}
                            </Badge>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                            <Play className="w-4 h-4 mr-2" />
                            Watch Video
                          </Button>
                          <Button size="sm" variant="outline" className="hover:bg-blue-50 hover:border-blue-300">
                            <FileText className="w-4 h-4 mr-2" />
                            Lab Sheet
                          </Button>
                          
                          {/* Quiz Button */}
                          <Dialog key={`dialog-${practical.id.toString()}`}>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700"
                                onClick={() => setSelectedPractical(practical)}
                              >
                                <BarChart3 className="w-4 h-4 mr-2" />
                                Quiz
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>{practical.title} - Quizzes</DialogTitle>
                                <DialogDescription>
                                  {userRole === 'student' 
                                    ? 'Take quizzes to test your knowledge' 
                                    : 'Manage quizzes for this practical'}
                                </DialogDescription>
                              </DialogHeader>
                              <QuizManager
                                practicalId={practical.id.toString()}
                                userRole={userRole}
                                quizzes={practical.quizzes || []}
                                onAddQuiz={handleAddQuiz}
                                onEditQuiz={handleEditQuiz}
                                onDeleteQuiz={handleDeleteQuiz}
                                quizAttempts={quizAttempts.filter(a => 
                                  (practical.quizzes || []).some(q => q.id.toString() === a.quizId.toString())
                                )}
                              />
                            </DialogContent>
                          </Dialog>
                          
                          <Button size="sm" variant="outline" className="hover:bg-blue-50 hover:border-blue-300">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </CardContent>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            key={`${componentId}-empty-state`}
          >
            <Card className="py-12 border-blue-100">
              <CardContent className="text-center">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-gray-900 mb-2">No practicals found</h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery 
                    ? `No results found for "${searchQuery}"`
                    : 'Try adjusting your filters or search query'}
                </p>
                {(searchQuery || selectedSubject !== 'all' || selectedGrade !== 'all') && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedSubject('all');
                      setSelectedGrade('all');
                    }}
                  >
                    Clear all filters
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quiz Player Modal */}
      {selectedQuiz && userRole === 'student' && (
        <QuizPlayer
          key={`quiz-player-${selectedQuiz.id.toString()}`}
          quiz={selectedQuiz}
          onSubmit={handleSubmitQuiz}
          onClose={() => setSelectedQuiz(null)}
        />
      )}
    </div>
  );
}