import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { join } from 'path';
import { existsSync } from 'fs';

import subjectsRouter from '@/routes/subjects';
import yearsRouter from '@/routes/years';
import papersRouter from '@/routes/papers';
import questionsRouter from '@/routes/questions';
import annotationsRouter from '@/routes/annotations';
import { ensureUploadDirs } from '@/services/pdf';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure upload directories exist
ensureUploadDirs().catch(console.error);

// Serve uploaded files statically
const uploadsDir = join(process.cwd(), 'uploads');
if (existsSync(uploadsDir)) {
  app.use('/uploads', express.static(uploadsDir));
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// API Routes
app.use('/api/subjects', subjectsRouter);
app.use('/api/subjects/:subjectId/years', yearsRouter);
app.use('/api/subjects/:subjectId/years/:yearId/papers', papersRouter);
app.use('/api/papers', papersRouter); // For paper-level routes not scoped to year
app.use('/api/questions', questionsRouter);
app.use('/api/annotations', annotationsRouter);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  }
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;