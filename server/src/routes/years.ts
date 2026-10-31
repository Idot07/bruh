import { Router, Request, Response } from 'express';
import { yearQueries } from '@/db/queries';

const router = Router({ mergeParams: true });

// GET /api/subjects/:subjectId/years - List years for a subject
router.get('/', (req: Request, res: Response) => {
  try {
    const years = yearQueries.getBySubject(req.params.subjectId);
    res.json(years);
  } catch (error) {
    console.error('Error fetching years:', error);
    res.status(500).json({ error: 'Failed to fetch years' });
  }
});

// POST /api/subjects/:subjectId/years - Create year
router.post('/', (req: Request, res: Response) => {
  try {
    const { year, label } = req.body;
    if (!year || typeof year !== 'number') {
      return res.status(400).json({ error: 'Year is required and must be a number' });
    }
    const newYear = yearQueries.create({ subjectId: req.params.subjectId, year, label });
    res.status(201).json(newYear);
  } catch (error) {
    console.error('Error creating year:', error);
    if (error instanceof Error && error.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'Year already exists for this subject' });
    }
    res.status(500).json({ error: 'Failed to create year' });
  }
});

// PATCH /api/subjects/:subjectId/years/:id - Update year
router.patch('/:id', (req: Request, res: Response) => {
  try {
    const { year, label } = req.body;
    const updated = yearQueries.update(req.params.id, { year, label });
    if (!updated) {
      return res.status(404).json({ error: 'Year not found' });
    }
    res.json(updated);
  } catch (error) {
    console.error('Error updating year:', error);
    res.status(500).json({ error: 'Failed to update year' });
  }
});

// DELETE /api/subjects/:subjectId/years/:id - Delete year
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const success = yearQueries.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Year not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting year:', error);
    res.status(500).json({ error: 'Failed to delete year' });
  }
});

export default router;