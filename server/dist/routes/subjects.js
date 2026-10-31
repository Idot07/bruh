"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const queries_1 = require("@/db/queries");
const router = (0, express_1.Router)();
// GET /api/subjects - List all subjects with year counts
router.get('/', (req, res) => {
    try {
        const subjects = queries_1.subjectQueries.getAll();
        res.json(subjects);
    }
    catch (error) {
        console.error('Error fetching subjects:', error);
        res.status(500).json({ error: 'Failed to fetch subjects' });
    }
});
// POST /api/subjects - Create subject
router.post('/', (req, res) => {
    try {
        const { name, code, color } = req.body;
        if (!name || typeof name !== 'string') {
            return res.status(400).json({ error: 'Name is required' });
        }
        const subject = queries_1.subjectQueries.create({ name, code, color });
        res.status(201).json(subject);
    }
    catch (error) {
        console.error('Error creating subject:', error);
        if (error instanceof Error && error.message.includes('UNIQUE')) {
            return res.status(409).json({ error: 'Subject with this name already exists' });
        }
        res.status(500).json({ error: 'Failed to create subject' });
    }
});
// GET /api/subjects/:id - Get subject with years
router.get('/:id', (req, res) => {
    try {
        const subject = queries_1.subjectQueries.getById(req.params.id);
        if (!subject) {
            return res.status(404).json({ error: 'Subject not found' });
        }
        const years = queries_1.subjectQueries.getWithYears().find(s => s.id === req.params.id)?.years || [];
        res.json({ ...subject, years });
    }
    catch (error) {
        console.error('Error fetching subject:', error);
        res.status(500).json({ error: 'Failed to fetch subject' });
    }
});
// PATCH /api/subjects/:id - Update subject
router.patch('/:id', (req, res) => {
    try {
        const { name, code, color } = req.body;
        const subject = queries_1.subjectQueries.update(req.params.id, { name, code, color });
        if (!subject) {
            return res.status(404).json({ error: 'Subject not found' });
        }
        res.json(subject);
    }
    catch (error) {
        console.error('Error updating subject:', error);
        res.status(500).json({ error: 'Failed to update subject' });
    }
});
// DELETE /api/subjects/:id - Delete subject
router.delete('/:id', (req, res) => {
    try {
        const success = queries_1.subjectQueries.delete(req.params.id);
        if (!success) {
            return res.status(404).json({ error: 'Subject not found' });
        }
        res.status(204).send();
    }
    catch (error) {
        console.error('Error deleting subject:', error);
        res.status(500).json({ error: 'Failed to delete subject' });
    }
});
exports.default = router;
//# sourceMappingURL=subjects.js.map