import { Router, Request, Response } from 'express';
import { annotationQueries } from '@/db/queries';

const router = Router();

// GET /api/annotations/paper/:paperId - Get all annotations for a paper
router.get('/paper/:paperId', (req: Request, res: Response) => {
  try {
    const { pageId, questionId } = req.query;
    const annotations = annotationQueries.getByPaper(
      req.params.paperId,
      pageId as string,
      questionId as string
    );
    res.json(annotations);
  } catch (error) {
    console.error('Error fetching annotations:', error);
    res.status(500).json({ error: 'Failed to fetch annotations' });
  }
});

// GET /api/annotations/page/:pageId - Get annotations for a specific page
router.get('/page/:pageId', (req: Request, res: Response) => {
  try {
    const annotations = annotationQueries.getByPage(req.params.pageId);
    res.json(annotations);
  } catch (error) {
    console.error('Error fetching annotations:', error);
    res.status(500).json({ error: 'Failed to fetch annotations' });
  }
});

// POST /api/annotations - Create annotation
router.post('/', (req: Request, res: Response) => {
  try {
    const { paperId, pageId, questionId, type, data, color, strokeWidth } = req.body;
    
    if (!paperId || !pageId || !type || !data || !color || strokeWidth === undefined) {
      return res.status(400).json({ error: 'paperId, pageId, type, data, color, and strokeWidth are required' });
    }
    
    const annotation = annotationQueries.create({
      paperId,
      pageId,
      questionId,
      type,
      data,
      color,
      strokeWidth
    });
    
    res.status(201).json(annotation);
  } catch (error) {
    console.error('Error creating annotation:', error);
    res.status(500).json({ error: 'Failed to create annotation' });
  }
});

// PATCH /api/annotations/:id - Update annotation
router.patch('/:id', (req: Request, res: Response) => {
  try {
    const { data, color, strokeWidth } = req.body;
    const annotation = annotationQueries.update(req.params.id, { data, color, strokeWidth });
    
    if (!annotation) {
      return res.status(404).json({ error: 'Annotation not found' });
    }
    
    res.json(annotation);
  } catch (error) {
    console.error('Error updating annotation:', error);
    res.status(500).json({ error: 'Failed to update annotation' });
  }
});

// DELETE /api/annotations/:id - Delete annotation
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const success = annotationQueries.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Annotation not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting annotation:', error);
    res.status(500).json({ error: 'Failed to delete annotation' });
  }
});

// POST /api/annotations/batch - Batch upsert annotations
router.post('/batch', (req: Request, res: Response) => {
  try {
    const { annotations } = req.body;
    
    if (!Array.isArray(annotations)) {
      return res.status(400).json({ error: 'annotations array is required' });
    }
    
    const created = annotationQueries.batchUpsert(annotations);
    res.status(201).json(created);
  } catch (error) {
    console.error('Error batch upserting annotations:', error);
    res.status(500).json({ error: 'Failed to batch upsert annotations' });
  }
});

export default router;