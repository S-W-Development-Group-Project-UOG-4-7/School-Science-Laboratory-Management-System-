'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Search, Play, FileText, Download, BookOpen, Plus, Upload, Video, X, CheckCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { motion } from 'framer-motion';

type UserRole = 'student' | 'teacher' | 'admin' | 'staff';

interface PracticalsPageProps {
  userRole: UserRole;
}

interface Practical {
  id: string;
  title: string;
  grade: string;
  subject: 'Physics' | 'Chemistry' | 'Biology';
  videoUrl: string;
  labSheetUrl: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  thumbnail: string;
}

const initialPracticals: Practical[] = [
  {
    id: '1',
    title: 'Acid-Base Titration',
    grade: 'Grade 11',
    subject: 'Chemistry',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    labSheetUrl: '#',
    duration: '45 min',
    difficulty: 'Intermediate',
    description: 'Learn the proper technique for conducting acid-base titrations using standard solutions.',
    thumbnail: 'https://images.unsplash.com/photo-1761095596584-34731de3e568?w=400',
  },
  {
    id: '2',
    title: 'Microscope Usage and Cell Observation',
    grade: 'Grade 9',
    subject: 'Biology',
    videoUrl: '',
    labSheetUrl: '#',
    duration: '30 min',
    difficulty: 'Beginner',
    description: 'Introduction to compound microscope operation and observing plant and animal cells.',
    thumbnail: 'https://images.unsplash.com/photo-1614308457932-e16d85c5d053?w=400',
  },
  {
    id: '3',
    title: "Newton's Laws of Motion Experiments",
    grade: 'Grade 10',
    subject: 'Physics',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    labSheetUrl: '#',
    duration: '60 min',
    difficulty: 'Intermediate',
    description: 'Practical demonstrations of Newton\'s three laws of motion with calculations.',
    thumbnail: 'https://images.unsplash.com/photo-1606206605628-0a09580d44a1?w=400',
  },
];

export function PracticalsPage({ userRole }: PracticalsPageProps) {
  const [practicals, setPracticals] = useState<Practical[]>(initialPracticals);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isVideoUploadDialogOpen, setIsVideoUploadDialogOpen] = useState(false);
  const [isVideoPlayerDialogOpen, setIsVideoPlayerDialogOpen] = useState(false);
  const [selectedPracticalForVideo, setSelectedPracticalForVideo] = useState<string | null>(null);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>('');
  
  // Form states
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Permissions
  const canCreatePractical = userRole === 'teacher';
  const canUploadVideo = userRole === 'admin';
  const canViewAll = userRole === 'admin' || userRole === 'teacher' || userRole === 'staff';

  const filteredPracticals = practicals.filter((practical) => {
    const matchesSearch = practical.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      practical.description.toLowerCase().includes(searchQuery.toLowerCase());
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
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
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

  const handleVideoUpload = (practicalId: string) => {
    const practical = practicals.find(p => p.id === practicalId);
    setSelectedPracticalForVideo(practicalId);
    setVideoUrlInput(practical?.videoUrl || '');
    setVideoFile(null);
    setIsVideoUploadDialogOpen(true);
  };

  const handleCreatePractical = () => {
    console.log('Creating practical...');
    setIsAddDialogOpen(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoUrlInput(''); // Clear URL input when file is selected
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
  };

  const handleSubmitVideo = () => {
    if (!selectedPracticalForVideo) return;

    if (videoFile) {
      // Simulate file upload
      simulateUpload();
      setTimeout(() => {
        // In real implementation, this would be the URL returned from your server
        const mockUploadedUrl = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
        
        setPracticals(prev => prev.map(p => 
          p.id === selectedPracticalForVideo 
            ? { ...p, videoUrl: mockUploadedUrl }
            : p
        ));
        
        setVideoFile(null);
        setVideoUrlInput('');
        setUploadProgress(0);
        setIsVideoUploadDialogOpen(false);
      }, 3500);
    } else if (videoUrlInput) {
      // Use provided URL
      setPracticals(prev => prev.map(p => 
        p.id === selectedPracticalForVideo 
          ? { ...p, videoUrl: videoUrlInput }
          : p
      ));
      setVideoUrlInput('');
      setIsVideoUploadDialogOpen(false);
    }
  };

  const handleWatchVideo = (videoUrl: string) => {
    setCurrentVideoUrl(videoUrl);
    setIsVideoPlayerDialogOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Practical Videos & Lab Sheets</h2>
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
                    <h4 className="font-semibold text-gray-900">Upload Materials</h4>
                    
                    <div className="space-y-2">
                      <Label htmlFor="labsheet">Lab Sheet (PDF)</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-emerald-400 transition-colors cursor-pointer">
                        <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-1">Click to upload PDF or drag and drop</p>
                        <p className="text-xs text-gray-500">PDF up to 10MB</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="thumbnail">Thumbnail Image</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-emerald-400 transition-colors cursor-pointer">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-1">Click to upload image or drag and drop</p>
                        <p className="text-xs text-gray-500">JPG, PNG up to 5MB</p>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        <strong>Note:</strong> Video upload will be handled by the admin. After creating this practical, the admin can upload the demonstration video.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreatePractical} className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Practical
                    </Button>
                  </div>
                </div>
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
      >
        <Card className="shadow-md hover:shadow-lg transition-shadow border-blue-100">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search practicals..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 transition-all hover:border-blue-400 focus:border-blue-500"
                  />
                </div>
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
                    <SelectItem value="Grade 13">Grade 13</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          Showing <span className="font-semibold text-blue-700">{filteredPracticals.length}</span> practical{filteredPracticals.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Practicals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPracticals.map((practical, index) => (
          <motion.div
            key={practical.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-gray-200 hover:border-blue-300 group">
              <div className="flex flex-col sm:flex-row">
                <div className="sm:w-48 h-48 sm:h-auto bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0 relative overflow-hidden">
                  <img
                    src={practical.thumbnail}
                    alt={practical.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-12 h-12 text-white" />
                  </div>
                  {!practical.videoUrl && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="bg-yellow-500 text-white">
                        No Video
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="flex-1 flex flex-col">
                  <CardHeader>
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <Badge className={getSubjectColor(practical.subject)}>
                        {practical.subject}
                      </Badge>
                      <Badge variant="outline">{practical.grade}</Badge>
                    </div>
                    <CardTitle className="text-lg">{practical.title}</CardTitle>
                    <CardDescription>{practical.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col justify-between">
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge className={getDifficultyColor(practical.difficulty)} variant="outline">
                        {practical.difficulty}
                      </Badge>
                      <Badge variant="outline" className="bg-gray-50">
                        ⏱️ {practical.duration}
                      </Badge>
                    </div>

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
                      <Button size="sm" variant="outline" className="hover:bg-blue-50 hover:border-blue-300">
                        <FileText className="w-4 h-4 mr-2" />
                        Lab Sheet
                      </Button>
                      <Button size="sm" variant="outline" className="hover:bg-blue-50 hover:border-blue-300">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      
                      {canUploadVideo && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-purple-300 text-purple-700 hover:bg-purple-50"
                          onClick={() => handleVideoUpload(practical.id)}
                        >
                          <Video className="w-4 h-4 mr-2" />
                          {practical.videoUrl ? 'Update Video' : 'Upload Video'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredPracticals.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="py-12 border-blue-100">
            <CardContent className="text-center">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No practicals found</h3>
              <p className="text-gray-600">Try adjusting your filters or search query</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Admin Video Upload Dialog */}
      <Dialog open={isVideoUploadDialogOpen} onOpenChange={setIsVideoUploadDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload Practical Video</DialogTitle>
            <DialogDescription>
              Upload a video file or provide a YouTube/Vimeo URL
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* File Upload */}
            <div className="space-y-2">
              <Label>Upload Video File</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors cursor-pointer relative">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {videoFile ? (
                  <div className="space-y-2">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                    <p className="text-sm font-medium text-gray-700">{videoFile.name}</p>
                    <p className="text-xs text-gray-500">{(videoFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setVideoFile(null);
                      }}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                ) : (
                  <>
                    <Video className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 mb-1 font-medium">Click to upload video or drag and drop</p>
                    <p className="text-xs text-gray-500">MP4, AVI, MOV up to 500MB</p>
                  </>
                )}
              </div>
            </div>

            {/* OR Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">OR</span>
              </div>
            </div>

            {/* URL Input */}
            <div className="space-y-2">
              <Label htmlFor="video-url">Video URL (YouTube/Vimeo)</Label>
              <Input
                id="video-url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={videoUrlInput}
                onChange={(e) => {
                  setVideoUrlInput(e.target.value);
                  setVideoFile(null); // Clear file when URL is entered
                }}
              />
              <p className="text-xs text-gray-500">
                Paste a YouTube or Vimeo link. It will be embedded in the player.
              </p>
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Uploading...</span>
                  <span className="text-gray-900 font-medium">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm text-purple-800">
                <strong>Admin Access:</strong> Upload video files or provide streaming URLs. Teachers manage other practical content.
              </p>
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
    </div>
  );
}