import { PDFDocument } from 'pdf-lib';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const UPLOADS_DIR = join(process.cwd(), 'uploads');
const PAPERS_DIR = join(UPLOADS_DIR, 'papers');
const THUMBNAILS_DIR = join(UPLOADS_DIR, 'thumbnails');

export async function ensureUploadDirs() {
  if (!existsSync(PAPERS_DIR)) {
    await mkdir(PAPERS_DIR, { recursive: true });
  }
  if (!existsSync(THUMBNAILS_DIR)) {
    await mkdir(THUMBNAILS_DIR, { recursive: true });
  }
}

export interface PaperInfo {
  totalPages: number;
  pages: { pageNumber: number }[];
}

export async function processPdf(filePath: string): Promise<PaperInfo> {
  const pdfBytes = await readFile(filePath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const totalPages = pdfDoc.getPageCount();
  
  const pages = Array.from({ length: totalPages }, (_, i) => ({
    pageNumber: i + 1
  }));
  
  return { totalPages, pages };
}

export async function generateThumbnail(pdfPath: string, outputPath: string): Promise<void> {
  // Use pdfjs-dist in Node to render first page
  // This is a placeholder - in production you'd use a headless browser or pdf.js worker
  // For now, we'll create a simple placeholder
  const { PDFDocument } = await import('pdf-lib');
  const pdfBytes = await readFile(pdfPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const firstPage = pdfDoc.getPage(0);
  
  // Create a simple thumbnail by scaling down
  // Note: pdf-lib doesn't render to image, so this is a placeholder
  // In production, you'd use pdfjs-dist with a canvas or a headless browser
  const placeholder = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
  await writeFile(outputPath, placeholder);
}

export function getPaperPath(paperId: string): string {
  return join(PAPERS_DIR, `${paperId}.pdf`);
}

export function getThumbnailPath(paperId: string): string {
  return join(THUMBNAILS_DIR, `${paperId}.png`);
}

export async function savePdf(paperId: string, fileBuffer: Buffer): Promise<string> {
  await ensureUploadDirs();
  const filePath = getPaperPath(paperId);
  await writeFile(filePath, fileBuffer);
  return filePath;
}

export async function deletePdf(paperId: string): Promise<void> {
  const { unlink } = await import('fs/promises');
  const paperPath = getPaperPath(paperId);
  const thumbPath = getThumbnailPath(paperId);
  
  try { await unlink(paperPath); } catch {}
  try { await unlink(thumbPath); } catch {}
}