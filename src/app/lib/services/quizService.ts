import { Quiz, CreateQuizInput, UpdateQuizInput } from '@/src/app/lib/types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '/api';

export const quizService = {
  async getAll(practicalId?: number): Promise<Quiz[]> {
    try {
      const url = practicalId 
        ? `${API_BASE}/quizzes?practicalId=${practicalId}`
        : `${API_BASE}/quizzes`;
      
      const response = await fetch(url, { cache: 'no-store' });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch quizzes: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      throw error;
    }
  },

  async getById(id: number): Promise<Quiz> {
    try {
      const response = await fetch(`${API_BASE}/quizzes/${id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch quiz: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching quiz ${id}:`, error);
      throw error;
    }
  },

  async create(data: CreateQuizInput): Promise<Quiz> {
    try {
      const response = await fetch(`${API_BASE}/quizzes`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create quiz');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating quiz:', error);
      throw error;
    }
  },

  async update(id: number, data: UpdateQuizInput): Promise<Quiz> {
    try {
      const response = await fetch(`${API_BASE}/quizzes/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update quiz');
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error updating quiz ${id}:`, error);
      throw error;
    }
  },

  async delete(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE}/quizzes/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete quiz');
      }
    } catch (error) {
      console.error(`Error deleting quiz ${id}:`, error);
      throw error;
    }
  },

  async addQuestion(quizId: number, questionData: any): Promise<any> {
    try {
      const response = await fetch(`${API_BASE}/quizzes/${quizId}/questions`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(questionData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add question');
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error adding question to quiz ${quizId}:`, error);
      throw error;
    }
  }
};