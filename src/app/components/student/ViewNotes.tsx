'use client';

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Loader2, BookOpen, Download, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { get } from '@/utils/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

interface ViewNotesProps {
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

export function ViewNotes({ studentId }: ViewNotesProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPractical, setSelectedPractical] = useState<string>('all');

  useEffect(() => {
    if (isOpen) {
      fetchNotes();
    }
  }, [isOpen, selectedPractical]);

  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      const url = selectedPractical === 'all' 
        ? '/api/notes' 
        : `/api/notes?practicalId=${selectedPractical}`;
      
      const response = await get(url);
      if (response.success && response.data) {
        setNotes(response.data);
        if (response.data.length === 0) {
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

  const handleDownload = (fileUrl: string, title: string) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = title;
    link.click();
  };

  const uniquePracticals = Array.from(
    new Map(notes.map(note => [note.practical.id, note.practical])).values()
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="hover:bg-blue-50 hover:border-blue-300">
          <BookOpen className="w-4 h-4 mr-2" />
          View Notes
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Study & Lab Notes</DialogTitle>
          <DialogDescription>
            View and download notes for practical sessions
          </DialogDescription>
        </DialogHeader>
        
        {/* Filter */}
        {notes.length > 0 && (
          <div className="mb-4">
            <select
              value={selectedPractical}
              onChange={(e) => setSelectedPractical(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Practicals</option>
              {uniquePracticals.map((practical) => (
                <option key={practical.id} value={practical.id.toString()}>
                  {practical.title} - {practical.subject}
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
          <div className="py-12 text-center text-gray-500">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>No notes available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <Card key={note.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{note.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {note.description || 'No description available'}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="ml-2">
                      {note.practical.subject}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">
                      <p><strong>Practical:</strong> {note.practical.title}</p>
                      <p><strong>Lab:</strong> {note.practical.lab}</p>
                      <p><strong>Added:</strong> {new Date(note.createdAt).toLocaleDateString()}</p>
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
      </DialogContent>
    </Dialog>
  );
}



