// User types
export interface User {
  id: number;
  dni: string;
  full_name: string;
  created_at: string;
}

// Auth types
export interface LoginCredentials {
  dni: string;
  password: string;
}

export interface RegisterCredentials {
  dni: string;
  full_name: string;
  password: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

// Message types
export interface MessageImage {
  id: number;
  image_path: string;
  image_analysis: string | null;
}

export interface Message {
  id: number;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  image_path: string | null;
  image_analysis: string | null;
  images: MessageImage[];
  created_at: string;
}

// Conversation types
export interface Conversation {
  id: string;
  user_id: number;
  title: string | null;
  created_at: string;
  updated_at: string;
  messages: Message[];
}

export interface ConversationListItem {
  id: string;
  user_id: number;
  title: string | null;
  created_at: string;
  updated_at: string;
}

// Consultation types (deprecated)
export interface Consultation {
  id: number;
  user_id: number;
  question: string;
  image_path: string | null;
  response: string | null;
  created_at: string;
}

export interface Stats {
  total_consultations: number;
  consultations_this_month: number;
  consultations_this_week: number;
  last_consultation_date: string | null;
  avg_consultations_per_day: number;
}

// API Response types
export interface ApiError {
  detail: string;
}
