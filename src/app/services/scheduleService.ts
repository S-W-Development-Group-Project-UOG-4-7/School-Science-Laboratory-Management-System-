// lib/api/schedule.ts
export interface ApiSchedule {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  grade: string;
  className: string;
  fullClassName: string;
  subject: 'Physics' | 'Chemistry' | 'Biology' | 'Science';
  teacher: string;
  location: string;
  notes: string;
  studentRequirements: string;
  daySchedule: string;
  attachments: string[];
  maxStudents: number;
  status: 'upcoming' | 'completed' | 'cancelled';
  teacherId: number;
}

// Helper to transform frontend data to API format
export const transformToApiFormat = (data: any, teacherId: number) => {
  return {
    title: data.title,
    date: data.date,
    time: data.time,
    duration: data.duration,
    grade: data.grade,
    classSection: data.className, // Frontend uses className, API expects classSection
    subject: data.subject,
    location: data.location,
    notes: data.notes || null,
    studentRequirements: data.studentRequirements || null,
    daySchedule: data.daySchedule || null,
    maxStudents: data.maxStudents,
    teacherId: teacherId,
    status: (data.status?.toUpperCase() || 'UPCOMING'),
  };
};

export const scheduleApi = {
  async getSchedules(params?: {
    teacherId?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const query = new URLSearchParams();
    
    if (params?.teacherId) query.append('teacherId', params.teacherId.toString());
    if (params?.status) query.append('status', params.status);
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);
    
    const response = await fetch(`/api/schedules?${query.toString()}`);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to fetch schedules');
    }
    
    return response.json() as Promise<ApiSchedule[]>;
  },

  async createSchedule(data: any) {
    const response = await fetch('/api/schedules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create schedule');
    }
    
    return response.json() as Promise<ApiSchedule>;
  },

  async updateSchedule(id: string, data: any) {
    const response = await fetch('/api/schedules', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...data }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update schedule');
    }
    
    return response.json() as Promise<ApiSchedule>;
  },

  async deleteSchedule(id: string) {
    const response = await fetch(`/api/schedules?id=${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete schedule');
    }
    
    return response.json();
  },
};