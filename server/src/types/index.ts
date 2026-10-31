export interface Subject {
  id: string;
  name: string;
  code?: string;
  color?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Year {
  id: string;
  subjectId: string;
  year: number;
  label?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Paper {
  id: string;
  subjectYearId: string;
  filename: string;
  originalName: string;
  uploadDate: number;
  totalPages: number;
  solvedStatus: 'solved' | 'unsolved' | 'partial';
  tags: string[];
  thumbnailPath?: string;
}

export interface Page {
  id: string;
  paperId: string;
  pageIndex: number;
  pageNumber: number;
  rotation: 0 | 90 | 180 | 270;
  solvedStatus: 'solved' | 'unsolved';
}

export interface Question {
  id: string;
  paperId: string;
  title: string;
  pageIdStart: string;
  pageIdEnd: string;
  solvedStatus: 'solved' | 'unsolved';
  tags: string[];
  notes: string;
}

export interface Annotation {
  id: string;
  paperId: string;
  pageId: string;
  questionId?: string;
  type: 'drawing' | 'text' | 'highlight' | 'shape';
  data: string;
  color: string;
  strokeWidth: number;
  createdAt: number;
  updatedAt: number;
}

export interface SubjectWithYears extends Subject {
  years: (Year & { paperCount: number })[];
}

export interface YearWithPapers extends Year {
  papers: Paper[];
}

export interface PaperWithDetails extends Paper {
  pages: Page[];
  questions: Question[];
  subjectName?: string;
  subjectCode?: string;
  subjectColor?: string;
  yearValue?: number;
  yearLabel?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}