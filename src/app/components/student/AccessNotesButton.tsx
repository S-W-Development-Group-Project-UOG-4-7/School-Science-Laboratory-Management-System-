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

interface AccessNotesButtonProps {
  practicalId: number;
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
  };
}

export function AccessNotesButton({ practicalId }: AccessNotesButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchNotes();
    }
  }, [isOpen, practicalId]);

  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      const response = await get(`/api/practicals/notes?practicalId=${practicalId}`);
      if (response.success && response.data) {
        setNotes(response.data);
        if (response.data.length === 0) {
          toast.info('No notes available for this practical');
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

  const handleDownload = (fileUrl: string) => {
    window.open(fileUrl, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="hover:bg-blue-50 hover:border-blue-300">
          <BookOpen className="w-4 h-4 mr-2" />
          Access Notes
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Practical Notes</DialogTitle>
          <DialogDescription>
            View and download notes for this practical session
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : notes.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>No notes available for this practical</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <Card key={note.id}>
                <CardHeader>
                  <CardTitle>{note.title}</CardTitle>
                  {note.description && (
                    <CardDescription>{note.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      Added {new Date(note.createdAt).toLocaleDateString()}
                    </span>
                    {note.fileUrl && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(note.fileUrl!)}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = note.fileUrl!;
                            link.download = note.title;
                            link.click();
                          }}
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



