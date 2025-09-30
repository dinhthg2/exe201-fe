import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Assumption: FE talks to BE on the same host via /api prefix (Next.js rewrite recommended)
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach Authorization if token exists
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  try {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers = config.headers || ({} as any);
        (config.headers as any)['Authorization'] = `Bearer ${token}`;
      }
    }
  } catch {}
  return config;
});

// Response interceptor: basic error handling
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    if (status === 401 || status === 403) {
      try {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
        }
      } catch {}
    }
    return Promise.reject(error);
  }
);

// Helpers: narrow response to data
async function unwrap<T>(p: Promise<AxiosResponse<T>>): Promise<T> {
  const res = await p;
  return res.data as T;
}

// Generic helpers
export function getJson<T = any>(url: string, config?: any) {
  return unwrap<T>(api.get<T>(url, config));
}

export function postJson<T = any, B = any>(url: string, body?: B, config?: any) {
  return unwrap<T>(api.post<T>(url, body, config));
}

export function putJson<T = any, B = any>(url: string, body?: B, config?: any) {
  return unwrap<T>(api.put<T>(url, body, config));
}

export function patchJson<T = any, B = any>(url: string, body?: B, config?: any) {
  return unwrap<T>(api.patch<T>(url, body, config));
}

export function deleteJson<T = any>(url: string, config?: any) {
  return unwrap<T>(api.delete<T>(url, config));
}

// Domain-specific helpers (lightweight types)
export type Course = {
  id: number;
  title: string;
  code?: string;
  description?: string;
  imageUrl?: string;
  specialization?: string;
  semester?: number;
};

export type User = {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  studentCode: string;
  major: string;
  semester?: number;
  specialization?: string;
};

export async function getUserProfile(): Promise<User> {
  return getJson<User>('/profile/me');
}

export async function getCourses(params?: Record<string, any>): Promise<Course[]> {
  return getJson<Course[]>(`/courses`, { params });
}

export async function getMyCourses(limit?: number): Promise<Course[]> {
  return getJson<Course[]>(`/courses/my`, { params: { limit } });
}

export async function getCourse(id: number | string): Promise<Course> {
  return getJson<Course>(`/courses/${id}`);
}

export type Curriculum = {
  specialization: string;
  semesters: Array<{ index: number; courses: Course[] }>; // simple shape
};

export async function getCurriculum(specialization: string): Promise<Curriculum> {
  return getJson<Curriculum>(`/curriculum`, { params: { specialization } });
}

// Swipe/Match helpers used by features
export type SwipeCandidate = { userId: number; name: string; avatar?: string; bio?: string };
export async function fetchSwipeCandidates(): Promise<SwipeCandidate[]> {
  return getJson<SwipeCandidate[]>(`/swipes/candidates`);
}

export async function postSwipe(targetUserId: number, liked: boolean) {
  return postJson<{ matched: boolean }>(`/swipes`, { targetUserId, liked });
}

export async function undoSwipe(swipeId: number) {
  return postJson<{ ok: true }>(`/swipes/${swipeId}/undo`);
}

export type Match = { id: number; userA: number; userB: number; createdAt: string };
export async function fetchMatches(): Promise<Match[]> {
  return getJson<Match[]>(`/matches`);
}

export default api;