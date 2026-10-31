"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const queries_1 = require("@/db/queries");
const router = (0, express_1.Router)();
// GET /api/questions/paper/:paperId - Get questions for a paper
router.get('/paper/:paperId', (req, res) => {
    try {
        const questions = queries_1.questionQueries.getByPaper(req.params.paperId);
        res.json(questions);
    }
    catch (error) {
        console.error('Error fetching questions:', error);
        res.status(500).json({ error: 'Failed to fetch questions' });
    }
});
// POST /api/questions - Create question
router.post('/', (req, res) => {
    try {
        const { paperId, title, pageIdStart, pageIdEnd, tags, notes } = req.body;
        if (!paperId || !title || !pageIdStart || !pageIdEnd) {
            return res.status(400).json({ error: 'paperId, title, pageIdStart, and pageIdEnd are required' });
        }
        const question = queries_1.questionQueries.create({
            paperId,
            title,
            pageIdStart,
            pageIdEnd,
            solvedStatus: 'unsolved',
            tags: tags || [],
            notes: notes || ''
        });
        res.status(201).json(question);
    }
    catch (error) {
        console.error('Error creating question:', error);
        res.status(500).json({ error: 'Failed to create question' });
    }
});
// PATCH /api/questions/:id - Update question
router.patch('/:id', (req, res) => {
    try {
        const { title, pageIdStart, pageIdEnd, solvedStatus, tags, notes } = req.body;
        const question = queries_1.questionQueries.update(req.params.id, { title, pageIdStart, pageIdEnd, solvedStatus, tags, notes });
        if (!question) {
            return res.status(404).json({ error: 'Question not found' });
        }
        res.json(question);
    }
    catch (error) {
        console.error('Error updating question:', error);
        res.status(500).json({ error: 'Failed to update question' });
    }
});
// DELETE /api/questions/:id - Delete question
router.delete('/:id', (req, res) => {
    try {
        const success = queries_1.questionQueries.delete(req.params.id);
        if (!success) {
            return res.status(404).json({ error: 'Question not found' });
        }
        res.status(204).send();
    }
    catch (error) {
        console.error('Error deleting question:', error);
        res.status(500).json({ error: 'Failed to delete question' });
    }
});
exports.default = router;
//# sourceMappingURL=questions.js.map