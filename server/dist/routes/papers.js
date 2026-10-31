"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const promises_1 = require("fs/promises");
const queries_1 = require("@/db/queries");
const pdf_1 = require("@/services/pdf");
const router = (0, express_1.Router)({ mergeParams: true });
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        }
        else {
            cb(new Error('Only PDF files are allowed'));
        }
    }
});
// GET /api/subjects/:subjectId/years/:yearId/papers - List papers
router.get('/', (req, res) => {
    try {
        const { status, tags, search } = req.query;
        const filters = {};
        if (status)
            filters.status = status;
        if (tags)
            filters.tags = tags.split(',');
        if (search)
            filters.search = search;
        const papers = queries_1.paperQueries.getBySubjectYear(req.params.yearId, filters);
        res.json(papers);
    }
    catch (error) {
        console.error('Error fetching papers:', error);
        res.status(500).json({ error: 'Failed to fetch papers' });
    }
});
// POST /api/subjects/:subjectId/years/:yearId/papers - Upload new PDF
router.post('/', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const { tags } = req.body;
        const parsedTags = tags ? JSON.parse(tags) : [];
        // Save PDF temporarily to process
        const tempPath = `/tmp/${Date.now()}-${req.file.originalname}`;
        await import('fs/promises').then(fs => fs.writeFile(tempPath, req.file.buffer));
        // Process PDF to get page count
        const { totalPages } = await (0, pdf_1.processPdf)(tempPath);
        // Create paper record
        const paper = queries_1.paperQueries.create({
            subjectYearId: req.params.yearId,
            filename: `${Date.now()}-${req.file.originalname}`,
            originalName: req.file.originalname,
            totalPages,
            tags: parsedTags
        });
        // Save PDF to permanent location
        await (0, pdf_1.savePdf)(paper.id, req.file.buffer);
        // Create page records
        const pages = Array.from({ length: totalPages }, (_, i) => ({
            paperId: paper.id,
            pageIndex: i,
            pageNumber: i + 1,
            rotation: 0,
            solvedStatus: 'unsolved'
        }));
        queries_1.pageQueries.createMany(pages);
        // Generate thumbnail
        const thumbPath = (0, pdf_1.getThumbnailPath)(paper.id);
        await (0, pdf_1.generateThumbnail)(tempPath, thumbPath);
        // Update paper with thumbnail path
        queries_1.paperQueries.update(paper.id, { thumbnailPath: thumbPath });
        // Clean up temp file
        await import('fs/promises').then(fs => fs.unlink(tempPath).catch(() => { }));
        // Return paper with details
        const paperWithDetails = queries_1.paperQueries.getWithDetails(paper.id);
        res.status(201).json(paperWithDetails);
    }
    catch (error) {
        console.error('Error uploading paper:', error);
        res.status(500).json({ error: 'Failed to upload paper' });
    }
});
// GET /api/papers/:id - Get paper details + pages + questions
router.get('/:id', (req, res) => {
    try {
        const paper = queries_1.paperQueries.getWithDetails(req.params.id);
        if (!paper) {
            return res.status(404).json({ error: 'Paper not found' });
        }
        res.json(paper);
    }
    catch (error) {
        console.error('Error fetching paper:', error);
        res.status(500).json({ error: 'Failed to fetch paper' });
    }
});
// GET /api/papers/:id/file - Serve PDF file for pdf.js
router.get('/:id/file', async (req, res) => {
    try {
        const paper = queries_1.paperQueries.getById(req.params.id);
        if (!paper) {
            return res.status(404).json({ error: 'Paper not found' });
        }
        const filePath = (0, pdf_1.getPaperPath)(paper.id);
        const fileBuffer = await (0, promises_1.readFile)(filePath);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Length', fileBuffer.length);
        res.setHeader('Accept-Ranges', 'bytes');
        res.send(fileBuffer);
    }
    catch (error) {
        console.error('Error serving PDF:', error);
        res.status(500).json({ error: 'Failed to serve PDF' });
    }
});
// PATCH /api/papers/:id - Update paper metadata
router.patch('/:id', (req, res) => {
    try {
        const { tags } = req.body;
        const paper = queries_1.paperQueries.update(req.params.id, { tags });
        if (!paper) {
            return res.status(404).json({ error: 'Paper not found' });
        }
        res.json(paper);
    }
    catch (error) {
        console.error('Error updating paper:', error);
        res.status(500).json({ error: 'Failed to update paper' });
    }
});
// DELETE /api/papers/:id - Delete paper
router.delete('/:id', async (req, res) => {
    try {
        const success = queries_1.paperQueries.delete(req.params.id);
        if (!success) {
            return res.status(404).json({ error: 'Paper not found' });
        }
        await (0, pdf_1.deletePdf)(req.params.id);
        res.status(204).send();
    }
    catch (error) {
        console.error('Error deleting paper:', error);
        res.status(500).json({ error: 'Failed to delete paper' });
    }
});
// POST /api/papers/:id/pages/reorder - Reorder pages
router.post('/:id/pages/reorder', (req, res) => {
    try {
        const { pageIds } = req.body;
        if (!Array.isArray(pageIds)) {
            return res.status(400).json({ error: 'pageIds array is required' });
        }
        queries_1.pageQueries.reorder(pageIds);
        // Update paper solved status
        queries_1.paperQueries.updateSolvedStatus(req.params.id);
        const paper = queries_1.paperQueries.getWithDetails(req.params.id);
        res.json(paper);
    }
    catch (error) {
        console.error('Error reordering pages:', error);
        res.status(500).json({ error: 'Failed to reorder pages' });
    }
});
// POST /api/papers/:id/pages/:pageId/rotate - Rotate page
router.post('/:id/pages/:pageId/rotate', (req, res) => {
    try {
        const page = queries_1.pageQueries.rotate(req.params.pageId);
        if (!page) {
            return res.status(404).json({ error: 'Page not found' });
        }
        queries_1.paperQueries.updateSolvedStatus(req.params.id);
        res.json(page);
    }
    catch (error) {
        console.error('Error rotating page:', error);
        res.status(500).json({ error: 'Failed to rotate page' });
    }
});
// DELETE /api/papers/:id/pages/:pageId - Delete page
router.delete('/:id/pages/:pageId', (req, res) => {
    try {
        const page = queries_1.pageQueries.getById(req.params.pageId);
        if (!page) {
            return res.status(404).json({ error: 'Page not found' });
        }
        const deletedIndex = page.pageIndex;
        const paperId = req.params.id;
        // Delete annotations for this page
        // (annotationQueries.deleteByPage would be called here)
        // Update questions that reference this page
        // questionQueries.updateForPageDeletion(req.params.pageId);
        // Delete the page
        queries_1.pageQueries.delete(req.params.pageId);
        // Update page indices
        queries_1.pageQueries.updateIndicesAfterDelete(paperId, deletedIndex);
        // Update paper solved status
        queries_1.paperQueries.updateSolvedStatus(paperId);
        const paper = queries_1.paperQueries.getWithDetails(paperId);
        res.json(paper);
    }
    catch (error) {
        console.error('Error deleting page:', error);
        res.status(500).json({ error: 'Failed to delete page' });
    }
});
exports.default = router;
//# sourceMappingURL=papers.js.map