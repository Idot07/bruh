"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const queries_1 = require("@/db/queries");
const router = (0, express_1.Router)({ mergeParams: true });
// GET /api/subjects/:subjectId/years - List years for a subject
router.get('/', (req, res) => {
    try {
        const years = queries_1.yearQueries.getBySubject(req.params.subjectId);
        res.json(years);
    }
    catch (error) {
        console.error('Error fetching years:', error);
        res.status(500).json({ error: 'Failed to fetch years' });
    }
});
// POST /api/subjects/:subjectId/years - Create year
router.post('/', (req, res) => {
    try {
        const { year, label } = req.body;
        if (!year || typeof year !== 'number') {
            return res.status(400).json({ error: 'Year is required and must be a number' });
        }
        const newYear = queries_1.yearQueries.create({ subjectId: req.params.subjectId, year, label });
        res.status(201).json(newYear);
    }
    catch (error) {
        console.error('Error creating year:', error);
        if (error instanceof Error && error.message.includes('UNIQUE')) {
            return res.status(409).json({ error: 'Year already exists for this subject' });
        }
        res.status(500).json({ error: 'Failed to create year' });
    }
});
// PATCH /api/subjects/:subjectId/years/:id - Update year
router.patch('/:id', (req, res) => {
    try {
        const { year, label } = req.body;
        const updated = queries_1.yearQueries.update(req.params.id, { year, label });
        if (!updated) {
            return res.status(404).json({ error: 'Year not found' });
        }
        res.json(updated);
    }
    catch (error) {
        console.error('Error updating year:', error);
        res.status(500).json({ error: 'Failed to update year' });
    }
});
// DELETE /api/subjects/:subjectId/years/:id - Delete year
router.delete('/:id', (req, res) => {
    try {
        const success = queries_1.yearQueries.delete(req.params.id);
        if (!success) {
            return res.status(404).json({ error: 'Year not found' });
        }
        res.status(204).send();
    }
    catch (error) {
        console.error('Error deleting year:', error);
        res.status(500).json({ error: 'Failed to delete year' });
    }
});
exports.default = router;
//# sourceMappingURL=years.js.map