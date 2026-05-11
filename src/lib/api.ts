import axios from 'axios';
import type { LoginCredentials, RegisterCredentials, AuthTokens, User, Consultation, Stats, Conversation, ConversationListItem, Message } from '@/types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de acceso
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar token expirado
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post('/api/auth/refresh', {
            refresh_token: refreshToken,
          });
          
          const { access_token, refresh_token } = response.data;
          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', refresh_token);
          
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthTokens> => {
    const response = await api.post<AuthTokens>('/auth/login', credentials);
    return response.data;
  },
  
  register: async (credentials: RegisterCredentials): Promise<User> => {
    const response = await api.post<User>('/auth/register', credentials);
    return response.data;
  },
  
  getMe: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<{ message: string }> => {
    const response = await api.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return response.data;
  },
};

// Conversations API
export const conversationsApi = {
  getAll: async (skip = 0, limit = 20): Promise<ConversationListItem[]> => {
    const response = await api.get<ConversationListItem[]>('/conversations', {
      params: { skip, limit },
    });
    return response.data;
  },
  
  getById: async (id: string): Promise<Conversation> => {
    const response = await api.get<Conversation>(`/conversations/${id}`);
    return response.data;
  },
  
  create: async (message: string, images?: File[]): Promise<Conversation> => {
    const formData = new FormData();
    formData.append('message', message);
    if (images && images.length > 0) {
      images.forEach((image) => {
        formData.append('images', image);
      });
    }
    
    const response = await api.post<Conversation>('/conversations', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  addMessage: async (conversationId: string, content: string, images?: File[]): Promise<Message> => {
    const formData = new FormData();
    formData.append('message', content);
    if (images && images.length > 0) {
      images.forEach((image) => {
        formData.append('images', image);
      });
    }
    
    const response = await api.post<Message>(`/conversations/${conversationId}/messages`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/conversations/${id}`);
  },
  
  rename: async (id: string, title: string): Promise<Conversation> => {
    const response = await api.patch<Conversation>(`/conversations/${id}`, { title });
    return response.data;
  },
  
  getStats: async (): Promise<Stats> => {
    const response = await api.get<Stats>('/conversations/stats');
    return response.data;
  },
};

// Consultations API (deprecated - mantener compatibilidad)
export const consultationsApi = {
  getAll: async (skip = 0, limit = 20): Promise<Consultation[]> => {
    const response = await api.get<Consultation[]>('/consultations', {
      params: { skip, limit },
    });
    return response.data;
  },
  
  getStats: async (): Promise<Stats> => {
    const response = await api.get<Stats>('/consultations/stats');
    return response.data;
  },
  
  create: async (question: string, image?: File): Promise<Consultation> => {
    const formData = new FormData();
    formData.append('question', question);
    if (image) {
      formData.append('image', image);
    }
    
    const response = await api.post<Consultation>('/consultations', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default api;
