# Plan: Premium UI update, fix upload/subject issues, update project.md

## Problem statement recap
The user wants:
- Give the website a premium look like a modern website of 2026, it looks too basic right now
- Update the product md to everything we've done so far
- The home page looks too empty, maybe add statistics per subject in cards there
- Upload button doesn't work until you select a subject which shouldn't be the case - you should be able to upload and select subject and available years
- The color selector in subject creation does not show up
- The word "mathematics" shows as M.... because its too big

## Analysis
Looking at codebase:
- Dashboard currently shows "Welcome" when no subject selected, or "Select a Year" when subject selected. Empty-looking home. Need to add statistics (subject cards with counts).
- UploadDialog: already allows selecting subject/year from dropdowns; Dashboard disables Upload button if no subject/year selected. Need to allow upload anytime, let UploadDialog handle selection.
- SubjectManager: has color picker with preset colors + custom color input - color selector exists in code. Maybe CSS issue or z-index? Also modal styles look fine. Need to debug/check.
- SubjectTree: `.subject-name` has `text-overflow: ellipsis` and `white-space: nowrap` - causing truncation like "Mathematics" becoming "M..." if container too narrow. Also flex layout may cause issues. Need to fix overflow/wrapping.
- project.md is the plan doc - needs updating to reflect current implementation state.

## Solution

### 1. Dashboard UI premium + statistics cards
- Add hero/summary cards showing total subjects, total papers, etc. 
- When no selection, show stats cards per subject with counts of years/papers
- Redesign Dashboard.css for more premium look (gradients, cards, better spacing)
- Make it look more modern 2026 style (glassmorphism, better shadows, refined typography)

### 2. Allow upload without pre-selection
- Remove `disabled={!selectedSubjectId || !selectedYearId}` from Upload button in Dashboard
- UploadDialog already handles subject/year selection independently - just need to allow opening

### 3. Fix color selector in SubjectManager
- Color picker exists. Check if CSS is hiding it? The color picker has `.color-picker` styles. Maybe ensure proper display. Also check if modal styles affect it.
- The color input type="color" has class `custom-color` - styles exist. Should be visible.

### 4. Fix subject name truncation
- In SubjectTree.css, `.subject-name` has `overflow: hidden; text-overflow: ellipsis; white-space: nowrap;` causing truncation. For long names like "Mathematics", we need to allow wrapping or better handling. Change to allow wrapping or adjust layout. Also check if parent has overflow constraints.
- Also in SubjectNode, the layout uses flex with actions that might shrink. Maybe allow name to wrap or use min-width: 0.

### 5. Update project.md
- Update to reflect what's been done so far (current implementation state)

## Implementation details

### Dashboard changes
- Add stats calculation from subjects/years/papers
- Redesign welcome/empty state with cards
- Add CSS for stats cards with gradients

### UploadDialog
- Already works - just need to not disable button

### SubjectTree
- Change `.subject-name` to allow wrapping or better ellipsis
```css
.subject-name {
  flex: 1 1 auto;
  min-width: 0;
  ...
  white-space: normal;
  word-break: break-word;
}
```
Or keep ellipsis but ensure container allows. Also maybe adjust flex properties.

### SubjectManager
- Color picker should be fine. Maybe add more explicit styles.

### project.md
- Rewrite/update to current state.

Let us start implementing.
