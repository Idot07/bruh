import Database from 'better-sqlite3';
import { join } from 'path';
import { mkdirSync, existsSync } from 'fs';

const DB_PATH = join(process.cwd(), 'data', 'papers.db');

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    const dataDir = join(process.cwd(), 'data');
    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true });
    }
    
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    
    runMigrations(db);
  }
  return db;
}

function runMigrations(db: Database.Database) {
  const migrations = [
    `CREATE TABLE IF NOT EXISTS subjects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      code TEXT,
      color TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS years (
      id TEXT PRIMARY KEY,
      subject_id TEXT NOT NULL,
      year INTEGER NOT NULL,
      label TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
      UNIQUE(subject_id, year)
    )`,
    `CREATE TABLE IF NOT EXISTS papers (
      id TEXT PRIMARY KEY,
      subject_year_id TEXT NOT NULL,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      upload_date INTEGER NOT NULL,
      total_pages INTEGER NOT NULL,
      solved_status TEXT DEFAULT 'unsolved',
      tags TEXT DEFAULT '[]',
      thumbnail_path TEXT,
      FOREIGN KEY (subject_year_id) REFERENCES years(id)
    )`,
    `CREATE TABLE IF NOT EXISTS pages (
      id TEXT PRIMARY KEY,
      paper_id TEXT NOT NULL,
      page_index INTEGER NOT NULL,
      page_number INTEGER NOT NULL,
      rotation INTEGER DEFAULT 0,
      solved_status TEXT DEFAULT 'unsolved',
      FOREIGN KEY (paper_id) REFERENCES papers(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      paper_id TEXT NOT NULL,
      title TEXT NOT NULL,
      page_id_start TEXT NOT NULL,
      page_id_end TEXT NOT NULL,
      solved_status TEXT DEFAULT 'unsolved',
      tags TEXT DEFAULT '[]',
      notes TEXT DEFAULT '',
      FOREIGN KEY (paper_id) REFERENCES papers(id) ON DELETE CASCADE,
      FOREIGN KEY (page_id_start) REFERENCES pages(id),
      FOREIGN KEY (page_id_end) REFERENCES pages(id)
    )`,
    `CREATE TABLE IF NOT EXISTS annotations (
      id TEXT PRIMARY KEY,
      paper_id TEXT NOT NULL,
      page_id TEXT NOT NULL,
      question_id TEXT,
      type TEXT NOT NULL,
      data TEXT NOT NULL,
      color TEXT NOT NULL,
      stroke_width REAL NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (paper_id) REFERENCES papers(id) ON DELETE CASCADE,
      FOREIGN KEY (page_id) REFERENCES pages(id),
      FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE SET NULL
    )`,
    `CREATE INDEX IF NOT EXISTS idx_papers_subject_year ON papers(subject_year_id)`,
    `CREATE INDEX IF NOT EXISTS idx_years_subject ON years(subject_id)`,
    `CREATE INDEX IF NOT EXISTS idx_annotations_paper_page ON annotations(paper_id, page_id)`,
    `CREATE INDEX IF NOT EXISTS idx_annotations_question ON annotations(question_id)`,
    `CREATE INDEX IF NOT EXISTS idx_questions_paper ON questions(paper_id)`,
    `CREATE INDEX IF NOT EXISTS idx_pages_paper ON pages(paper_id)`,
  ];

  for (const migration of migrations) {
    db.exec(migration);
  }
}

export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}