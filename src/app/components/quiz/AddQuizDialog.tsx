'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Plus, Loader2 } from 'lucide-react';
import { Quiz, QuizStatus } from '@/lib/types';

interface AddQuizDialogProps {
  practicalId: string;
  onAddQuiz: (quiz: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>) => void; // Updated to omit updatedAt too
  userRole: string;
}

export function AddQuizDialog({ practicalId, onAddQuiz, userRole }: AddQuizDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    totalMarks: 100,
    passingMarks: 60,
    timeLimit: 30,
    status: QuizStatus.DRAFT
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onAddQuiz({
        ...formData,
        practicalId: parseInt(practicalId),
        teacherId: 1, // Get from auth
        questions: [],
        // createdAt and updatedAt are omitted from the type
      });
      
      setOpen(false);
      setFormData({
        title: '',
        description: '',
        totalMarks: 100,
        passingMarks: 60,
        timeLimit: 30,
        status: QuizStatus.DRAFT
      });
    } catch (error) {
      console.error('Error adding quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-emerald-600 to-emerald-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Quiz
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Quiz</DialogTitle>
          <DialogDescription>
            Add a new quiz for this practical
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Quiz Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Enter quiz title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Enter quiz description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="totalMarks">Total Marks</Label>
              <Input
                id="totalMarks"
                type="number"
                value={formData.totalMarks}
                onChange={(e) => setFormData({...formData, totalMarks: parseInt(e.target.value)})}
                min={1}
                max={1000}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="passingMarks">Passing Marks (%)</Label>
              <Input
                id="passingMarks"
                type="number"
                value={formData.passingMarks}
                onChange={(e) => setFormData({...formData, passingMarks: parseInt(e.target.value)})}
                min={0}
                max={100}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
            <Input
              id="timeLimit"
              type="number"
              value={formData.timeLimit}
              onChange={(e) => setFormData({...formData, timeLimit: parseInt(e.target.value)})}
              placeholder="Optional"
              min={1}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-blue-700"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Quiz'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}