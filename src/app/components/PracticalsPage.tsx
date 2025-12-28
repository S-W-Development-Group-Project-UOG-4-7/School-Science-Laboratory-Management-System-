'use client';

import { useState, useEffect, useRef, useId } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Search, Play, FileText, Download, BookOpen, Plus, Upload, Video as VideoIcon, Clock, BarChart3, X, Loader2, Edit, Trash2 } from 'lucide-react';
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
import { 
  UserRole, 
  Practical, 
  Quiz, 
  QuizAttempt, 
  Question,
  DifficultyLevel, 
  QuizStatus,
  difficultyFromUI, 
  difficultyToUI,
  CreatePracticalInput,
  UpdatePracticalInput,
  AttemptStatus
} from '@/lib/types'; 
import { ImageWithFallback } from './figma/ImageWithFallback';
import { QuizManager } from './quiz/QuizManager';
import { QuizPlayer } from './quiz/QuizPlayer';

// Mock data for development (use until API is ready)
const mockPracticals: Practical[] = [
  {
    id: 1,
    title: 'Acid-Base Titration',
    description: 'Learn the proper technique for conducting acid-base titrations using standard solutions.',
    subject: 'Chemistry',
    grade: 'Grade 11',
    duration: '45 min',
    difficulty: DifficultyLevel.INTERMEDIATE,
    videoUrl: 'https://example.com/video1.mp4',
    labSheetUrl: 'https://example.com/lab1.pdf',
    thumbnail: 'https://images.unsplash.com/photo-1761095596584-34731de3e568',
    createdAt: new Date(),
    updatedAt: new Date(),
    teacherId: 1,
    quizzes: []
  },
  {
    id: 2,
    title: 'Microscope Usage and Cell Observation',
    description: 'Introduction to compound microscope operation and observing plant and animal cells.',
    subject: 'Biology',
    grade: 'Grade 9',
    duration: '30 min',
    difficulty: DifficultyLevel.BEGINNER,
    videoUrl: 'https://example.com/video2.mp4',
    labSheetUrl: 'https://example.com/lab2.pdf',
    thumbnail: 'https://images.unsplash.com/photo-1614308457932-e16d85c5d053',
    createdAt: new Date(),
    updatedAt: new Date(),
    teacherId: 1,
    quizzes: []
  },
  {
    id: 3,
    title: "Newton's Laws of Motion Experiments",
    description: 'Practical demonstrations of Newton\'s three laws of motion with calculations.',
    subject: 'Physics',
    grade: 'Grade 10',
    duration: '60 min',
    difficulty: DifficultyLevel.INTERMEDIATE,
    videoUrl: 'https://example.com/video3.mp4',
    labSheetUrl: 'https://example.com/lab3.pdf',
    thumbnail: 'https://images.unsplash.com/photo-1606206605628-0a09580d44a1',
    createdAt: new Date(),
    updatedAt: new Date(),
    teacherId: 1,
    quizzes: []
  }
];

// Mock service for development
const practicalService = {
  async getAll(filters?: any): Promise<Practical[]> {
    console.log('Using mock practical service');
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Filter mock data
    let filtered = [...mockPracticals];
    
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(search) ||
        (p.description && p.description.toLowerCase().includes(search))
      );
    }
    
    if (filters?.subject && filters.subject !== 'all') {
      filtered = filtered.filter(p => p.subject === filters.subject);
    }
    
    if (filters?.grade && filters.grade !== 'all') {
      filtered = filtered.filter(p => p.grade === filters.grade);
    }
    
    return filtered;
  },

  async create(data: CreatePracticalInput): Promise<Practical> {
    console.log('Mock: Creating practical:', data);
    
    const newPractical: Practical = {
      id: Date.now(),
      title: data.title,
      description: data.description || null,
      subject: data.subject,
      grade: data.grade,
      duration: data.duration || '45 min',
      difficulty: data.difficulty || DifficultyLevel.INTERMEDIATE,
      videoUrl: data.videoUrl || null,
      labSheetUrl: data.labSheetUrl || null,
      thumbnail: data.thumbnail || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      teacherId: data.teacherId,
      quizzes: []
    };
    
    // Add to mock data
    mockPracticals.unshift(newPractical);
    
    return newPractical;
  },

  async update(id: number, data: UpdatePracticalInput): Promise<Practical> {
    console.log(`Mock: Updating practical ${id}:`, data);
    
    const index = mockPracticals.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error(`Practical ${id} not found`);
    }
    
    mockPracticals[index] = {
      ...mockPracticals[index],
      ...data,
      updatedAt: new Date()
    };
    
    return mockPracticals[index];
  },

  async delete(id: number): Promise<void> {
    console.log(`Mock: Deleting practical ${id}`);
    
    const index = mockPracticals.findIndex(p => p.id === id);
    if (index !== -1) {
      mockPracticals.splice(index, 1);
    }
  }
};

interface PracticalsPageProps {
  userRole: UserRole;
  userId?: number;
}

export function PracticalsPage({ userRole, userId }: PracticalsPageProps) {
  const [practicals, setPracticals] = useState<Practical[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPractical, setSelectedPractical] = useState<Practical | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPractical, setEditingPractical] = useState<Practical | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const componentId = useId();
  const canUpload = userRole === 'teacher' || userRole === 'lab-assistant' || userRole === 'admin';

  useEffect(() => {
    fetchPracticals();
  }, [searchQuery, selectedSubject, selectedGrade]);

  const fetchPracticals = async () => {
    try {
      setLoading(true);
      console.log('Fetching practicals...'); // Debug log
      
      const filters = {
        search: searchQuery || undefined,
        subject: selectedSubject !== 'all' ? selectedSubject : undefined,
        grade: selectedGrade !== 'all' ? selectedGrade : undefined,
      };
      
      // TRY-CATCH with better error handling
      let data: Practical[];
      try {
        data = await practicalService.getAll(filters);
        console.log('Received practicals:', data.length); // Debug log
      } catch (fetchError) {
        console.error('API fetch failed, using mock data:', fetchError);
        // Fallback to mock data
        data = mockPracticals.filter(p => {
          const matchesSearch = !filters.search || 
            p.title.toLowerCase().includes(filters.search.toLowerCase()) ||
            (p.description && p.description.toLowerCase().includes(filters.search.toLowerCase()));
          const matchesSubject = !filters.subject || p.subject === filters.subject;
          const matchesGrade = !filters.grade || p.grade === filters.grade;
          return matchesSearch && matchesSubject && matchesGrade;
        });
      }
      
      setPracticals(data);
      setError(null);
    } catch (err) {
      console.error('Error in fetchPracticals:', err); // Better logging
      setError(err instanceof Error ? err.message : 'Failed to fetch practicals');
      
      // Fallback to empty array instead of crashing
      setPracticals([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPracticals = practicals.filter((practical) => {
    const matchesSearch = searchQuery === '' || 
      practical.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (practical.description && practical.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSubject = selectedSubject === 'all' || practical.subject === selectedSubject;
    const matchesGrade = selectedGrade === 'all' || practical.grade === selectedGrade;
    return matchesSearch && matchesSubject && matchesGrade;
  });

  // Handle adding new practical
  const handleAddPractical = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      
      const practicalData: CreatePracticalInput = {
        title: formData.get('title') as string,
        description: formData.get('description') as string || undefined,
        subject: formData.get('subject') as string,
        grade: formData.get('grade') as string,
        duration: formData.get('duration') as string,
        difficulty: difficultyFromUI(formData.get('difficulty') as string || 'Intermediate'),
        videoUrl: formData.get('videoUrl') as string || undefined,
        labSheetUrl: formData.get('labSheetUrl') as string || undefined,
        thumbnail: formData.get('thumbnail') as string || undefined,
        teacherId: userId || 1,
      };
      
      const newPractical = await practicalService.create(practicalData);
      setPracticals([newPractical, ...practicals]);
      setIsAddDialogOpen(false);
      alert('Practical created successfully!');
    } catch (err) {
      console.error('Error creating practical:', err);
      alert('Failed to create practical: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle updating practical
  const handleUpdatePractical = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingPractical) return;
    
    setIsSubmitting(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      
      const updateData: UpdatePracticalInput = {
        title: formData.get('title') as string,
        description: formData.get('description') as string || undefined,
        subject: formData.get('subject') as string,
        grade: formData.get('grade') as string,
        duration: formData.get('duration') as string,
        difficulty: difficultyFromUI(formData.get('difficulty') as string || 'Intermediate'),
        videoUrl: formData.get('videoUrl') as string || undefined,
        labSheetUrl: formData.get('labSheetUrl') as string || undefined,
        thumbnail: formData.get('thumbnail') as string || undefined,
      };
      
      const updatedPractical = await practicalService.update(editingPractical.id, updateData);
      setPracticals(practicals.map(p => p.id === updatedPractical.id ? updatedPractical : p));
      setIsEditDialogOpen(false);
      setEditingPractical(null);
      alert('Practical updated successfully!');
    } catch (err) {
      console.error('Error updating practical:', err);
      alert('Failed to update practical');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle deleting practical
  const handleDeletePractical = async (id: number) => {
    if (!confirm('Are you sure you want to delete this practical? This will also delete all associated quizzes.')) {
      return;
    }

    try {
      await practicalService.delete(id);
      setPracticals(practicals.filter(p => p.id !== id));
      alert('Practical deleted successfully!');
    } catch (err) {
      console.error('Error deleting practical:', err);
      alert('Failed to delete practical');
    }
  };

  // Handle starting edit
  const handleStartEdit = (practical: Practical) => {
    setEditingPractical(practical);
    setIsEditDialogOpen(true);
  };

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

  const getDifficultyColor = (difficulty: DifficultyLevel) => {
    const uiDifficulty = difficultyToUI(difficulty);
    switch (uiDifficulty) {
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

  // Helper function to get safe thumbnail URL
  const getSafeThumbnail = (thumbnail: string | null | undefined): string => {
    if (!thumbnail || thumbnail === '#') {
      return '/default-thumbnail.jpg';
    }
    return thumbnail;
  };

  // Quiz Management Functions
  const handleAddQuiz = (quizData: Omit<Quiz, 'id' | 'createdAt'>) => {
    console.log('Adding quiz:', quizData);
    fetchPracticals();
  };

  const handleEditQuiz = (quizId: string, updates: Partial<Quiz>) => {
    console.log('Editing quiz:', quizId, updates);
    fetchPracticals();
  };

  const handleDeleteQuiz = (quizId: string) => {
    console.log('Deleting quiz:', quizId);
    fetchPracticals();
  };

  const handleSubmitQuiz = (attempt: Omit<QuizAttempt, 'id' | 'startedAt' | 'completedAt'>) => {
    const newAttempt: QuizAttempt = {
      ...attempt,
      id: Number(new Date()),
      startedAt: new Date(),
      completedAt: new Date(),
      status: AttemptStatus.COMPLETED
    };
    
    setQuizAttempts([...quizAttempts, newAttempt]);
    setSelectedQuiz(null);
    
    console.log('Quiz submitted:', newAttempt);
  };

  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
            <p className="mt-4 text-gray-600">Loading practicals...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state - show but don't crash
  if (error) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-700">
            <strong>Note:</strong> {error}. Using demo data for now.
          </p>
          <div className="mt-4">
            <Button 
              onClick={fetchPracticals} 
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              Retry
            </Button>
            <Button 
              onClick={() => {
                setError(null);
                setPracticals(mockPracticals);
              }}
              variant="outline"
              className="ml-2"
            >
              Use Demo Data
            </Button>
          </div>
        </div>
        
        {/* Show demo data anyway */}
        <div className="mt-6">
          <h2 className="text-gray-900 mb-2">Demo Practicals</h2>
          <p className="text-gray-600 mb-4">
            Showing demo data while database is being set up
          </p>
          {/* Render the practicals grid with mock data */}
          {/* ... copy the grid rendering code from below ... */}
        </div>
      </div>
    );
  }

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
                <form className="space-y-4" onSubmit={handleAddPractical}>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="title">Practical Title *</Label>
                      <Input 
                        id="title" 
                        name="title"
                        placeholder="e.g., Acid-Base Titration" 
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="subject">Subject *</Label>
                      <Select name="subject" required>
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
                      <Label htmlFor="grade">Grade *</Label>
                      <Select name="grade" required>
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
                      <Select name="difficulty">
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
                      <Label htmlFor="duration">Duration *</Label>
                      <Input 
                        id="duration" 
                        name="duration"
                        placeholder="e.g., 45 min" 
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        placeholder="Describe the practical and learning objectives..."
                        rows={3}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="videoUrl">Video URL (optional)</Label>
                      <Input 
                        id="videoUrl" 
                        name="videoUrl"
                        placeholder="https://example.com/video.mp4" 
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="labSheetUrl">Lab Sheet URL (optional)</Label>
                      <Input 
                        id="labSheetUrl" 
                        name="labSheetUrl"
                        placeholder="https://example.com/lab-sheet.pdf" 
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="thumbnail">Thumbnail URL (optional)</Label>
                      <Input 
                        id="thumbnail" 
                        name="thumbnail"
                        placeholder="https://example.com/thumbnail.jpg" 
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <h4 className="text-gray-900">Or Upload Files Directly</h4>
                    
                    <div className="space-y-2">
                      <Label htmlFor="video">Practical Video</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-emerald-400 transition-colors cursor-pointer">
                        <VideoIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-1">Click to upload video or drag and drop</p>
                        <p className="text-xs text-gray-500">MP4, AVI, MOV up to 500MB</p>
                        <Input id="video" name="video" type="file" accept="video/*" className="hidden" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="labsheet">Lab Sheet (PDF)</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-emerald-400 transition-colors cursor-pointer">
                        <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-1">Click to upload PDF or drag and drop</p>
                        <p className="text-xs text-gray-500">PDF up to 10MB</p>
                        <Input id="labsheet" name="labsheet" type="file" accept=".pdf" className="hidden" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="thumbnailFile">Thumbnail Image</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-emerald-400 transition-colors cursor-pointer">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-1">Click to upload image or drag and drop</p>
                        <p className="text-xs text-gray-500">JPG, PNG up to 5MB</p>
                        <Input id="thumbnailFile" name="thumbnailFile" type="file" accept="image/*" className="hidden" />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsAddDialogOpen(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Create Practical
                        </>
                      )}
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
                key={practical.id}
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
                            {difficultyToUI(practical.difficulty)}
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
                          {practical.videoUrl && (
                            <Button 
                              size="sm" 
                              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                              asChild
                            >
                              <a href={practical.videoUrl} target="_blank" rel="noopener noreferrer">
                                <Play className="w-4 h-4 mr-2" />
                                Watch Video
                              </a>
                            </Button>
                          )}
                          {practical.labSheetUrl && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="hover:bg-blue-50 hover:border-blue-300"
                              asChild
                            >
                              <a href={practical.labSheetUrl} target="_blank" rel="noopener noreferrer">
                                <FileText className="w-4 h-4 mr-2" />
                                Lab Sheet
                              </a>
                            </Button>
                          )}
                          
                          {/* Quiz Button */}
                          <Dialog key={`dialog-${practical.id}`}>
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
                                  (practical.quizzes || []).some(q => q.id === a.quizId)
                                )}
                              />
                            </DialogContent>
                          </Dialog>
                          
                          {canUpload && (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="hover:bg-green-50 hover:border-green-300 hover:text-green-700"
                                onClick={() => handleStartEdit(practical)}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleDeletePractical(practical.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </Button>
                            </>
                          )}
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

      {/* Edit Practical Dialog */}
      {editingPractical && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Practical</DialogTitle>
              <DialogDescription>
                Update practical details and files
              </DialogDescription>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleUpdatePractical}>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="edit-title">Practical Title *</Label>
                  <Input 
                    id="edit-title" 
                    name="title"
                    defaultValue={editingPractical.title}
                    placeholder="e.g., Acid-Base Titration" 
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-subject">Subject *</Label>
                  <Select name="subject" defaultValue={editingPractical.subject}>
                    <SelectTrigger id="edit-subject">
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
                  <Label htmlFor="edit-grade">Grade *</Label>
                  <Select name="grade" defaultValue={editingPractical.grade}>
                    <SelectTrigger id="edit-grade">
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
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-difficulty">Difficulty Level</Label>
                  <Select name="difficulty" defaultValue={difficultyToUI(editingPractical.difficulty)}>
                    <SelectTrigger id="edit-difficulty">
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
                  <Label htmlFor="edit-duration">Duration *</Label>
                  <Input 
                    id="edit-duration" 
                    name="duration"
                    defaultValue={editingPractical.duration}
                    placeholder="e.g., 45 min" 
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    name="description"
                    defaultValue={editingPractical.description || ''}
                    placeholder="Describe the practical and learning objectives..."
                    rows={3}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="edit-videoUrl">Video URL</Label>
                  <Input 
                    id="edit-videoUrl" 
                    name="videoUrl"
                    defaultValue={editingPractical.videoUrl || ''}
                    placeholder="https://example.com/video.mp4" 
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="edit-labSheetUrl">Lab Sheet URL</Label>
                  <Input 
                    id="edit-labSheetUrl" 
                    name="labSheetUrl"
                    defaultValue={editingPractical.labSheetUrl || ''}
                    placeholder="https://example.com/lab-sheet.pdf" 
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="edit-thumbnail">Thumbnail URL</Label>
                  <Input 
                    id="edit-thumbnail" 
                    name="thumbnail"
                    defaultValue={editingPractical.thumbnail || ''}
                    placeholder="https://example.com/thumbnail.jpg" 
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setEditingPractical(null);
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4 mr-2" />
                      Update Practical
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}