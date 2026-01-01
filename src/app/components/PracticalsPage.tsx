'use client';

import { useState, useEffect, useRef, useId, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Search, Play, FileText, BookOpen, Plus, X, Loader2, Edit, Trash2, User, BarChart3 } from 'lucide-react';
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
  DifficultyLevel, 
  difficultyFromUI, 
  difficultyToUI,
  CreatePracticalInput,
  UpdatePracticalInput,
  AttemptStatus
} from '@/lib/types'; 
import { ImageWithFallback } from './figma/ImageWithFallback';
import { QuizManager } from './quiz/QuizManager';
import { practicalService } from '@/services/practicalService';

interface PracticalsPageProps {
  userRole: UserRole;
  userId?: number;
}

export function PracticalsPage({ userRole, userId }: PracticalsPageProps) {
  const [practicals, setPracticals] = useState<Practical[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPractical, setSelectedPractical] = useState<Practical | null>(null);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPractical, setEditingPractical] = useState<Practical | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [userLoaded, setUserLoaded] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const componentId = useId();
  const canUpload = userRole === 'teacher' || userRole === 'lab-assistant' || userRole === 'admin';

  // Load teacherId from localStorage (runs once on mount)
  useEffect(() => {
    const storedTeacherId = localStorage.getItem('teacherId');
    if (storedTeacherId) {
      setCurrentUserId(Number(storedTeacherId));
    } else {
      console.error('Teacher not found. Please login again.');
    }
    setUserLoaded(true);
  }, []); // Empty dependency array - runs only once

  // Fetch practicals when dependencies change
  const fetchPracticals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Safety check for teachers
      if (canUpload && !currentUserId) {
        console.warn('⏳ Waiting for teacherId...');
        return;
      }

      const filters: any = {
        search: searchQuery || undefined,
        subject: selectedSubject !== 'all' ? selectedSubject : undefined,
        grade: selectedGrade !== 'all' ? selectedGrade : undefined,
      };

      // Only attach teacherId when it exists
      if (canUpload && currentUserId !== null) {
        filters.teacherId = currentUserId;
      }

      console.log('📤 Fetch filters:', filters);

      const data = await practicalService.getAll(filters);

      if (!Array.isArray(data)) {
        throw new Error('API did not return an array');
      }

      setPracticals(data);
    } catch (err: any) {
      console.error('❌ fetchPracticals failed:', err);
      setError(err.message || 'Failed to load practicals');
      setPracticals([]);
    } finally {
      setLoading(false);
    }
  }, [canUpload, currentUserId, searchQuery, selectedSubject, selectedGrade]);

  // Fetch practicals when dependencies change
  // Fetch practicals when dependencies change
useEffect(() => {
  const loadPracticals = async () => {
    // Skip fetching if teacherId not loaded yet
    if (canUpload && currentUserId === null) {
      console.warn('⏳ Waiting for teacherId...');
      return;
    }

    try {
      await fetchPracticals();
    } catch (err) {
      console.error('Error fetching practicals:', err);
    }
  };

  loadPracticals();
}, [searchQuery, selectedSubject, selectedGrade, refreshKey, currentUserId, canUpload]);


  const filteredPracticals = practicals;

  const handleAddPractical = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    const form = e.currentTarget as HTMLFormElement;

    const formData = {
      title: (form.querySelector('[name="title"]') as HTMLInputElement)?.value || '',
      description: (form.querySelector('[name="description"]') as HTMLTextAreaElement)?.value || '',
      subject: (form.querySelector('[name="subject"]') as HTMLSelectElement)?.value || '',
      grade: (form.querySelector('[name="grade"]') as HTMLSelectElement)?.value || '',
      duration: (form.querySelector('[name="duration"]') as HTMLInputElement)?.value || '',
      difficulty: (form.querySelector('[name="difficulty"]') as HTMLSelectElement)?.value || 'Intermediate',
      videoUrl: (form.querySelector('[name="videoUrl"]') as HTMLInputElement)?.value || '',
      labSheetUrl: (form.querySelector('[name="labSheetUrl"]') as HTMLInputElement)?.value || '',
      thumbnail: (form.querySelector('[name="thumbnail"]') as HTMLInputElement)?.value || '',
    };

    if (!formData.title || !formData.subject || !formData.grade || !formData.duration) {
      alert('Please fill in all required fields');
      return;
    }

    if (currentUserId === null) {
      alert('Teacher not found. Please login again.');
      return;
    }

    // Wrap in try/catch to catch API errors
    try {
      await practicalService.create({
        title: formData.title,
        description: formData.description || undefined,
        subject: formData.subject,
        grade: formData.grade,
        duration: formData.duration,
        difficulty: difficultyFromUI(formData.difficulty),
        videoUrl: formData.videoUrl || undefined,
        labSheetUrl: formData.labSheetUrl || undefined,
        thumbnail: formData.thumbnail || undefined,
        teacherId: currentUserId,
      });

      setRefreshKey(prev => prev + 1);
      setIsAddDialogOpen(false);
      form.reset();
      alert('Practical created successfully!');
    } catch (apiErr: any) {
      console.error('API error creating practical:', apiErr);
      alert(apiErr.message || 'Failed to create practical');
    }
  } catch (err: any) {
    console.error('Unexpected error in handleAddPractical:', err);
    alert(err.message || 'Something went wrong');
  } finally {
    setIsSubmitting(false);
  }
};


  // Add this function for updating practical
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
      
      await practicalService.update(editingPractical.id, updateData);
      setRefreshKey(prev => prev + 1);
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
    // Call the service
    const deletedCount = await practicalService.delete(id);

    // Update the practicals list
    setPracticals(prev => prev.filter(p => p.id !== id));

    alert(`Practical deleted successfully! Quizzes removed: ${deletedCount}`);
  } catch (err: any) {
    console.error('Error deleting practical:', err);
    alert(`Failed to delete practical: ${err.message}`);
  }
};


  // Handle starting edit
  const handleStartEdit = (practical: Practical) => {
    setEditingPractical(practical);
    setIsEditDialogOpen(true);
  };

  // Add these quiz management functions
  const handleAddQuiz = (quizData: Omit<Quiz, 'id' | 'createdAt'>) => {
    console.log('Adding quiz:', quizData);
    // You'll need to implement actual API call here
    fetchPracticals(); // Refresh practicals to show new quiz
  };

  const handleEditQuiz = (quizId: string, updates: Partial<Quiz>) => {
    console.log('Editing quiz:', quizId, updates);
    fetchPracticals(); // Refresh practicals
  };

  const handleDeleteQuiz = (quizId: string) => {
    console.log('Deleting quiz:', quizId);
    fetchPracticals(); // Refresh practicals
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
    setSelectedPractical(null);
    
    console.log('Quiz submitted:', newAttempt);
  };

  // Helper functions
  const getSubjectColor = (subject: string) => {
    switch (subject) {
      case 'Chemistry': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Physics': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Biology': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Science': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-pink-100 text-pink-700 border-pink-200';
    }
  };

  const getDifficultyColor = (difficulty: DifficultyLevel) => {
    const uiDifficulty = difficultyToUI(difficulty);
    switch (uiDifficulty) {
      case 'Beginner': return 'bg-green-100 text-green-700';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'Advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const getSafeThumbnail = (thumbnail: string | null | undefined): string => {
    if (!thumbnail || thumbnail === '#') {
      return '/default-thumbnail.jpg';
    }
    return thumbnail;
  };

  // Loading state
  if (loading && practicals.length === 0) {
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

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Debug Panel */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-medium">Debug Panel</p>
              <p className="text-xs text-blue-600 mt-1">
                Showing {practicals.length} practicals • 
                User ID: <span className="font-bold">{currentUserId}</span> • 
                Role: {userRole} • 
                Can Upload: {canUpload ? 'Yes' : 'No'}
              </p>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-2">
              <p className="text-xs text-red-700">
                API Error: {error}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-gray-900 mb-2">Practical Videos & Lab Sheets</h2>
          <p className="text-gray-600">
            Access video demonstrations and downloadable lab sheets for your science practicals
          </p>
        </div>
        {canUpload && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800">
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
                    <Select name="subject" required defaultValue="Chemistry">
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
                    <Select name="grade" required defaultValue="Grade 10">
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
                    <Select name="difficulty" defaultValue="Intermediate">
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
                      defaultValue="45 min"
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
        )}
      </div>

      {/* Filters */}
      <Card className="shadow-md border-blue-100">
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
                  className="pl-10 pr-10"
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <div>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
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
                <SelectTrigger>
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

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600">
            Showing <span className="text-blue-700 font-medium">{filteredPracticals.length}</span> practical{filteredPracticals.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setRefreshKey(prev => prev + 1)}
        >
          <Loader2 className="w-4 h-4 mr-1" />
          Refresh
        </Button>
      </div>

      {/* Practicals Grid */}
      <AnimatePresence mode="wait">
        {filteredPracticals.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredPracticals.map((practical) => (
              <Card key={practical.id} className="overflow-hidden border-gray-200">
                <div className="flex flex-col sm:flex-row">
                  {/* Thumbnail */}
                  <div className="sm:w-48 h-48 sm:h-auto bg-gray-100 flex-shrink-0">
                    <ImageWithFallback
                      src={getSafeThumbnail(practical.thumbnail)}
                      alt={practical.title}
                      className="w-full h-full object-cover"
                    />
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
                        {/* Add quiz badge if quizzes exist */}
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
                            className="bg-gradient-to-r from-blue-600 to-blue-700"
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
                            asChild
                          >
                            <a href={practical.labSheetUrl} target="_blank" rel="noopener noreferrer">
                              <FileText className="w-4 h-4 mr-2" />
                              Lab Sheet
                            </a>
                          </Button>
                        )}
                        
                        {/* Quiz Button - Opens the quiz dialog */}
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700"
                          onClick={() => setSelectedPractical(practical)}
                        >
                          <BarChart3 className="w-4 h-4 mr-2" />
                          Quiz
                        </Button>
                        
                        {canUpload && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
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
            ))}
          </div>
        ) : (
          <Card className="py-12 border-blue-100">
            <CardContent className="text-center">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-gray-900 mb-2">No practicals found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery 
                  ? `No results found for "${searchQuery}"`
                  : 'No practicals available yet'}
              </p>
              <Button variant="default" onClick={() => setRefreshKey(prev => prev + 1)}>
                <Loader2 className="w-4 h-4 mr-2" />
                Refresh Data
              </Button>
            </CardContent>
          </Card>
        )}
      </AnimatePresence>

      {/* Quiz Dialog - Single instance outside the map */}
      {selectedPractical && (
        <Dialog 
          open={!!selectedPractical} 
          onOpenChange={(open) => !open && setSelectedPractical(null)}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedPractical.title} - Quizzes</DialogTitle>
              <DialogDescription>
                {userRole === 'student' 
                  ? 'Take quizzes to test your knowledge' 
                  : 'Manage quizzes for this practical'}
            </DialogDescription>
            </DialogHeader>
            <QuizManager
              key={`quiz-manager-${selectedPractical.id}`}
              practicalId={selectedPractical.id.toString()}
              userRole={userRole}
              quizzes={selectedPractical.quizzes || []}
              onAddQuiz={handleAddQuiz}
              onEditQuiz={handleEditQuiz}
              onDeleteQuiz={handleDeleteQuiz}
              quizAttempts={quizAttempts.filter(a => 
                (selectedPractical.quizzes || []).some(q => q.id === a.quizId)
              )}
            />
          </DialogContent>
        </Dialog>
      )}

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