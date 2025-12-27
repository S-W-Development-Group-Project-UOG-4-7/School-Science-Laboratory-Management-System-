'use client';

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { post } from '@/utils/api';

interface AttendPracticalButtonProps {
  studentId: number;
  practicalId: number;
  onSuccess?: () => void;
}

export function AttendPracticalButton({
  studentId,
  practicalId,
  onSuccess,
}: AttendPracticalButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isAttending, setIsAttending] = useState(false);

  const handleAttend = async () => {
    setIsLoading(true);

    try {
      const response = await post('/api/attendance', {
        studentId,
        practicalId,
        status: 'PRESENT',
      });

      if (response.success) {
        toast.success('Attendance marked successfully!');
        setIsAttending(true);
        onSuccess?.();
      } else {
        if (response.message?.includes('already')) {
          toast.info('You have already marked attendance for this session');
          setIsAttending(true);
        } else {
          toast.error(response.message || 'Failed to mark attendance');
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      size="sm"
      variant={isAttending ? 'outline' : 'default'}
      onClick={handleAttend}
      disabled={isLoading || isAttending}
      className={isAttending ? 'bg-green-50 border-green-300 text-green-700' : ''}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Marking...
        </>
      ) : isAttending ? (
        <>
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Attending
        </>
      ) : (
        'Attend Session'
      )}
    </Button>
  );
}



