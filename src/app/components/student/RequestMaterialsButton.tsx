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
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Loader2, Package } from 'lucide-react';
import { toast } from 'sonner';
import { post, get } from '@/utils/api';

interface RequestMaterialsButtonProps {
  studentId: number;
  practicalId: number;
  onSuccess?: () => void;
}

export function RequestMaterialsButton({
  studentId,
  practicalId,
  onSuccess,
}: RequestMaterialsButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasExistingRequest, setHasExistingRequest] = useState(false);

  // Check if request already exists
  useEffect(() => {
    if (isOpen && studentId && practicalId) {
      checkExistingRequest();
    }
  }, [isOpen, studentId, practicalId]);

  const checkExistingRequest = async () => {
    try {
      const response = await get(`/api/material-requests?studentId=${studentId}`);
      if (response.success && response.data) {
        const existingRequest = response.data.find(
          (req: any) => req.practicalId === practicalId && req.status === 'PENDING'
        );
        setHasExistingRequest(!!existingRequest);
      }
    } catch (error) {
      // Silent fail for checking
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!itemName.trim()) {
      toast.error('Please enter an item name');
      return;
    }

    setIsLoading(true);

    try {
      const response = await post('/api/material-requests', {
        studentId,
        practicalId,
        itemName: itemName.trim(),
        quantity,
      });

      if (response.success) {
        toast.success('Material request submitted successfully!');
        setItemName('');
        setQuantity(1);
        setIsOpen(false);
        setHasExistingRequest(true);
        onSuccess?.();
      } else {
        toast.error(response.message || 'Failed to submit material request');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={hasExistingRequest}
          className="hover:bg-blue-50 hover:border-blue-300"
        >
          <Package className="w-4 h-4 mr-2" />
          {hasExistingRequest ? 'Request Pending' : 'Request Materials'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Lab Materials</DialogTitle>
          <DialogDescription>
            Submit a request for materials needed for this practical session
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="itemName">Item Name *</Label>
            <Input
              id="itemName"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="e.g., Beaker, Test tubes, pH strips"
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              disabled={isLoading}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Request'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

