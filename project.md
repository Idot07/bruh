# PDF Past Paper Manager - Current Implementation

## Project Overview
A single-user React + Node.js/Express web application for uploading, organizing, and digitally solving PDF past papers with an integrated writing pad. Supports both document-level and question-level solved/unsolved tracking.

## Tech Stack
- **Frontend**: React (Vite) + TypeScript, React Router
- **Backend**: Node.js + Express + TypeScript
- **Database**: SQLite (better-sqlite3) - single file
- **PDF Processing**: pdf-lib (manipulation), pdfjs-dist (rendering)
- **Canvas/Writing Pad**: Fabric.js for drawing/annotation
- **File Storage**: Local filesystem (uploads/)

## Current Features

### Core Organization
- **Subjects**: Create/edit/delete subjects with name, optional code, color
- **Years**: Organize years per subject (unique per subject)
- **Papers**: Upload PDFs scoped to subject + year
- **Tree Navigation**: Sidebar with Subject → Year hierarchy, paper counts
- **Dashboard**: Premium UI with statistics cards, subject overview grid

### PDF Management
- **Upload**: Drag & drop or browse, select subject/year on upload (no pre-selection required)
- **PDF Viewer**: pdf.js rendering with page navigation, zoom (50%-300%), rotation
- **Page Management**: Reorder, rotate, delete pages
- **Thumbnails**: Auto-generated from first page

### Digital Solving
- **Writing Pad**: Fabric.js canvas overlay for annotations
- **Tools**: Pen, highlighter, eraser, shapes, text
- **Annotations**: Persist per page, linked to questions optionally
- **Questions**: Create questions spanning page ranges, track solved status
- **Status Tracking**: Paper/question/page solved/unsolved/partial states

### UI/UX
- **Premium Design**: Modern 2026 aesthetic with gradients, shadows, animations
- **Responsive**: Fluid typography and spacing
- **Dark Mode Ready**: CSS variables for theming
- **Modals**: Polished modals for CRUD operations

## API Structure

### Subjects
```
GET    /api/subjects                - List all subjects with year counts
POST   /api/subjects                - Create subject
GET    /api/subjects/:id            - Get subject with years
PATCH  /api/subjects/:id            - Update subject
DELETE /api/subjects/:id            - Delete subject
```

### Years
```
GET    /api/subjects/:subjectId/years  - List years
POST   /api/subjects/:subjectId/years  - Create year
PATCH  /api/years/:id                  - Update year
DELETE /api/years/:id                  - Delete year
```

### Papers
```
GET    /api/subjects/:subjectId/years/:yearId/papers  - List papers
POST   /api/subjects/:subjectId/years/:yearId/papers  - Upload PDF
GET    /api/papers/:id                                - Get paper details
PATCH  /api/papers/:id                                - Update paper
DELETE /api/papers/:id                                - Delete paper
POST   /api/papers/:id/pages/reorder                  - Reorder pages
POST   /api/papers/:id/pages/:pageId/rotate           - Rotate page
DELETE /api/papers/:id/pages/:pageId                  - Delete page
```

### Questions & Annotations
```
GET    /api/questions/paper/:paperId       - Get questions
POST   /api/questions                       - Create question
PATCH  /api/questions/:id                   - Update question
DELETE /api/questions/:id                   - Delete question

GET    /api/annotations/paper/:paperId      - Get annotations
POST   /api/annotations                     - Create annotation
PATCH  /api/annotations/:id                 - Update annotation
DELETE /api/annotations/:id                 - Delete annotation
POST   /api/annotations/batch               - Batch upsert
```

## Data Models
- Subject, Year (scoped to Subject), Paper (scoped to SubjectYear), Page, Question, Annotation

## Database Schema
Tables: subjects, years, papers, pages, questions, annotations with proper foreign keys and indexes.

## File Structure
```
/workspace/app
├── server/          # Express API + SQLite
├── client/          # React + Vite frontend
├── uploads/         # PDF files and thumbnails
└── data/            # SQLite database
```

## Recent Improvements
- Premium UI redesign with modern aesthetics
- Dashboard statistics cards and subject overview
- Upload button now accessible without pre-selection
- Fixed subject name truncation for long names
- Enhanced color picker in subject creation
- Improved responsive design
