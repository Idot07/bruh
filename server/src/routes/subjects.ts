import { Router, Request, Response } from 'express';
import { subjectQueries } from '@/db/queries';

const router = Router();

// GET /api/subjects - List all subjects with year counts
router.get('/', (req: Request, res: Response) => {
  try {
    const subjects = subjectQueries.getAll();
    res.json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

// POST /api/subjects - Create subject
router.post('/', (req: Request, res: Response) => {
  try {
    const { name, code, color } = req.body;
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Name is required' });
    }
    const subject = subjectQueries.create({ name, code, color });
    res.status(201).json(subject);
  } catch (error) {
    console.error('Error creating subject:', error);
    if (error instanceof Error && error.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'Subject with this name already exists' });
    }
    res.status(500).json({ error: 'Failed to create subject' });
  }
});

// GET /api/subjects/:id - Get subject with years
router.get('/:id', (req: Request, res: Response) => {
  try {
    const subject = subjectQueries.getById(req.params.id);
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    const years = subjectQueries.getWithYears().find(s => s.id === req.params.id)?.years || [];
    res.json({ ...subject, years });
  } catch (error) {
    console.error('Error fetching subject:', error);
    res.status(500).json({ error: 'Failed to fetch subject' });
  }
});

// PATCH /api/subjects/:id - Update subject
router.patch('/:id', (req: Request, res: Response) => {
  try {
    const { name, code, color } = req.body;
    const subject = subjectQueries.update(req.params.id, { name, code, color });
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    res.json(subject);
  } catch (error) {
    console.error('Error updating subject:', error);
    res.status(500).json({ error: 'Failed to update subject' });
  }
});

// DELETE /api/subjects/:id - Delete subject
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const success = subjectQueries.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting subject:', error);
    res.status(500).json({ error: 'Failed to delete subject' });
  }
});

export default router;