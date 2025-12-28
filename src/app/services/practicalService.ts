// /app/services/practicalService.ts
import { Practical, CreatePracticalInput, UpdatePracticalInput, PracticalFilters } from '@/lib/types';

const API_BASE = '/api';

export const practicalService = {
  async getAll(filters?: PracticalFilters): Promise<Practical[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.search) params.append('search', filters.search);
      if (filters?.subject) params.append('subject', filters.subject);
      if (filters?.grade) params.append('grade', filters.grade);
      if (filters?.difficulty) params.append('difficulty', filters.difficulty);
      if (filters?.teacherId) params.append('teacherId', filters.teacherId.toString());
      
      const response = await fetch(`${API_BASE}/practicals?${params.toString()}`);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to fetch practicals' }));
        throw new Error(error.message || 'Failed to fetch practicals');
      }
      
      const data = await response.json();
      console.log('Fetched practicals from API:', data); // Debug log
      return data;
    } catch (error) {
      console.error('Error fetching practicals:', error);
      throw error;
    }
  },

  async create(data: CreatePracticalInput): Promise<Practical> {
    try {
      console.log('Creating practical with data:', data); // Debug log
      
      const response = await fetch(`${API_BASE}/practicals`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to create practical' }));
        throw new Error(error.message || 'Failed to create practical');
      }
      
      const result = await response.json();
      console.log('Practical created successfully:', result); // Debug log
      return result;
    } catch (error) {
      console.error('Error creating practical:', error);
      throw error;
    }
  },

  async update(id: number, data: UpdatePracticalInput): Promise<Practical> {
    try {
      console.log(`Updating practical ${id} with data:`, data); // Debug log
      
      const response = await fetch(`${API_BASE}/practicals/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to update practical' }));
        throw new Error(error.message || 'Failed to update practical');
      }
      
      const result = await response.json();
      console.log('Practical updated successfully:', result); // Debug log
      return result;
    } catch (error) {
      console.error(`Error updating practical ${id}:`, error);
      throw error;
    }
  },

  async delete(id: number): Promise<void> {
    try {
      console.log(`Deleting practical ${id}`); // Debug log
      
      const response = await fetch(`${API_BASE}/practicals/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to delete practical' }));
        throw new Error(error.message || 'Failed to delete practical');
      }
      
      console.log(`Practical ${id} deleted successfully`); // Debug log
    } catch (error) {
      console.error(`Error deleting practical ${id}:`, error);
      throw error;
    }
  }
};