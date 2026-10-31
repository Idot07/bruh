"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureUploadDirs = ensureUploadDirs;
exports.processPdf = processPdf;
exports.generateThumbnail = generateThumbnail;
exports.getPaperPath = getPaperPath;
exports.getThumbnailPath = getThumbnailPath;
exports.savePdf = savePdf;
exports.deletePdf = deletePdf;
const pdf_lib_1 = require("pdf-lib");
const promises_1 = require("fs/promises");
const path_1 = require("path");
const fs_1 = require("fs");
const UPLOADS_DIR = (0, path_1.join)(process.cwd(), 'uploads');
const PAPERS_DIR = (0, path_1.join)(UPLOADS_DIR, 'papers');
const THUMBNAILS_DIR = (0, path_1.join)(UPLOADS_DIR, 'thumbnails');
async function ensureUploadDirs() {
    if (!(0, fs_1.existsSync)(PAPERS_DIR)) {
        await (0, promises_1.mkdir)(PAPERS_DIR, { recursive: true });
    }
    if (!(0, fs_1.existsSync)(THUMBNAILS_DIR)) {
        await (0, promises_1.mkdir)(THUMBNAILS_DIR, { recursive: true });
    }
}
async function processPdf(filePath) {
    const pdfBytes = await (0, promises_1.readFile)(filePath);
    const pdfDoc = await pdf_lib_1.PDFDocument.load(pdfBytes);
    const totalPages = pdfDoc.getPageCount();
    const pages = Array.from({ length: totalPages }, (_, i) => ({
        pageNumber: i + 1
    }));
    return { totalPages, pages };
}
async function generateThumbnail(pdfPath, outputPath) {
    // Use pdfjs-dist in Node to render first page
    // This is a placeholder - in production you'd use a headless browser or pdf.js worker
    // For now, we'll create a simple placeholder
    const { PDFDocument } = await import('pdf-lib');
    const pdfBytes = await (0, promises_1.readFile)(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const firstPage = pdfDoc.getPage(0);
    // Create a simple thumbnail by scaling down
    // Note: pdf-lib doesn't render to image, so this is a placeholder
    // In production, you'd use pdfjs-dist with a canvas or a headless browser
    const placeholder = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
    await (0, promises_1.writeFile)(outputPath, placeholder);
}
function getPaperPath(paperId) {
    return (0, path_1.join)(PAPERS_DIR, `${paperId}.pdf`);
}
function getThumbnailPath(paperId) {
    return (0, path_1.join)(THUMBNAILS_DIR, `${paperId}.png`);
}
async function savePdf(paperId, fileBuffer) {
    await ensureUploadDirs();
    const filePath = getPaperPath(paperId);
    await (0, promises_1.writeFile)(filePath, fileBuffer);
    return filePath;
}
async function deletePdf(paperId) {
    const { unlink } = await import('fs/promises');
    const paperPath = getPaperPath(paperId);
    const thumbPath = getThumbnailPath(paperId);
    try {
        await unlink(paperPath);
    }
    catch { }
    try {
        await unlink(thumbPath);
    }
    catch { }
}
//# sourceMappingURL=pdf.js.map