import { getDatabase } from '@/db';
import { Subject, Year, Paper, Page, Question, Annotation, SubjectWithYears, YearWithPapers, PaperWithDetails } from '@/types';

export function generateId(): string {
  return crypto.randomUUID();
}

export function now(): number {
  return Date.now();
}

// Subject queries
export const subjectQueries = {
  getAll: (): (Subject & { yearCount: number })[] => {
    const db = getDatabase();
    const rows = db.prepare(`
      SELECT s.*, COUNT(y.id) as yearCount
      FROM subjects s
      LEFT JOIN years y ON y.subject_id = s.id
      GROUP BY s.id
      ORDER BY s.name
    `).all() as any[];
    return rows.map(r => ({ ...transformSubject(r), yearCount: r.yearCount }));
  },

  getById: (id: string): Subject | undefined => {
    const db = getDatabase();
    const row = db.prepare('SELECT * FROM subjects WHERE id = ?').get(id) as any;
    return row ? transformSubject(row) : undefined;
  },

  create: (subject: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>): Subject => {
    const db = getDatabase();
    const id = generateId();
    const timestamp = now();
    const newSubject = { ...subject, id, createdAt: timestamp, updatedAt: timestamp };
    db.prepare(`
      INSERT INTO subjects (id, name, code, color, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, newSubject.name, newSubject.code ?? null, newSubject.color ?? null, timestamp, timestamp);
    return transformSubject({ ...newSubject, created_at: timestamp, updated_at: timestamp });
  },

  update: (id: string, updates: Partial<Omit<Subject, 'id' | 'createdAt'>>): Subject | undefined => {
    const db = getDatabase();
    const existingRow = db.prepare('SELECT * FROM subjects WHERE id = ?').get(id) as any;
    if (!existingRow) return undefined;
    const existing = transformSubject(existingRow);
    
    const updated = { ...existing, ...updates, updatedAt: now() };
    db.prepare(`
      UPDATE subjects SET name = ?, code = ?, color = ?, updated_at = ? WHERE id = ?
    `).run(updated.name, updated.code ?? null, updated.color ?? null, updated.updatedAt, id);
    return updated;
  },

  delete: (id: string): boolean => {
    const db = getDatabase();
    const result = db.prepare('DELETE FROM subjects WHERE id = ?').run(id);
    return result.changes > 0;
  },

  getWithYears: (): SubjectWithYears[] => {
    const db = getDatabase();
    const subjects = db.prepare('SELECT * FROM subjects ORDER BY name').all() as Subject[];
    const years = db.prepare(`
      SELECT y.*, COUNT(p.id) as paperCount
      FROM years y
      LEFT JOIN papers p ON p.subject_year_id = y.id
      GROUP BY y.id
      ORDER BY y.year DESC
    `).all() as (Year & { paperCount: number })[];
    
    return subjects.map(s => ({
      ...s,
      years: years.filter(y => y.subjectId === s.id)
    }));
  }
};

// Year queries
export const yearQueries = {
  getBySubject: (subjectId: string): Year[] => {
    const db = getDatabase();
    return db.prepare('SELECT * FROM years WHERE subject_id = ? ORDER BY year DESC').all(subjectId) as Year[];
  },

  getById: (id: string): Year | undefined => {
    const db = getDatabase();
    return db.prepare('SELECT * FROM years WHERE id = ?').get(id) as Year | undefined;
  },

  create: (year: Omit<Year, 'id' | 'createdAt' | 'updatedAt'>): Year => {
    const db = getDatabase();
    const id = generateId();
    const timestamp = now();
    const newYear = { ...year, id, createdAt: timestamp, updatedAt: timestamp };
    db.prepare(`
      INSERT INTO years (id, subject_id, year, label, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, newYear.subjectId, newYear.year, newYear.label ?? null, timestamp, timestamp);
    return newYear;
  },

  update: (id: string, updates: Partial<Omit<Year, 'id' | 'createdAt'>>): Year | undefined => {
    const db = getDatabase();
    const existing = yearQueries.getById(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates, updatedAt: now() };
    db.prepare(`
      UPDATE years SET year = ?, label = ?, updated_at = ? WHERE id = ?
    `).run(updated.year, updated.label ?? null, updated.updatedAt, id);
    return updated;
  },

  delete: (id: string): boolean => {
    const db = getDatabase();
    const result = db.prepare('DELETE FROM years WHERE id = ?').run(id);
    return result.changes > 0;
  },

  getWithPapers: (subjectId: string): YearWithPapers[] => {
    const db = getDatabase();
    const years = db.prepare('SELECT * FROM years WHERE subject_id = ? ORDER BY year DESC').all(subjectId) as Year[];
    const papers = db.prepare('SELECT * FROM papers WHERE subject_year_id IN (SELECT id FROM years WHERE subject_id = ?)').all(subjectId) as Paper[];
    
    return years.map(y => ({
      ...y,
      papers: papers.filter(p => p.subjectYearId === y.id)
    }));
  }
};

// Paper queries
export const paperQueries = {
  getBySubjectYear: (subjectYearId: string, filters?: { status?: string; tags?: string[]; search?: string }): Paper[] => {
    const db = getDatabase();
    let query = 'SELECT * FROM papers WHERE subject_year_id = ?';
    const params: any[] = [subjectYearId];
    
    if (filters?.status) {
      query += ' AND solved_status = ?';
      params.push(filters.status);
    }
    if (filters?.tags && filters.tags.length > 0) {
      // Simple tag filtering - in production you'd want a proper tags table
      const tagConditions = filters.tags.map(() => 'tags LIKE ?').join(' OR ');
      query += ` AND (${tagConditions})`;
      filters.tags.forEach(tag => params.push(`%${tag}%`));
    }
    if (filters?.search) {
      query += ' AND original_name LIKE ?';
      params.push(`%${filters.search}%`);
    }
    
    query += ' ORDER BY upload_date DESC';
    return db.prepare(query).all(...params) as Paper[];
  },

  getById: (id: string): Paper | undefined => {
    const db = getDatabase();
    return db.prepare('SELECT * FROM papers WHERE id = ?').get(id) as Paper | undefined;
  },

  getWithDetails: (id: string): PaperWithDetails | undefined => {
    const db = getDatabase();
    const paper = paperQueries.getById(id);
    if (!paper) return undefined;
    
    const pages = pageQueries.getByPaper(id);
    const questions = questionQueries.getByPaper(id);
    
    // Get subject/year info
    const year = db.prepare('SELECT y.*, s.name as subjectName, s.code as subjectCode, s.color as subjectColor FROM years y JOIN subjects s ON s.id = y.subject_id WHERE y.id = ?').get(paper.subjectYearId) as (Year & { subjectName: string; subjectCode: string; subjectColor: string }) | undefined;
    
    return {
      ...paper,
      pages,
      questions,
      subjectName: year?.subjectName,
      subjectCode: year?.subjectCode,
      subjectColor: year?.subjectColor,
      yearValue: year?.year,
      yearLabel: year?.label
    };
  },

  create: (paper: Omit<Paper, 'id' | 'uploadDate' | 'solvedStatus' | 'tags'> & { tags?: string[] }): Paper => {
    const db = getDatabase();
    const id = generateId();
    const timestamp = now();
    const newPaper = {
      ...paper,
      id,
      uploadDate: timestamp,
      solvedStatus: 'unsolved' as const,
      tags: paper.tags ?? [],
      thumbnailPath: paper.thumbnailPath
    };
    db.prepare(`
      INSERT INTO papers (id, subject_year_id, filename, original_name, upload_date, total_pages, solved_status, tags, thumbnail_path)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      newPaper.subjectYearId,
      newPaper.filename,
      newPaper.originalName,
      timestamp,
      newPaper.totalPages,
      newPaper.solvedStatus,
      JSON.stringify(newPaper.tags),
      newPaper.thumbnailPath ?? null
    );
    return newPaper;
  },

  update: (id: string, updates: Partial<Omit<Paper, 'id' | 'subjectYearId' | 'filename' | 'originalName' | 'uploadDate' | 'totalPages'>>): Paper | undefined => {
    const db = getDatabase();
    const existing = paperQueries.getById(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    const tags = updated.tags ? JSON.stringify(updated.tags) : JSON.stringify(existing.tags);
    db.prepare(`
      UPDATE papers SET solved_status = ?, tags = ?, thumbnail_path = ? WHERE id = ?
    `).run(updated.solvedStatus, tags, updated.thumbnailPath ?? null, id);
    return updated;
  },

  delete: (id: string): boolean => {
    const db = getDatabase();
    const result = db.prepare('DELETE FROM papers WHERE id = ?').run(id);
    return result.changes > 0;
  },

  updateSolvedStatus: (id: string): Paper | undefined => {
    const db = getDatabase();
    const paper = paperQueries.getWithDetails(id);
    if (!paper) return undefined;
    
    let status: 'solved' | 'unsolved' | 'partial';
    
    if (paper.questions.length > 0) {
      const allSolved = paper.questions.every(q => q.solvedStatus === 'solved');
      const anyUnsolved = paper.questions.some(q => q.solvedStatus === 'unsolved');
      status = allSolved ? 'solved' : (anyUnsolved ? 'partial' : 'solved');
    } else {
      const pages = paper.pages;
      const allSolved = pages.every(p => p.solvedStatus === 'solved');
      const anyUnsolved = pages.some(p => p.solvedStatus === 'unsolved');
      status = allSolved ? 'solved' : (anyUnsolved ? 'partial' : 'unsolved');
    }
    
    if (status !== paper.solvedStatus) {
      db.prepare('UPDATE papers SET solved_status = ? WHERE id = ?').run(status, id);
      return { ...paper, solvedStatus: status };
    }
    return paper;
  }
};

// Page queries
export const pageQueries = {
  getByPaper: (paperId: string): Page[] => {
    const db = getDatabase();
    return db.prepare('SELECT * FROM pages WHERE paper_id = ? ORDER BY page_index').all(paperId) as Page[];
  },

  getById: (id: string): Page | undefined => {
    const db = getDatabase();
    return db.prepare('SELECT * FROM pages WHERE id = ?').get(id) as Page | undefined;
  },

  create: (page: Omit<Page, 'id'>): Page => {
    const db = getDatabase();
    const id = generateId();
    const newPage = { ...page, id };
    db.prepare(`
      INSERT INTO pages (id, paper_id, page_index, page_number, rotation, solved_status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, newPage.paperId, newPage.pageIndex, newPage.pageNumber, newPage.rotation, newPage.solvedStatus);
    return newPage;
  },

  createMany: (pages: Omit<Page, 'id'>[]): Page[] => {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO pages (id, paper_id, page_index, page_number, rotation, solved_status)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const transaction = db.transaction((pages: Omit<Page, 'id'>[]) => {
      return pages.map(page => {
        const id = generateId();
        stmt.run(id, page.paperId, page.pageIndex, page.pageNumber, page.rotation, page.solvedStatus);
        return { ...page, id };
      });
    });
    return transaction(pages);
  },

  update: (id: string, updates: Partial<Omit<Page, 'id' | 'paperId'>>): Page | undefined => {
    const db = getDatabase();
    const existing = pageQueries.getById(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    db.prepare(`
      UPDATE pages SET page_index = ?, rotation = ?, solved_status = ? WHERE id = ?
    `).run(updated.pageIndex, updated.rotation, updated.solvedStatus, id);
    return updated;
  },

  reorder: (pageIds: string[]): void => {
    const db = getDatabase();
    const stmt = db.prepare('UPDATE pages SET page_index = ? WHERE id = ?');
    const transaction = db.transaction((ids: string[]) => {
      ids.forEach((id, index) => {
        stmt.run(index, id);
      });
    });
    transaction(pageIds);
  },

  rotate: (id: string): Page | undefined => {
    const db = getDatabase();
    const page = pageQueries.getById(id);
    if (!page) return undefined;
    
    const newRotation = ((page.rotation + 90) % 360) as 0 | 90 | 180 | 270;
    db.prepare('UPDATE pages SET rotation = ? WHERE id = ?').run(newRotation, id);
    return { ...page, rotation: newRotation };
  },

  delete: (id: string): boolean => {
    const db = getDatabase();
    const result = db.prepare('DELETE FROM pages WHERE id = ?').run(id);
    return result.changes > 0;
  },

  updateIndicesAfterDelete: (paperId: string, deletedIndex: number): void => {
    const db = getDatabase();
    db.prepare('UPDATE pages SET page_index = page_index - 1 WHERE paper_id = ? AND page_index > ?').run(paperId, deletedIndex);
  }
};

// Question queries
export const questionQueries = {
  getByPaper: (paperId: string): Question[] => {
    const db = getDatabase();
    return db.prepare('SELECT * FROM questions WHERE paper_id = ? ORDER BY page_id_start').all(paperId) as Question[];
  },

  getById: (id: string): Question | undefined => {
    const db = getDatabase();
    return db.prepare('SELECT * FROM questions WHERE id = ?').get(id) as Question | undefined;
  },

  create: (question: Omit<Question, 'id'>): Question => {
    const db = getDatabase();
    const id = generateId();
    const newQuestion = { ...question, id };
    db.prepare(`
      INSERT INTO questions (id, paper_id, title, page_id_start, page_id_end, solved_status, tags, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, newQuestion.paperId, newQuestion.title, newQuestion.pageIdStart, newQuestion.pageIdEnd, newQuestion.solvedStatus, JSON.stringify(newQuestion.tags), newQuestion.notes);
    return newQuestion;
  },

  update: (id: string, updates: Partial<Omit<Question, 'id' | 'paperId'>>): Question | undefined => {
    const db = getDatabase();
    const existing = questionQueries.getById(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    const tags = updated.tags ? JSON.stringify(updated.tags) : JSON.stringify(existing.tags);
    db.prepare(`
      UPDATE questions SET title = ?, page_id_start = ?, page_id_end = ?, solved_status = ?, tags = ?, notes = ? WHERE id = ?
    `).run(updated.title, updated.pageIdStart, updated.pageIdEnd, updated.solvedStatus, tags, updated.notes, id);
    return updated;
  },

  delete: (id: string): boolean => {
    const db = getDatabase();
    const result = db.prepare('DELETE FROM questions WHERE id = ?').run(id);
    return result.changes > 0;
  },

  updateForPageDeletion: (deletedPageId: string): void => {
    const db = getDatabase();
    // Delete questions that reference the deleted page
    db.prepare('DELETE FROM questions WHERE page_id_start = ? OR page_id_end = ?').run(deletedPageId, deletedPageId);
  }
};

// Annotation queries
export const annotationQueries = {
  getByPaper: (paperId: string, pageId?: string, questionId?: string): Annotation[] => {
    const db = getDatabase();
    let query = 'SELECT * FROM annotations WHERE paper_id = ?';
    const params: any[] = [paperId];
    
    if (pageId) {
      query += ' AND page_id = ?';
      params.push(pageId);
    }
    if (questionId) {
      query += ' AND question_id = ?';
      params.push(questionId);
    }
    
    query += ' ORDER BY created_at';
    return db.prepare(query).all(...params) as Annotation[];
  },

  getByPage: (pageId: string): Annotation[] => {
    const db = getDatabase();
    return db.prepare('SELECT * FROM annotations WHERE page_id = ? ORDER BY created_at').all(pageId) as Annotation[];
  },

  getById: (id: string): Annotation | undefined => {
    const db = getDatabase();
    return db.prepare('SELECT * FROM annotations WHERE id = ?').get(id) as Annotation | undefined;
  },

  create: (annotation: Omit<Annotation, 'id' | 'createdAt' | 'updatedAt'>): Annotation => {
    const db = getDatabase();
    const id = generateId();
    const timestamp = now();
    const newAnnotation = { ...annotation, id, createdAt: timestamp, updatedAt: timestamp };
    db.prepare(`
      INSERT INTO annotations (id, paper_id, page_id, question_id, type, data, color, stroke_width, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, newAnnotation.paperId, newAnnotation.pageId, newAnnotation.questionId ?? null, newAnnotation.type, newAnnotation.data, newAnnotation.color, newAnnotation.strokeWidth, timestamp, timestamp);
    return newAnnotation;
  },

  batchUpsert: (annotations: Omit<Annotation, 'id' | 'createdAt' | 'updatedAt'>[]): Annotation[] => {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO annotations (id, paper_id, page_id, question_id, type, data, color, stroke_width, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        data = excluded.data,
        color = excluded.color,
        stroke_width = excluded.stroke_width,
        updated_at = excluded.updated_at
    `);
    const timestamp = now();
    const transaction = db.transaction((annotations: Omit<Annotation, 'id' | 'createdAt' | 'updatedAt'>[]) => {
      return annotations.map(a => {
        const id = generateId();
        stmt.run(id, a.paperId, a.pageId, a.questionId ?? null, a.type, a.data, a.color, a.strokeWidth, timestamp, timestamp);
        return { ...a, id, createdAt: timestamp, updatedAt: timestamp };
      });
    });
    return transaction(annotations);
  },

  update: (id: string, updates: Partial<Omit<Annotation, 'id' | 'paperId' | 'pageId' | 'questionId' | 'type' | 'createdAt'>>): Annotation | undefined => {
    const db = getDatabase();
    const existing = annotationQueries.getById(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates, updatedAt: now() };
    db.prepare(`
      UPDATE annotations SET data = ?, color = ?, stroke_width = ?, updated_at = ? WHERE id = ?
    `).run(updated.data, updated.color, updated.strokeWidth, updated.updatedAt, id);
    return updated;
  },

  delete: (id: string): boolean => {
    const db = getDatabase();
    const result = db.prepare('DELETE FROM annotations WHERE id = ?').run(id);
    return result.changes > 0;
  },

  deleteByPage: (pageId: string): void => {
    const db = getDatabase();
    db.prepare('DELETE FROM annotations WHERE page_id = ?').run(pageId);
  }
};
// Helper to transform snake_case to camelCase
function transformSubject(row: any): Subject {
  if (!row) return row;
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    color: row.color,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function transformYear(row: any): Year {
  if (!row) return row;
  return {
    id: row.id,
    subjectId: row.subject_id,
    year: row.year,
    label: row.label,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function transformPaper(row: any): Paper {
  if (!row) return row;
  return {
    id: row.id,
    subjectYearId: row.subject_year_id,
    filename: row.filename,
    originalName: row.original_name,
    uploadDate: row.upload_date,
    totalPages: row.total_pages,
    solvedStatus: row.solved_status,
    tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags,
    thumbnailPath: row.thumbnail_path,
  };
}
