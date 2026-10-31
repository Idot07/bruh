"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const multer_1 = __importDefault(require("multer"));
const path_1 = require("path");
const fs_1 = require("fs");
const subjects_1 = __importDefault(require("@/routes/subjects"));
const years_1 = __importDefault(require("@/routes/years"));
const papers_1 = __importDefault(require("@/routes/papers"));
const questions_1 = __importDefault(require("@/routes/questions"));
const annotations_1 = __importDefault(require("@/routes/annotations"));
const pdf_1 = require("@/services/pdf");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Ensure upload directories exist
(0, pdf_1.ensureUploadDirs)().catch(console.error);
// Serve uploaded files statically
const uploadsDir = (0, path_1.join)(process.cwd(), 'uploads');
if ((0, fs_1.existsSync)(uploadsDir)) {
    app.use('/uploads', express_1.default.static(uploadsDir));
}
// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
});
// API Routes
app.use('/api/subjects', subjects_1.default);
app.use('/api/subjects/:subjectId/years', years_1.default);
app.use('/api/subjects/:subjectId/years/:yearId/papers', papers_1.default);
app.use('/api/papers', papers_1.default); // For paper-level routes not scoped to year
app.use('/api/questions', questions_1.default);
app.use('/api/annotations', annotations_1.default);
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    if (err instanceof multer_1.default.MulterError) {
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
exports.default = app;
//# sourceMappingURL=index.js.map