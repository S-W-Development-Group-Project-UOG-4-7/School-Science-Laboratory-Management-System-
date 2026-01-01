// /app/services/practicalService.ts

import { Practical, CreatePracticalInput, UpdatePracticalInput, PracticalFilters } from '@/lib/types';

const API_BASE = '/api';

export const practicalService = {
  

  /* =========================
     GET ALL PRACTICALS
  ========================= */
  async getAll(filters?: PracticalFilters): Promise<Practical[]> {
  try {
    const params = new URLSearchParams();

    if (filters?.search) params.append('search', filters.search);
    if (filters?.subject && filters.subject !== 'all') params.append('subject', filters.subject);
    if (filters?.grade && filters.grade !== 'all') params.append('grade', filters.grade);
    if (filters?.difficulty) {params.append('difficulty', filters.difficulty);
}
    if (filters?.teacherId) params.append('teacherId', String(filters.teacherId));

    const response = await fetch(`/api/practicals?${params.toString()}`, {
      cache: 'no-store',
    });

    let result: any;
    try {
      result = await response.json();
    } catch {
      throw new Error('Server returned invalid JSON');
    }

    if (!response.ok || !result.success) {
      throw new Error(result?.error || 'Failed to fetch practicals');
    }

    // ✅ THIS IS THE IMPORTANT LINE
    return Array.isArray(result.data) ? result.data : [];
  } catch (error) {
    console.error('❌ getAll failed:', error);
    return []; // ✅ Prevents UI crash
  }
},


  /* =========================
     CREATE PRACTICAL
  ========================= */
  async create(data: CreatePracticalInput): Promise<Practical> {
    const response = await fetch('/api/practicals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    let result: any;
    try {
      result = await response.json();
    } catch {
      throw new Error('Server did not return valid JSON');
    }

    if (!response.ok || !result.success) {
      throw new Error(result?.error || 'Failed to create practical');
    }

    return result.data;
  },


  /* =========================
     UPDATE PRACTICAL
  ========================= */
  async update(id: number, data: UpdatePracticalInput): Promise<Practical> {
  try {
    const response = await fetch(`/api/practicals`, { // <-- fixed endpoint
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...data }),
    });

    let result: any = {};
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      result = await response.json();
    }

    if (!response.ok || !result.success) {
      throw new Error(result?.error || 'Failed to update practical');
    }

    return result.data; // Only the updated practical
  } catch (error: any) {
    console.error(`❌ Error updating practical ${id}:`, error);
    throw new Error(error.message || 'Unknown error updating practical');
  }
},

  /* =========================
   DELETE PRACTICAL
========================= */
async delete(id: number): Promise<number> {
  try {
    const url = `/api/practicals?id=${id}`; // Correct endpoint
    const response = await fetch(url, { method: 'DELETE' });

    let result: any = {};
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      result = await response.json();
    }

    if (!response.ok) {
      throw new Error(result?.error || 'Failed to delete practical');
    }

    return result.deletedQuizzes ?? 0;
  } catch (error: any) {
    console.error(`❌ Error deleting practical ${id}:`, error);
    throw new Error(error.message || 'Unknown error deleting practical');
  }
}


};
