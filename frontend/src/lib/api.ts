import axios from 'axios';
import type { User, Patient, Provider, Claim, Document, LoginRequest, Token } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const authApi = {
  login: async (data: LoginRequest): Promise<Token> => {
    const response = await api.post<Token>('/auth/login', data);
    return response.data;
  },
  register: async (data: { email: string; password: string; full_name: string; organization_name?: string }): Promise<User> => {
    const response = await api.post<User>('/auth/register', data);
    return response.data;
  },
  getMe: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },
};

export const patientsApi = {
  list: async (params?: { skip?: number; limit?: number; search?: string }): Promise<Patient[]> => {
    const response = await api.get<Patient[]>('/patients/', { params });
    return response.data;
  },
  get: async (id: number): Promise<Patient> => {
    const response = await api.get<Patient>(`/patients/${id}`);
    return response.data;
  },
  create: async (data: Partial<Patient>): Promise<Patient> => {
    const response = await api.post<Patient>('/patients/', data);
    return response.data;
  },
  update: async (id: number, data: Partial<Patient>): Promise<Patient> => {
    const response = await api.put<Patient>(`/patients/${id}`, data);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/patients/${id}`);
  },
};

export const providersApi = {
  list: async (params?: { skip?: number; limit?: number; search?: string; specialty?: string }): Promise<Provider[]> => {
    const response = await api.get<Provider[]>('/providers/', { params });
    return response.data;
  },
  get: async (id: number): Promise<Provider> => {
    const response = await api.get<Provider>(`/providers/${id}`);
    return response.data;
  },
  create: async (data: Partial<Provider>): Promise<Provider> => {
    const response = await api.post<Provider>('/providers/', data);
    return response.data;
  },
  update: async (id: number, data: Partial<Provider>): Promise<Provider> => {
    const response = await api.put<Provider>(`/providers/${id}`, data);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/providers/${id}`);
  },
};

export const claimsApi = {
  list: async (params?: { skip?: number; limit?: number; status?: string }): Promise<Claim[]> => {
    const response = await api.get<Claim[]>('/claims/', { params });
    return response.data;
  },
  get: async (id: number): Promise<Claim> => {
    const response = await api.get<Claim>(`/claims/${id}`);
    return response.data;
  },
  create: async (data: Partial<Claim>): Promise<Claim> => {
    const response = await api.post<Claim>('/claims/', data);
    return response.data;
  },
  update: async (id: number, data: Partial<Claim>): Promise<Claim> => {
    const response = await api.put<Claim>(`/claims/${id}`, data);
    return response.data;
  },
  submit: async (id: number): Promise<Claim> => {
    const response = await api.post<Claim>(`/claims/${id}/submit`);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/claims/${id}`);
  },
};

export const documentsApi = {
  listByClaim: async (claimId: number): Promise<Document[]> => {
    const response = await api.get<Document[]>(`/documents/claim/${claimId}`);
    return response.data;
  },
  upload: async (claimId: number, file: File, documentType: string = 'other'): Promise<Document> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType);
    const response = await api.post<Document>(`/documents/upload/${claimId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  getDownloadUrl: async (documentId: number): Promise<{ download_url: string }> => {
    const response = await api.get<{ download_url: string }>(`/documents/download/${documentId}`);
    return response.data;
  },
  delete: async (documentId: number): Promise<void> => {
    await api.delete(`/documents/${documentId}`);
  },
};

export default api;