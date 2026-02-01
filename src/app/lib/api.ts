// lib/api.ts
import { Schedule, CreateScheduleData, UpdateScheduleData } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Schedule API functions
export const scheduleApi = {
  // Get all schedules
  async getAll(): Promise<Schedule[]> {
    const res = await fetch(`${API_URL}/schedules`);
    if (!res.ok) throw new Error('Failed to fetch schedules');
    return res.json();
  },

  // Get schedule by ID
  async getById(id: number): Promise<Schedule> {
    const res = await fetch(`${API_URL}/schedules/${id}`);
    if (!res.ok) throw new Error('Failed to fetch schedule');
    return res.json();
  },

  // Create new schedule
  async create(data: CreateScheduleData): Promise<Schedule> {
    const res = await fetch(`${API_URL}/schedules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create schedule');
    return res.json();
  },

  // Update schedule
  async update(id: number, data: UpdateScheduleData): Promise<Schedule> {
    const res = await fetch(`${API_URL}/schedules/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update schedule');
    return res.json();
  },

  // Delete schedule
  async delete(id: number): Promise<void> {
    const res = await fetch(`${API_URL}/schedules/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete schedule');
  },

  // Upload attachment
  async uploadAttachment(scheduleId: number, file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await fetch(`${API_URL}/schedules/${scheduleId}/attachments`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to upload attachment');
    return res.json();
  },

  // Get schedules by date range
  async getByDateRange(startDate: string, endDate: string): Promise<Schedule[]> {
    const res = await fetch(
      `${API_URL}/schedules?startDate=${startDate}&endDate=${endDate}`
    );
    if (!res.ok) throw new Error('Failed to fetch schedules');
    return res.json();
  },

  // Get schedules by teacher
  async getByTeacher(teacherId: number): Promise<Schedule[]> {
    const res = await fetch(`${API_URL}/schedules?teacherId=${teacherId}`);
    if (!res.ok) throw new Error('Failed to fetch schedules');
    return res.json();
  },
};