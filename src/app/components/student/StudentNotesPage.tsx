'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Loader2, BookOpen, Download, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { get } from '../../../utils/api';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

interface StudentNotesPageProps {
  studentId?: number;
}

interface Note {
  id: number;
  title: string;
  fileUrl: string | null;
  description: string | null;
  createdAt: string;
  practical: {
    id: number;
    title: string;
    subject: string;
    lab: string;
    dateTime: string;
  };
}

export function StudentNotesPage({ studentId }: StudentNotesPageProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  useEffect(() => {
    fetchNotes();
  }, [selectedSubject]);

  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      const response = await get('/api/notes');
      if (response.success && response.data) {
        let filteredNotes = response.data;
        
        if (selectedSubject !== 'all') {
          filteredNotes = filteredNotes.filter(
            (note: Note) => note.practical.subject.toLowerCase() === selectedSubject.toLowerCase()
          );
        }
        
        setNotes(filteredNotes);
        if (filteredNotes.length === 0) {
          toast.info('No notes available');
        }
      } else {
        toast.error(response.message || 'Failed to fetch notes');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const uniqueSubjects = Array.from(
    new Set(notes.map(note => note.practical.subject))
  );

  const handleDownload = (fileUrl: string, title: string) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = title;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Subject Notes</h2>
        <p className="text-gray-600">View and download study notes for practical sessions</p>
      </div>

      {/* Filter */}
      {notes.length > 0 && (
        <div className="flex gap-2">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Subjects</option>
            {uniqueSubjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : notes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>No notes available</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notes.map((note) => (
            <Card key={note.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{note.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {note.practical.title}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">{note.practical.subject}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {note.description && (
                    <p className="text-sm text-gray-600">{note.description}</p>
                  )}
                  <div className="text-xs text-gray-500">
                    <p>Lab: {note.practical.lab}</p>
                    <p>Added: {new Date(note.createdAt).toLocaleDateString()}</p>
                  </div>
                  {note.fileUrl && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(note.fileUrl!, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(note.fileUrl!, note.title)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

