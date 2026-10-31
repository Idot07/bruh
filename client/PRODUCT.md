# PDF Past Paper Manager - Product Definition

## Product Truth
**What it is:** A single-user desktop web application for uploading, organizing, and digitally solving PDF past papers with an integrated writing pad. Think "Notion meets PDF annotator for exam prep."

**Who it's for:** Students and self-learners doing past paper practice. They need to upload PDFs, organize by subject/year, write/draw on pages, create questions linked to page ranges, and track solved/unsolved status.

**Core jobs:**
1. Upload and organize PDFs by subject → year
2. View PDFs with zoom/pan/rotate
3. Write/draw annotations per page (pen, eraser, highlighter, shapes, text)
4. Create questions linked to page ranges
5. Track solved/unsolved at paper, page, and question level
6. Filter papers by status

## Current Visual Implementation (Incumbent)
- **Platform:** React + Vite + TypeScript (web, desktop-first)
- **Architecture:** Two-pane dashboard (sidebar tree + paper list) → Paper view (viewer + writing pad + question panel)
- **Color mode:** Light only (no dark mode)
- **Typography:** System font stack (-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif), 14px base
- **Tokens:** CSS custom properties defined in index.css but NOT used in component CSS
- **Components:** SubjectTree, PaperList, PaperViewer, WritingPad (Fabric.js), Toolbar, QuestionPanel, UploadDialog, SubjectManager, YearManager
- **Icons:** Emoji/unicode glyphs (🖱️ ✏️ 🧽 🖍️ 📝 ⬜ ⭕ ➡️ etc.)
- **Motion:** 150ms transitions on hover/active states

## Constraints & Constraints
- **Must preserve:** All current functionality (subject/year CRUD, PDF upload/view, annotations, questions, solved tracking)
- **Must preserve:** Fabric.js writing pad implementation
- **Must preserve:** pdf.js viewer integration
- **Must preserve:** SQLite backend + Express API
- **Can change:** All visual implementation (CSS, component structure, tokens, icons)
- **Target mode:** Operate (task-focused app UI)
- **Target quality:** Production-grade, coherent design system, WCAG AA

## Design Direction
**Mode:** Operate — familiarity over expression, restraint over decoration
**Principles:**
- Use the token system (already defined in index.css) everywhere
- Replace emoji icons with a consistent SVG icon system
- Restrained color: primary for actions/selection only, neutrals for structure
- 150-250ms motion for state change only
- Skeleton loading, instructive empty states
- Consistent component vocabulary across surfaces
- WCAG AA contrast, 44px touch targets
- Dark mode support