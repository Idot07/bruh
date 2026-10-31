import type { Subject, Year, Paper, Page, Question, Annotation, SubjectWithYears, YearWithPapers, PaperWithDetails, ApiError } from '../types';

const API_BASE = '/api';

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export const api = {
  // Subjects
  getSubjects: () => fetchApi<Subject[]>('/subjects'),
  createSubject: (data: { name: string; code?: string; color?: string }) =>
    fetchApi<Subject>('/subjects', { method: 'POST', body: JSON.stringify(data) }),
  getSubject: (id: string) => fetchApi<Subject>(`/subjects/${id}`),
  updateSubject: (id: string, data: Partial<Subject>) =>
    fetchApi<Subject>(`/subjects/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteSubject: (id: string) => fetchApi<void>(`/subjects/${id}`, { method: 'DELETE' }),

  // Years
  getYears: (subjectId: string) => fetchApi<Year[]>(`/subjects/${subjectId}/years`),
  createYear: (subjectId: string, data: { year: number; label?: string }) =>
    fetchApi<Year>(`/subjects/${subjectId}/years`, { method: 'POST', body: JSON.stringify(data) }),
  updateYear: (subjectId: string, id: string, data: Partial<Year>) =>
    fetchApi<Year>(`/subjects/${subjectId}/years/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteYear: (subjectId: string, id: string) =>
    fetchApi<void>(`/subjects/${subjectId}/years/${id}`, { method: 'DELETE' }),

  // Papers
  getPapers: (subjectId: string, yearId: string, filters?: { status?: string; tags?: string[]; search?: string }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.tags) params.append('tags', filters.tags.join(','));
    if (filters?.search) params.append('search', filters.search);
    return fetchApi<Paper[]>(`/subjects/${subjectId}/years/${yearId}/papers?${params.toString()}`);
  },
  uploadPaper: (subjectId: string, yearId: string, file: File, tags: string[] = []) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('tags', JSON.stringify(tags));
    return fetch(`${API_BASE}/subjects/${subjectId}/years/${yearId}/papers`, {
      method: 'POST',
      body: formData,
    }).then(res => {
      if (!res.ok) throw new Error('Upload failed');
      return res.json() as Promise<PaperWithDetails>;
    });
  },
  getPaper: (id: string) => fetchApi<PaperWithDetails>(`/papers/${id}`),
  updatePaper: (id: string, data: { tags?: string[] }) =>
    fetchApi<Paper>(`/papers/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deletePaper: (id: string) => fetchApi<void>(`/papers/${id}`, { method: 'DELETE' }),
  reorderPages: (id: string, pageIds: string[]) =>
    fetchApi<PaperWithDetails>(`/papers/${id}/pages/reorder`, { method: 'POST', body: JSON.stringify({ pageIds }) }),
  rotatePage: (id: string, pageId: string) =>
    fetchApi<Page>(`/papers/${id}/pages/${pageId}/rotate`, { method: 'POST' }),
  deletePage: (id: string, pageId: string) =>
    fetchApi<PaperWithDetails>(`/papers/${id}/pages/${pageId}`, { method: 'DELETE' }),

  // Questions
  getQuestions: (paperId: string) => fetchApi<Question[]>(`/questions/paper/${paperId}`),
  createQuestion: (data: Omit<Question, 'id'>) =>
    fetchApi<Question>('/questions', { method: 'POST', body: JSON.stringify(data) }),
  updateQuestion: (id: string, data: Partial<Omit<Question, 'id' | 'paperId'>>) =>
    fetchApi<Question>(`/questions/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteQuestion: (id: string) => fetchApi<void>(`/questions/${id}`, { method: 'DELETE' }),

  // Annotations
  getAnnotations: (paperId: string, pageId?: string, questionId?: string) => {
    const params = new URLSearchParams();
    if (pageId) params.append('pageId', pageId);
    if (questionId) params.append('questionId', questionId);
    return fetchApi<Annotation[]>(`/annotations/paper/${paperId}?${params.toString()}`);
  },
  getAnnotationsByPage: (pageId: string) => fetchApi<Annotation[]>(`/annotations/page/${pageId}`),
  createAnnotation: (data: Omit<Annotation, 'id' | 'createdAt' | 'updatedAt'>) =>
    fetchApi<Annotation>('/annotations', { method: 'POST', body: JSON.stringify(data) }),
  batchUpsertAnnotations: (annotations: Omit<Annotation, 'id' | 'createdAt' | 'updatedAt'>[]) =>
    fetchApi<Annotation[]>('/annotations/batch', { method: 'POST', body: JSON.stringify({ annotations }) }),
  updateAnnotation: (id: string, data: Partial<Omit<Annotation, 'id' | 'paperId' | 'pageId' | 'questionId' | 'type' | 'createdAt'>>) =>
    fetchApi<Annotation>(`/annotations/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteAnnotation: (id: string) => fetchApi<void>(`/annotations/${id}`, { method: 'DELETE' }),
};

// Re-export types
export type { Subject, Year, Paper, Page, Question, Annotation, SubjectWithYears, YearWithPapers, PaperWithDetails, ApiError };