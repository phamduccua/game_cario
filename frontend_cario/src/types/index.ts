// User types
export interface User {
  id: string;
  fullName: string;
  email: string;
  username: string;
  role: 'USER' | 'ADMIN';
}

// Auth types
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  password: string;
  email: string;
}

// Login response type
export interface LoginResponse {
  role: 'USER' | 'ADMIN';
}

// Quiz types
export interface Question {
  id: number;
  content: string;
  type: string;
  answers: Answer[];
}

export interface Answer {
  id: number;
  content: string;
}

export interface QuizAnswer {
  questionId: number;
  selectedAnswerId: number;
}

export interface QuizResult {
  score: number;
  totalQuestions: number;
  percentage: number;
  answers: Record<number, number>; // questionId -> selectedAnswerId
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
