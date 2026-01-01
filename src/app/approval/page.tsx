'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ApprovalPage() {
  const params = useSearchParams();
  const action = params.get('action'); // approve | reject
  const id = params.get('id');         // inventoryRequest id

  const [message, setMessage] = useState('Processing request...');

  useEffect(() => {
    if (!action || !id) {
      setMessage('Invalid approval link');
      return;
    }

    const endpoint =
      action === 'approve'
        ? `/api/inventory-requests/${id}/approve`
        : `/api/inventory-requests/${id}/reject`;

    fetch(endpoint, { method: 'POST' })
      .then((res) => {
        if (!res.ok) throw new Error();
        setMessage(
          action === 'approve'
            ? 'Request approved successfully'
            : 'Request rejected successfully'
        );
      })
      .catch(() => {
        setMessage('Failed to process request');
      });
  }, [action, id]);

  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h2>{message}</h2>
    </div>
  );
}
