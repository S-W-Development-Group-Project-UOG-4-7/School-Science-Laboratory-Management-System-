'use client';

import { useState, useEffect, useRef, useId, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Search, Play, FileText, BookOpen, Plus, Upload, Video, X, CheckCircle, HelpCircle } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import {
  Search,
  Play,
  FileText,
  BookOpen,
  Plus,
  X,
  Loader2,
  Edit,
  Trash2,
  User,
  BarChart3,
  Video,
  Upload,
  CheckCircle,
  Download,
  Users
} from 'lucide-react';
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
  CreatePracticalInput,
  UpdatePracticalInput,
  QuizAttemptStatus
} from '@/src/app/lib/types'; 
import { ImageWithFallback } from './general-images/ImageWithFallback';
import { QuizManager } from './quiz/QuizManager';
import { practicalService } from '@/src/app/lib/services/practicalService';

interface PracticalsPageProps {
  userRole: UserRole;
  userId?: number;
}

// Interface for student quiz results
interface StudentQuizResult {
  studentId: number;
  studentName: string;
  email?: string;
  quizId: string;
  quizTitle: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  status: QuizAttemptStatus;
  startedAt: Date;
  completedAt: Date;
  timeTaken: string; // in minutes
}

export function PracticalsPage({ userRole, userId }: PracticalsPageProps) {
  const [practicals, setPracticals] = useState<Practical[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isVideoUploadDialogOpen, setIsVideoUploadDialogOpen] = useState(false);
  const [isVideoPlayerDialogOpen, setIsVideoPlayerDialogOpen] = useState(false);
  const [selectedPracticalForVideo, setSelectedPracticalForVideo] = useState<string | null>(null);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>('');

  // Form states
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPractical, setSelectedPractical] = useState<Practical | null>(null);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPractical, setEditingPractical] = useState<Practical | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [userLoaded, setUserLoaded] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [subject, setSubject] = useState<string>("Chemistry");
  const [grade, setGrade] = useState<string>("");
  
  // File upload states
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [labSheetFile, setLabSheetFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{
    video: number;
    labSheet: number;
    thumbnail: number;
  }>({ video: 0, labSheet: 0, thumbnail: 0 });
  const [isUploading, setIsUploading] = useState(false);
  
  // Quiz results states
  const [quizResults, setQuizResults] = useState<StudentQuizResult[]>([]);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  
  const componentId = useId();
  const canUpload = userRole === 'teacher' || userRole === 'lab-assistant' || userRole === 'admin';

  // Quiz states
  const [isQuizDialogOpen, setIsQuizDialogOpen] = useState(false);
  const [quizStep, setQuizStep] = useState<'intro' | 'questions' | 'result'>('intro');
  const [currentQuizScore, setCurrentQuizScore] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [activeQuizPractical, setActiveQuizPractical] = useState<Practical | null>(null);

  const sampleQuestions = [
    {
      id: 1,
      question: "Which of the following is an example of a chemical change?",
      options: ["Melting ice", "Rusting iron", "Breaking glass", "Boiling water"],
      correctAnswer: "Rusting iron"
    },
    {
      id: 2,
      question: "What is the powerhouse of the cell?",
      options: ["Nucleus", "Mitochondria", "Ribosome", "Endoplasmic Reticulum"],
      correctAnswer: "Mitochondria"
    },
    {
      id: 3,
      question: "Newton's First Law is also known as the law of:",
      options: ["Inertia", "Acceleration", "Action-Reaction", "Gravity"],
      correctAnswer: "Inertia"
    },
    {
      id: 4,
      question: "What comes after a hypothesis in the scientific method?",
      options: ["Conclusion", "Experiment", "Observation", "Theory"],
      correctAnswer: "Experiment"
    },
    {
      id: 5,
      question: "Which pH value indicates a strong acid?",
      options: ["13", "7", "9", "1"],
      correctAnswer: "1"
    }
  ];

  // Permissions
  const canCreatePractical = userRole === 'teacher';
  const canUploadVideo = userRole === 'admin';
  const canViewAll = userRole === 'admin' || userRole === 'teacher';
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

  // Function to fetch quiz results for a practical
  const fetchQuizResults = async (practicalId: number) => {
    if (!canUpload) return;
    
    setIsLoadingResults(true);
    try {
      // In a real app, you would call your API here
      // For now, we'll simulate some data
      const mockResults: StudentQuizResult[] = [
        {
          studentId: 1,
          studentName: 'John Doe',
          email: 'john@example.com',
          quizId: 'quiz-1',
          quizTitle: 'Chemistry Basics Quiz',
          score: 8,
          totalQuestions: 10,
          percentage: 80,
          status: QuizAttemptStatus.COMPLETED,
          startedAt: new Date('2024-01-15T10:00:00'),
          completedAt: new Date('2024-01-15T10:15:00'),
          timeTaken: '15'
        },
        {
          studentId: 2,
          studentName: 'Jane Smith',
          email: 'jane@example.com',
          quizId: 'quiz-1',
          quizTitle: 'Chemistry Basics Quiz',
          score: 9,
          totalQuestions: 10,
          percentage: 90,
          status: QuizAttemptStatus.COMPLETED,
          startedAt: new Date('2024-01-15T11:00:00'),
          completedAt: new Date('2024-01-15T11:20:00'),
          timeTaken: '20'
        },
        {
          studentId: 3,
          studentName: 'Bob Johnson',
          email: 'bob@example.com',
          quizId: 'quiz-2',
          quizTitle: 'Advanced Chemistry Quiz',
          score: 6,
          totalQuestions: 10,
          percentage: 60,
          status: QuizAttemptStatus.COMPLETED,
          startedAt: new Date('2024-01-16T09:00:00'),
          completedAt: new Date('2024-01-16T09:25:00'),
          timeTaken: '25'
        }
      ];
      
      setQuizResults(mockResults);
    } catch (err) {
      console.error('Error fetching quiz results:', err);
      alert('Failed to load quiz results');
    } finally {
      setIsLoadingResults(false);
    }
  };

  // Function to export quiz results to Excel
  const exportQuizResultsToExcel = (practicalTitle: string) => {
    if (quizResults.length === 0) {
      alert('No quiz results to export');
      return;
    }

    try {
      // Create CSV content
      const headers = [
        'Student ID',
        'Student Name',
        'Email',
        'Quiz ID',
        'Quiz Title',
        'Score',
        'Total Questions',
        'Percentage (%)',
        'Status',
        'Started At',
        'Completed At',
        'Time Taken (min)'
      ];

      const csvContent = [
        headers.join(','),
        ...quizResults.map(result => [
          result.studentId,
          `"${result.studentName}"`,
          `"${result.email || ''}"`,
          result.quizId,
          `"${result.quizTitle}"`,
          result.score,
          result.totalQuestions,
          result.percentage,
          result.status,
          result.startedAt.toISOString(),
          result.completedAt.toISOString(),
          result.timeTaken
        ].join(','))
      ].join('\n');

      // Create a blob and download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `${practicalTitle.replace(/[^a-z0-9]/gi, '_')}_quiz_results_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert(`Quiz results exported successfully! ${quizResults.length} records downloaded.`);
    } catch (err) {
      console.error('Error exporting quiz results:', err);
      alert('Failed to export quiz results');
    }
  };

  // Simple upload function
  const uploadFile = async (file: File, type: 'video' | 'labSheet' | 'thumbnail'): Promise<string> => {
    return new Promise((resolve, reject) => {
      // For now, we'll create a fake URL for demonstration
      // In production, you would upload to your server here
      setTimeout(() => {
        const fakeUrl = `https://example.com/uploads/${type}/${Date.now()}_${file.name}`;
        resolve(fakeUrl);
      }, 1000);
    });
  };

  const handleAddPractical = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setIsSubmitting(true);
  setError(null);

  try {
    const form = e.currentTarget;
    const formData = new FormData(form);

    // Validation
    const requiredFields = ['title', 'subject', 'grade', 'duration'];
    for (const field of requiredFields) {
      if (!formData.get(field)) {
        alert('Please fill in all required fields');
        setIsSubmitting(false);
        return;
      }
    }

    if (currentUserId === null) {
      alert('Teacher not found. Please login again.');
      setIsSubmitting(false);
      return;
    }

    let videoUrl = formData.get('videoUrl') as string || '';
    let labSheetUrl = formData.get('labSheetUrl') as string || '';
    let thumbnailUrl = formData.get('thumbnail') as string || '';

    setIsUploading(true);

    // Helper function for upload
    const safeUpload = async (file: File | null, type: 'video' | 'labSheet' | 'thumbnail') => {
      if (!file) return '';
      setUploadProgress(prev => ({ ...prev, [type]: 0 }));
      try {
        const url = await uploadFile(file, type);
        setUploadProgress(prev => ({ ...prev, [type]: 100 }));
        return url;
      } catch (err) {
        console.error(`Failed to upload ${type}:`, err);
        return '';
      }
    };

    // Upload files
    videoUrl = await safeUpload(videoFile, 'video') || videoUrl;
    labSheetUrl = await safeUpload(labSheetFile, 'labSheet') || labSheetUrl;
    thumbnailUrl = await safeUpload(thumbnailFile, 'thumbnail') || thumbnailUrl;

    // Create practical
    const newPractical = await practicalService.create({
      title: formData.get('title') as string,
      description: formData.get('description') as string || undefined,
      subject: formData.get('subject') as string,
      grade: formData.get('grade') as string,
      duration: formData.get('duration') as string,
      videoUrl: videoUrl || undefined,
      labSheetUrl: labSheetUrl || undefined,
      thumbnail: thumbnailUrl || undefined,
      teacherId: currentUserId,
    });

    // Add to existing practicals state
    setPracticals(prev => [newPractical, ...prev]);

    // Reset form
    setIsAddDialogOpen(false);
    setVideoFile(null);
    setLabSheetFile(null);
    setThumbnailFile(null);
    setUploadProgress({ video: 0, labSheet: 0, thumbnail: 0 });
    form.reset();

    alert('Practical created successfully!');
  } catch (err: any) {
    console.error('Error creating practical:', err);
    setError(err.message || 'Failed to create practical');
    alert(err.message || 'Something went wrong');
  } finally {
    setIsSubmitting(false);
    setIsUploading(false);
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

  const simulateUpload = () => {
    setIsUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
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
      status: QuizAttemptStatus.COMPLETED
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
      case 'Science': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-pink-100 text-pink-700 border-pink-200';
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

    try {
      const response = await fetch(`/api/practicals/${selectedPracticalForVideo}/upload-video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoUrl: videoUrlInput }),
      });

      const data = await response.json();

      if (data.success) {
        // Update local state with the embed URL
        setPracticals(prev => prev.map(p =>
          p.id === selectedPracticalForVideo
            ? { ...p, videoUrl: data.videoUrl }
            : p
        ));

        setVideoUrlInput('');
        setIsVideoUploadDialogOpen(false);
      } else {
        alert(data.error || 'Failed to save video URL');
      }
    } catch (error) {
      console.error('Error saving video URL:', error);
      alert('Failed to save video URL');
  const getSafeThumbnail = (thumbnail: string | null | undefined): string => {
    if (!thumbnail || thumbnail === '#') {
      return '/default-thumbnail.jpg';
    }
    return thumbnail;
  };

  // Function to reset file states when dialog closes
  const resetFileStates = () => {
    setVideoFile(null);
    setLabSheetFile(null);
    setThumbnailFile(null);
    setUploadProgress({ video: 0, labSheet: 0, thumbnail: 0 });
  };

  const handleDownloadLabSheet = (practical: Practical) => {
    // In a real app, this would be a real URL. For now we simulate/use the placeholder.
    if (practical.labSheetUrl === '#' || !practical.labSheetUrl) {
      // Fallback or demo behavior
      const link = document.createElement('a');
      link.href = '/sample_lab_sheet.pdf'; // Dummy path or maybe create a text blob
      link.download = `${practical.title.replace(/\s+/g, '_')}_Lab_Sheet.pdf`;
      // Create a dummy blob if no real url
      const blob = new Blob(['Sample Lab Sheet Content for ' + practical.title], { type: 'text/plain' });
      link.href = URL.createObjectURL(blob);

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const link = document.createElement('a');
      link.href = practical.labSheetUrl;
      link.download = `${practical.title.replace(/\s+/g, '_')}_Lab_Sheet.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleStartQuiz = (practical: Practical) => {
    setActiveQuizPractical(practical);
    setQuizStep('intro');
    setQuizAnswers({});
    setCurrentQuizScore(0);
    setIsQuizDialogOpen(true);
  };

  const handleQuizAnswer = (questionId: number, answer: string) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmitQuiz = () => {
    let score = 0;
    sampleQuestions.forEach(q => {
      if (quizAnswers[q.id] === q.correctAnswer) {
        score++;
      }
    });
    const percentage = (score / sampleQuestions.length) * 100;
    setCurrentQuizScore(percentage);
    setQuizStep('result');
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
          <div className="mt-2">
            <Badge variant="outline" className="text-xs">
              Role: {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
            </Badge>
          </div>
        </motion.div>

        {canCreatePractical && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Practical
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Practical</DialogTitle>
                  <DialogDescription>
                    Create a new practical with description, lab sheets, and other materials. Admin will upload videos separately.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
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
                          <SelectItem value="9">Grade 9</SelectItem>
                          <SelectItem value="10">Grade 10</SelectItem>
                          <SelectItem value="11">Grade 11</SelectItem>
                          <SelectItem value="12">Grade 12</SelectItem>
                          <SelectItem value="13">Grade 13</SelectItem>
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
        {canUpload && (
          <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
            setIsAddDialogOpen(open);
            if (!open) {
              resetFileStates();
            }
          }}>
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
                    <Select
                      name="subject"
                      value={subject}
                      onValueChange={(value) => {
                        setSubject(value);
                        setGrade(""); // reset grade when subject changes
                      }}
                      required
                    >
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
                    <Select
                      name="grade"
                      value={grade}
                      onValueChange={setGrade}
                      required
                    >
                      <SelectTrigger id="grade">
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {/* Physics / Chemistry / Biology → Grade 10 to 13 */}
                        {(subject === "Physics" ||
                          subject === "Chemistry" ||
                          subject === "Biology") && (
                          <>
                            <SelectItem value="Grade 10">Grade 10</SelectItem>
                            <SelectItem value="Grade 11">Grade 11</SelectItem>
                            <SelectItem value="Grade 12">Grade 12</SelectItem>
                            <SelectItem value="Grade 13">Grade 13</SelectItem>
                          </>
                        )}

                        {/* Science → Grade 6 to 11 */}
                        {subject === "Science" && (
                          <>
                            <SelectItem value="Grade 6">Grade 6</SelectItem>
                            <SelectItem value="Grade 7">Grade 7</SelectItem>
                            <SelectItem value="Grade 8">Grade 8</SelectItem>
                            <SelectItem value="Grade 9">Grade 9</SelectItem>
                            <SelectItem value="Grade 10">Grade 10</SelectItem>
                            <SelectItem value="Grade 11">Grade 11</SelectItem>
                          </>
                        )}
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
                </div>

                {/* File Upload Section */}
                <div className="space-y-4 pt-4 border-t">
                  <h4 className="text-gray-900">Upload Files or Provide URLs</h4>
                  
                  {/* Video Upload */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="video">Practical Video</Label>
                      <span className="text-xs text-gray-500">Optional</span>
                    </div>
                    
                    <div className="space-y-2">
                      {/* File Upload Option */}
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-emerald-400 transition-colors cursor-pointer relative"
                        onClick={() => document.getElementById('video-file-input')?.click()}>
                        <Input 
                          id="video-file-input" 
                          type="file" 
                          accept="video/*" 
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            setVideoFile(file);
                          }}
                        />
                        <Video className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        {videoFile ? (
                          <div className="space-y-1">
                            <div className="flex items-center justify-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <p className="text-sm text-gray-700 font-medium truncate max-w-xs">
                                {videoFile.name}
                              </p>
                            </div>
                            <p className="text-xs text-gray-500">
                              {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                              {uploadProgress.video > 0 && ` • Uploading: ${uploadProgress.video}%`}
                            </p>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="mt-1 h-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                setVideoFile(null);
                              }}
                            >
                              <X className="w-3 h-3 mr-1" /> Remove File
                            </Button>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm text-gray-600 mb-1">Click to upload video</p>
                            <p className="text-xs text-gray-500">MP4, AVI, MOV up to 500MB</p>
                          </>
                        )}
                      </div>
                      
                      {/* OR Separator */}
                      <div className="flex items-center my-2">
                        <div className="flex-1 border-t border-gray-300"></div>
                        <span className="px-3 text-xs text-gray-500">OR</span>
                        <div className="flex-1 border-t border-gray-300"></div>
                      </div>
                      
                      {/* URL Option */}
                      <div>
                        <Label htmlFor="videoUrl">Video URL</Label>
                        <Input 
                          id="videoUrl" 
                          name="videoUrl"
                          placeholder="https://example.com/video.mp4" 
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Provide a direct link to the video file
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <h4 className="font-semibold text-gray-900">Upload Materials</h4>

                  {/* Lab Sheet Upload */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="labsheet">Lab Sheet (PDF)</Label>
                      <span className="text-xs text-gray-500">Optional</span>
                    </div>
                    
                    <div className="space-y-2">
                      {/* File Upload Option */}
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-emerald-400 transition-colors cursor-pointer relative"
                        onClick={() => document.getElementById('labsheet-file-input')?.click()}>
                        <Input 
                          id="labsheet-file-input" 
                          type="file" 
                          accept=".pdf" 
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            setLabSheetFile(file);
                          }}
                        />
                        <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        {labSheetFile ? (
                          <div className="space-y-1">
                            <div className="flex items-center justify-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <p className="text-sm text-gray-700 font-medium truncate max-w-xs">
                                {labSheetFile.name}
                              </p>
                            </div>
                            <p className="text-xs text-gray-500">
                              {(labSheetFile.size / 1024).toFixed(2)} KB
                              {uploadProgress.labSheet > 0 && ` • Uploading: ${uploadProgress.labSheet}%`}
                            </p>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="mt-1 h-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                setLabSheetFile(null);
                              }}
                            >
                              <X className="w-3 h-3 mr-1" /> Remove File
                            </Button>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm text-gray-600 mb-1">Click to upload PDF</p>
                            <p className="text-xs text-gray-500">PDF up to 10MB</p>
                          </>
                        )}
                      </div>
                      
                      {/* OR Separator */}
                      <div className="flex items-center my-2">
                        <div className="flex-1 border-t border-gray-300"></div>
                        <span className="px-3 text-xs text-gray-500">OR</span>
                        <div className="flex-1 border-t border-gray-300"></div>
                      </div>
                      
                      {/* URL Option */}
                      <div>
                        <Label htmlFor="labSheetUrl">Lab Sheet URL</Label>
                        <Input 
                          id="labSheetUrl" 
                          name="labSheetUrl"
                          placeholder="https://example.com/lab-sheet.pdf" 
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Provide a direct link to the PDF file
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Thumbnail Upload */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="thumbnail">Thumbnail Image</Label>
                      <span className="text-xs text-gray-500">Optional</span>
                    </div>
                    
                    <div className="space-y-2">
                      {/* File Upload Option */}
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-emerald-400 transition-colors cursor-pointer relative"
                        onClick={() => document.getElementById('thumbnail-file-input')?.click()}>
                        <Input 
                          id="thumbnail-file-input" 
                          type="file" 
                          accept="image/*" 
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            setThumbnailFile(file);
                          }}
                        />
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        {thumbnailFile ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-center gap-3">
                              <img 
                                src={URL.createObjectURL(thumbnailFile)} 
                                alt="Preview" 
                                className="w-16 h-16 object-cover rounded border"
                              />
                              <div className="text-left">
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                  <p className="text-sm text-gray-700 font-medium truncate max-w-[200px]">
                                    {thumbnailFile.name}
                                  </p>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  {(thumbnailFile.size / 1024).toFixed(2)} KB
                                  {uploadProgress.thumbnail > 0 && ` • Uploading: ${uploadProgress.thumbnail}%`}
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="h-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                setThumbnailFile(null);
                              }}
                            >
                              <X className="w-3 h-3 mr-1" /> Remove File
                            </Button>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm text-gray-600 mb-1">Click to upload image</p>
                            <p className="text-xs text-gray-500">JPG, PNG up to 5MB</p>
                          </>
                        )}
                      </div>
                      
                      {/* OR Separator */}
                      <div className="flex items-center my-2">
                        <div className="flex-1 border-t border-gray-300"></div>
                        <span className="px-3 text-xs text-gray-500">OR</span>
                        <div className="flex-1 border-t border-gray-300"></div>
                      </div>
                      
                      {/* URL Option */}
                      <div>
                        <Label htmlFor="thumbnail">Thumbnail URL</Label>
                        <Input 
                          id="thumbnail" 
                          name="thumbnail"
                          placeholder="https://example.com/thumbnail.jpg" 
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Provide a direct link to the image
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsAddDialogOpen(false);
                      resetFileStates();
                    }}
                    disabled={isSubmitting || isUploading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                    disabled={isSubmitting || isUploading}
                  >
                    {(isSubmitting || isUploading) ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {isUploading ? 'Uploading...' : 'Creating...'}
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
                  {/* Show all grades when no specific subject is selected */}
                  {selectedSubject === 'all' && (
                    <>
                      <SelectItem value="Grade 6">Grade 6</SelectItem>
                      <SelectItem value="Grade 7">Grade 7</SelectItem>
                      <SelectItem value="Grade 8">Grade 8</SelectItem>
                      <SelectItem value="Grade 9">Grade 9</SelectItem>
                      <SelectItem value="Grade 10">Grade 10</SelectItem>
                      <SelectItem value="Grade 11">Grade 11</SelectItem>
                      <SelectItem value="Grade 12">Grade 12</SelectItem>
                      <SelectItem value="Grade 13">Grade 13</SelectItem>
                    </>
                  )}
                  {/* Show only Science grades (6-11) when Science is selected */}
                  {selectedSubject === 'Science' && (
                    <>
                      <SelectItem value="Grade 6">Grade 6</SelectItem>
                      <SelectItem value="Grade 7">Grade 7</SelectItem>
                      <SelectItem value="Grade 8">Grade 8</SelectItem>
                      <SelectItem value="Grade 9">Grade 9</SelectItem>
                      
                    </>
                  )}
                  {/* Show advanced grades (10-13) for Physics, Chemistry, Biology */}
                  {(selectedSubject === 'Physics' || selectedSubject === 'Chemistry' || selectedSubject === 'Biology') && (
                    <>
                      <SelectItem value="Grade 10">Grade 10</SelectItem>
                      <SelectItem value="Grade 11">Grade 11</SelectItem>
                      <SelectItem value="Grade 12">Grade 12</SelectItem>
                      <SelectItem value="Grade 13">Grade 13</SelectItem>
                    </>
                  )}
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

                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                        disabled={!practical.videoUrl}
                        onClick={() => practical.videoUrl && handleWatchVideo(practical.videoUrl)}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Watch Video
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="hover:bg-blue-50 hover:border-blue-300"
                        onClick={() => handleDownloadLabSheet(practical)}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Lab Sheet
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        className="hover:bg-blue-50 hover:border-blue-300"
                        onClick={() => handleStartQuiz(practical)}
                      >
                        <HelpCircle className="w-4 h-4 mr-2" />
                        Attempt Quiz
                      </Button>

                      {canUploadVideo && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-purple-300 text-purple-700 hover:bg-purple-50"
                          onClick={() => handleVideoUpload(practical.id)}
                    <CardContent className="flex-1 flex flex-col justify-between">
                      <div className="flex flex-wrap gap-2 mb-4">
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
          onOpenChange={(open) => {
            if (!open) {
              setSelectedPractical(null);
              setQuizResults([]);
            }
          }}
        >
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedPractical.title} - Quizzes</DialogTitle>
              <DialogDescription>
                {userRole === 'student' 
                  ? 'Take quizzes to test your knowledge' 
                  : 'Manage quizzes for this practical'}
            </DialogDescription>
            </DialogHeader>
            
            {/* Quiz Results Section for Teachers */}
            {canUpload && selectedPractical.quizzes && selectedPractical.quizzes.length > 0 && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Quiz Results</h3>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => fetchQuizResults(selectedPractical.id)}
                      disabled={isLoadingResults}
                    >
                      {isLoadingResults ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <BarChart3 className="w-4 h-4 mr-2" />
                          Load Results
                        </>
                      )}
                    </Button>
                    <Button 
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => exportQuizResultsToExcel(selectedPractical.title)}
                      disabled={quizResults.length === 0}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export Excel
                    </Button>
                  </div>
                </div>

                {quizResults.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-white p-3 rounded border">
                        <p className="text-sm text-gray-600">Total Students</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {new Set(quizResults.map(r => r.studentId)).size}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <p className="text-sm text-gray-600">Average Score</p>
                        <p className="text-2xl font-bold text-green-600">
                          {(quizResults.reduce((sum, r) => sum + r.percentage, 0) / quizResults.length).toFixed(1)}%
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <p className="text-sm text-gray-600">Total Attempts</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {quizResults.length}
                        </p>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left border">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 border">Student</th>
                            <th className="px-4 py-2 border">Quiz</th>
                            <th className="px-4 py-2 border">Score</th>
                            <th className="px-4 py-2 border">Percentage</th>
                            <th className="px-4 py-2 border">Time Taken</th>
                            <th className="px-4 py-2 border">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {quizResults.map((result, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-2 border">
                                <div>
                                  <p className="font-medium">{result.studentName}</p>
                                  <p className="text-xs text-gray-500">{result.email}</p>
                                </div>
                              </td>
                              <td className="px-4 py-2 border">{result.quizTitle}</td>
                              <td className="px-4 py-2 border">
                                {result.score}/{result.totalQuestions}
                              </td>
                              <td className="px-4 py-2 border">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  result.percentage >= 80 ? 'bg-green-100 text-green-800' :
                                  result.percentage >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {result.percentage}%
                                </span>
                              </td>
                              <td className="px-4 py-2 border">{result.timeTaken} min</td>
                              <td className="px-4 py-2 border">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  result.status === QuizAttemptStatus.COMPLETED ? 'bg-green-100 text-green-800' :
                                  result.status === QuizAttemptStatus.IN_PROGRESS ? 'bg-blue-100 text-blue-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {result.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="text-xs text-gray-500 mt-2">
                      Showing {quizResults.length} quiz attempts. Click "Export Excel" to download complete results.
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No quiz results loaded yet.</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Click "Load Results" to fetch student quiz attempts.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Quiz Manager */}
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
                      {/* Physics / Chemistry / Biology → Grade 10 to 13 */}
                      {(editingPractical.subject === "Physics" ||
                        editingPractical.subject === "Chemistry" ||
                        editingPractical.subject === "Biology") && (
                        <>
                          <SelectItem value="Grade 10">Grade 10</SelectItem>
                          <SelectItem value="Grade 11">Grade 11</SelectItem>
                          <SelectItem value="Grade 12">Grade 12</SelectItem>
                          <SelectItem value="Grade 13">Grade 13</SelectItem>
                        </>
                      )}

                      {/* Science → Grade 6 to 11 */}
                      {editingPractical.subject === "Science" && (
                        <>
                          <SelectItem value="Grade 6">Grade 6</SelectItem>
                          <SelectItem value="Grade 7">Grade 7</SelectItem>
                          <SelectItem value="Grade 8">Grade 8</SelectItem>
                          <SelectItem value="Grade 9">Grade 9</SelectItem>
                          
                        </>
                      )}
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
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
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
              <Button variant="outline" onClick={() => setIsVideoUploadDialogOpen(false)} disabled={isUploading}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmitVideo}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                disabled={(!videoFile && !videoUrlInput) || isUploading}
              >
                <Upload className="w-4 h-4 mr-2" />
                {isUploading ? 'Uploading...' : 'Upload Video'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Video Player Dialog */}
      <Dialog open={isVideoPlayerDialogOpen} onOpenChange={setIsVideoPlayerDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Watch Practical Video</DialogTitle>
          </DialogHeader>
          <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
            <iframe
              src={currentVideoUrl}
              className="w-full h-full"
              allowFullScreen
              title="Practical Video"
            ></iframe>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quiz Dialog */}
      <Dialog open={isQuizDialogOpen} onOpenChange={setIsQuizDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {quizStep === 'result' ? 'Quiz Result' : `Quiz: ${activeQuizPractical?.title || 'Science Practical'}`}
            </DialogTitle>
            <DialogDescription>
              {quizStep === 'intro' && "Test your knowledge before starting the practical."}
              {quizStep === 'questions' && "Answer the following questions."}
              {quizStep === 'result' && "Here is how you performed."}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {quizStep === 'intro' && (
              <div className="space-y-4 text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HelpCircle className="w-10 h-10 text-blue-600" />
                </div>
                <p className="text-gray-600">
                  This quiz contains {sampleQuestions.length} questions to test your understanding of the practical concepts.
                </p>
                <Button onClick={() => setQuizStep('questions')} className="w-full mt-4">
                  Start Quiz
                </Button>
              </div>
            )}

            {quizStep === 'questions' && (
              <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                {sampleQuestions.map((q, index) => (
                  <div key={q.id} className="space-y-3 p-4 border rounded-lg bg-gray-50/50">
                    <p className="font-medium text-gray-900">
                      {index + 1}. {q.question}
                    </p>
                    <RadioGroup
                      value={quizAnswers[q.id]}
                      onValueChange={(val) => handleQuizAnswer(q.id, val)}
                    >
                      {q.options.map((option) => (
                        <div key={option} className="flex items-center space-x-2">
                          <RadioGroupItem value={option} id={`q${q.id}-${option}`} />
                          <Label htmlFor={`q${q.id}-${option}`} className="font-normal cursor-pointer">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                ))}
                <Button
                  onClick={handleSubmitQuiz}
                  className="w-full mt-4"
                  disabled={Object.keys(quizAnswers).length < sampleQuestions.length}
                >
                  Submit Quiz
                </Button>
              </div>
            )}

            {quizStep === 'result' && (
              <div className="space-y-6 text-center">
                <div className="relative flex items-center justify-center w-32 h-32 rounded-full border-4 border-gray-100 mx-auto">
                  <div className="text-center">
                    <span className={`text-3xl font-bold ${currentQuizScore >= 80 ? 'text-green-600' :
                        currentQuizScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                      {currentQuizScore.toFixed(0)}%
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-lg font-medium">
                    {currentQuizScore >= 80 ? 'Excellent Work!' :
                      currentQuizScore >= 60 ? 'Good Effort!' : 'Keep Practicing!'}
                  </p>
                  <p className="text-gray-500">
                    You scored {Math.round((currentQuizScore / 100) * sampleQuestions.length)} out of {sampleQuestions.length}
                  </p>
                </div>

                <div className="flex justify-center gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsQuizDialogOpen(false)}>
                    Close
                  </Button>
                  <Button onClick={() => {
                    setQuizStep('questions');
                    setQuizAnswers({});
                    setCurrentQuizScore(0);
                  }}>
                    Retry Quiz
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
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