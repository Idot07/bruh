# PDF Past Paper Manager - Implementation Plan

## Project Overview
A single-user React + Node.js/Express web application for uploading, organizing, and digitally solving PDF past papers with an integrated writing pad. Supports both document-level and question-level solved/unsolved tracking.

## Tech Stack
- **Frontend**: React (Vite) + TypeScript
- **Backend**: Node.js + Express + TypeScript
- **Database**: SQLite (better-sqlite3) - single file, no external dependencies
- **PDF Processing**: pdf-lib (manipulation), pdf.js (rendering)
- **Canvas/Writing Pad**: Fabric.js or Konva.js for drawing/annotation
- **File Storage**: Local filesystem (uploads/)

## Architecture

### Backend (Express API)
```
GET    /api/health                              - Health check

# Subjects
/api/subjects
  GET    /                                      - List all subjects (with year counts)
  POST   /                                      - Create subject (name, code?, color?)
  GET    /:id                                   - Get subject with years
  PATCH  /:id                                   - Update subject
  DELETE /:id                                   - Delete subject (cascades to years/papers)

# Years (scoped to subject)
/api/subjects/:subjectId/years
  GET    /                                      - List years for a subject
  POST   /                                      - Create year (year, label?)
  PATCH  /:id                                   - Update year
  DELETE /:id                                   - Delete year (cascades to papers)

# Papers (scoped to subjectYear)
/api/subjects/:subjectId/years/:yearId/papers
  GET    /                                      - List papers (query: status, tags, search)
  POST   /                                      - Upload new PDF (multipart/form-data)
  
/api/papers
  GET    /:id                                   - Get paper details + pages + questions
  PATCH  /:id                                   - Update paper metadata (tags)
  DELETE /:id                                   - Delete paper + file
  POST   /:id/pages/reorder                     - Reorder pages (body: pageId[] in new order)
  POST   /:id/pages/:pageId/rotate              - Rotate page 90°
  DELETE /:id/pages/:pageId                     - Delete page

# Questions
/api/questions
  GET    /paper/:paperId                        - Get questions for a paper
  POST   /                                      - Create question (paperId, title, pageIdStart, pageIdEnd, tags, notes)
  PATCH  /:id                                   - Update question (solvedStatus, tags, notes)
  DELETE /:id                                   - Delete question

# Annotations
/api/annotations
  GET    /paper/:paperId                        - Get all annotations for a paper (query: pageId, questionId)
  GET    /page/:pageId                          - Get annotations for a specific page
  POST   /                                      - Create annotation (paperId, pageId, questionId?, type, data, color, strokeWidth)
  PATCH  /:id                                   - Update annotation (data, color, strokeWidth)
  DELETE /:id                                   - Delete annotation
  POST   /batch                                 - Batch upsert annotations (for undo/redo sync)
```

### Frontend Structure
```
src/
  components/
    SubjectTree/          - Sidebar tree: Subject → Year → paper count
    SubjectManager/       - Modal/page for CRUD subjects
    YearManager/          - Modal/page for CRUD years within subject
    PaperList/            - Grid/list view with filters (solved/unsolved, tags)
    PaperViewer/          - PDF.js viewer with toolbar
    WritingPad/           - Canvas overlay for drawing/annotations
    QuestionPanel/        - Sidebar for question management
    Toolbar/              - Pen, eraser, highlighter, text, shapes, colors
    UploadDialog/         - Modal: select subject + year (required), file, tags
  pages/
    Dashboard.tsx         - Main view: SubjectTree sidebar + PaperList
    PaperView.tsx         - Individual paper with viewer + writing pad
    SubjectView.tsx       - Subject detail: years list + paper counts
    YearView.tsx          - Year detail: papers list
  hooks/
    useSubjects.ts        - Subject CRUD + tree data
    useYears.ts           - Year CRUD per subject
    usePapers.ts          - Paper CRUD + filtering (scoped to subjectYear)
    useAnnotations.ts     - Annotation CRUD per paper/page
    useQuestions.ts       - Question CRUD per paper
  types/
    index.ts              - Shared TypeScript interfaces
```

## Data Models

### Subject
```typescript
interface Subject {
  id: string;
  name: string;              // e.g., "Mathematics", "Physics", "Chemistry"
  code?: string;             // optional short code: "MATH", "PHYS", "CHEM"
  color?: string;            // hex color for UI theming
  createdAt: Date;
  updatedAt: Date;
}
```

### Year (scoped to Subject)
```typescript
interface Year {
  id: string;
  subjectId: string;         // references Subject.id
  year: number;              // e.g., 2020, 2021, 2022
  label?: string;            // optional display label: "2020", "2020-21", "Summer 2020"
  createdAt: Date;
  updatedAt: Date;
}
// Unique constraint: (subjectId, year)
```

### Paper
```typescript
interface Paper {
  id: string;
  subjectYearId: string;     // references Year.id (composite: subject + year)
  filename: string;
  originalName: string;
  uploadDate: Date;
  totalPages: number;
  solvedStatus: 'solved' | 'unsolved' | 'partial';
  tags: string[];
  thumbnailPath?: string;
  // Virtual fields (joined):
  // subjectName, subjectCode, subjectColor, yearValue, yearLabel
}
```

### Page
```typescript
interface Page {
  id: string;              // UUID - stable identifier across reorders
  paperId: string;
  pageIndex: number;       // current display order (0-based)
  pageNumber: number;      // original PDF page number (1-based)
  rotation: 0 | 90 | 180 | 270;
  solvedStatus: 'solved' | 'unsolved';
}
```

### Question
```typescript
interface Question {
  id: string;
  paperId: string;
  title: string;
  pageIdStart: string;     // references Page.id (stable across reorder)
  pageIdEnd: string;       // references Page.id
  solvedStatus: 'solved' | 'unsolved';
  tags: string[];
  notes: string;
}
```

### Annotation
```typescript
interface Annotation {
  id: string;
  paperId: string;
  pageId: string;          // references Page.id (stable across reorder)
  questionId?: string;     // optional link to question (hybrid approach)
  type: 'drawing' | 'text' | 'highlight' | 'shape';
  data: string;            // JSON-serialized Fabric.js object
  color: string;
  strokeWidth: number;
  createdAt: Date;
  updatedAt: Date;
}
```

## Key Features Implementation

### 0. Subject & Year Management
- **Subject CRUD**: Create/edit/delete subjects (name, optional code, color)
- **Year CRUD per Subject**: Create/edit/delete years (year number, optional label)
- **Tree Navigation**: Sidebar shows Subject → Year hierarchy with paper counts
- **Dashboard View**: Click subject → shows years; click year → shows papers list
- **Filter Dropdowns**: Top-bar dropdowns for quick subject/year filtering

### 1. PDF Upload & Processing
- Upload dialog: **required** subject + year selection (dropdowns populated from tree)
- Multer for file upload (max 50MB, accept only `.pdf`)
- pdf-lib to extract page count, metadata, create Page records with UUIDs
- Generate thumbnails: use `pdfjs-dist` in Node (headless) to render first page to PNG
- Store PDF in `uploads/papers/{paperId}.pdf`
- Store thumbnail in `uploads/thumbnails/{paperId}.png`

### 2. PDF Viewer (pdf.js)
- Use `pdfjs-dist` with worker for client-side rendering
- Render PDF pages to `<canvas>` elements
- Zoom (50%-300%), pan, page navigation (prev/next, page input)
- High-quality rendering for writing pad overlay
- Page rotation applied via CSS transform on canvas container

### 3. Writing Pad (Fabric.js)
- Transparent Fabric.js canvas overlay positioned exactly over PDF canvas
- Synchronize Fabric canvas size/scale with PDF render scale
- Tools: pen (free drawing), eraser (path eraser), highlighter (semi-transparent), text, rectangle, circle, arrow/line
- Color picker (preset + custom), stroke width selector (1-10px)
- Undo/redo stack per page (max 50 steps)
- Save annotations to backend per page (debounced 1s + on page change)
- Load annotations when switching pages
- **Hybrid linking**: annotations can optionally link to a question; QuestionPanel shows "Show annotations for this question" toggle

### 4. Question Management
- Create questions by selecting page range (via page thumbnails or page numbers)
- Associate annotations with questions (optional `questionId` on annotation)
- Mark questions solved/unsolved
- Filter papers by question status
- Question sidebar shows: title, page range (resolved to current page numbers), solved status, tags, notes

### 5. Solved/Unsolved Tracking
- **Paper.solvedStatus** computed server-side on read:
  - If paper has questions: all solved → 'solved'; any unsolved → 'partial'; no questions → fallback to pages
  - Fallback (no questions): all pages solved → 'solved'; any unsolved → 'partial'; else 'unsolved'
- **Page.solvedStatus**: manual toggle in UI (checkbox/badge)
- **Question.solvedStatus**: manual toggle in UI
- Dashboard filters: All / Solved / Unsolved / Partial (uses computed paper status)

### 6. Page Management
- Drag-drop reorder (updates `page_index` for affected pages)
- Rotate 90° increments (updates `rotation`)
- Delete pages (cascades: removes page, updates questions if pageIdStart/End deleted, removes annotations for that page)
- Page UUIDs remain stable → questions/annotations don't break on reorder
- After reorder, question page ranges resolved to current page numbers for display

## Database Schema (SQLite)

```sql
CREATE TABLE subjects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  code TEXT,
  color TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE years (
  id TEXT PRIMARY KEY,
  subject_id TEXT NOT NULL,
  year INTEGER NOT NULL,
  label TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  UNIQUE(subject_id, year)
);

CREATE TABLE papers (
  id TEXT PRIMARY KEY,
  subject_year_id TEXT NOT NULL,    -- references years.id
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  upload_date INTEGER NOT NULL,
  total_pages INTEGER NOT NULL,
  solved_status TEXT DEFAULT 'unsolved',
  tags TEXT DEFAULT '[]',
  thumbnail_path TEXT,
  FOREIGN KEY (subject_year_id) REFERENCES years(id)
);

CREATE TABLE pages (
  id TEXT PRIMARY KEY,              -- UUID, stable across reorders
  paper_id TEXT NOT NULL,
  page_index INTEGER NOT NULL,      -- current display order (0-based)
  page_number INTEGER NOT NULL,     -- original PDF page number (1-based)
  rotation INTEGER DEFAULT 0,
  solved_status TEXT DEFAULT 'unsolved',
  FOREIGN KEY (paper_id) REFERENCES papers(id) ON DELETE CASCADE
);

CREATE TABLE questions (
  id TEXT PRIMARY KEY,
  paper_id TEXT NOT NULL,
  title TEXT NOT NULL,
  page_id_start TEXT NOT NULL,      -- references pages.id
  page_id_end TEXT NOT NULL,        -- references pages.id
  solved_status TEXT DEFAULT 'unsolved',
  tags TEXT DEFAULT '[]',
  notes TEXT DEFAULT '',
  FOREIGN KEY (paper_id) REFERENCES papers(id) ON DELETE CASCADE,
  FOREIGN KEY (page_id_start) REFERENCES pages(id),
  FOREIGN KEY (page_id_end) REFERENCES pages(id)
);

CREATE TABLE annotations (
  id TEXT PRIMARY KEY,
  paper_id TEXT NOT NULL,
  page_id TEXT NOT NULL,            -- references pages.id
  question_id TEXT,                 -- optional link to questions.id
  type TEXT NOT NULL,
  data TEXT NOT NULL,               -- JSON serialized Fabric.js object
  color TEXT NOT NULL,
  stroke_width REAL NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (paper_id) REFERENCES papers(id) ON DELETE CASCADE,
  FOREIGN KEY (page_id) REFERENCES pages(id),
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE SET NULL
);

CREATE INDEX idx_papers_subject_year ON papers(subject_year_id);
CREATE INDEX idx_years_subject ON years(subject_id);
CREATE INDEX idx_annotations_paper_page ON annotations(paper_id, page_id);
CREATE INDEX idx_annotations_question ON annotations(question_id);
CREATE INDEX idx_questions_paper ON questions(paper_id);
CREATE INDEX idx_pages_paper ON pages(paper_id);
```

## Implementation Order

1. **Project Setup**
   - Initialize monorepo or separate client/server folders
   - Configure TypeScript, ESLint, Prettier
   - Set up SQLite database with migrations (subjects, years, papers, pages, questions, annotations)

2. **Backend Core**
   - Express server with CORS, body-parser
   - Subject CRUD + Year CRUD (scoped to subject)
   - Paper CRUD + file upload (scoped to subjectYear)
   - Database layer with better-sqlite3
   - PDF processing endpoints

3. **Frontend Core**
   - React + Vite + TypeScript setup
   - SubjectTree sidebar component
   - SubjectManager / YearManager modals
   - Paper list dashboard with upload (scoped to selected year)
   - Basic routing (React Router): /subjects/:subjectId/years/:yearId, /papers/:paperId

4. **PDF Viewer Integration**
   - pdf.js worker setup
   - PaperView page with viewer
   - Page navigation, zoom

5. **Writing Pad**
   - Fabric.js canvas overlay
   - Toolbar component
   - Annotation CRUD + persistence
   - Per-page annotation loading

6. **Question Management**
   - Question panel UI
   - Create/edit questions with page ranges
   - Link annotations to questions

7. **Solved/Unsolved Tracking**
   - Status badges, filters
   - Auto-calculation for paper status
   - Dashboard filtering

8. **Page Management**
   - Reorder, rotate, delete UI
   - Sync with questions/annotations

9. **Polish**
   - Keyboard shortcuts
   - Responsive design
   - Error handling, loading states
   - Export annotations (optional)

## File Structure
```
/workspace/app
├── server/
│   ├── src/
│   │   ├── index.ts
│   │   ├── routes/
│   │   │   ├── subjects.ts
│   │   │   ├── years.ts
│   │   │   ├── papers.ts
│   │   │   ├── pages.ts
│   │   │   ├── questions.ts
│   │   │   └── annotations.ts
│   │   ├── db/
│   │   │   ├── index.ts
│   │   │   ├── migrations/
│   │   │   └── queries/
│   │   ├── services/
│   │   │   ├── pdf.ts
│   │   │   └── thumbnail.ts
│   │   └── types/
│   │       └── index.ts
│   ├── package.json
│   └── tsconfig.json
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── SubjectTree/
│   │   │   ├── SubjectManager/
│   │   │   ├── YearManager/
│   │   │   ├── PaperList/
│   │   │   ├── PaperViewer/
│   │   │   ├── WritingPad/
│   │   │   ├── QuestionPanel/
│   │   │   ├── Toolbar/
│   │   │   └── UploadDialog/
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── PaperView.tsx
│   │   │   ├── SubjectView.tsx
│   │   │   └── YearView.tsx
│   │   ├── hooks/
│   │   │   ├── useSubjects.ts
│   │   │   ├── useYears.ts
│   │   │   ├── usePapers.ts
│   │   │   ├── useAnnotations.ts
│   │   │   └── useQuestions.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   └── api.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── uploads/
│   ├── papers/
│   └── thumbnails/
├── package.json (root scripts)
└── README.md
```

## Open Questions / Future Considerations
- [ ] Export annotated PDF (merge annotations into PDF)
- [ ] OCR for searchable text
- [ ] Cloud sync / backup
- [ ] Multi-user support
- [ ] Mobile-responsive writing pad
- [ ] Keyboard shortcuts for tools
- [ ] Annotation layers (show/hide per question)
