export interface Practical {
  id: string;
  subject: string;
  grade: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  thumbnail: string;
}

export interface FilterState {
  subject: string;
  grade: string;
  search: string;
}