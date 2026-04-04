export interface User {
  id: string;
  email: string;
  full_name: string;
  agency: string;
  role: 'learner' | 'admin';
  created_at: string;
}

export interface SectionProgress {
  section_id: string;
  completed_at: string;
}

export interface QuizAttempt {
  id: string;
  score: number;
  total: number;
  passed: boolean;
  answers: Record<string, string>;
  attempted_at: string;
}

export interface Completion {
  id: string;
  user_id: string;
  completed_at: string;
  quiz_attempt_id: string;
}
