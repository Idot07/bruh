export declare function ensureUploadDirs(): Promise<void>;
export interface PaperInfo {
    totalPages: number;
    pages: {
        pageNumber: number;
    }[];
}
export declare function processPdf(filePath: string): Promise<PaperInfo>;
export declare function generateThumbnail(pdfPath: string, outputPath: string): Promise<void>;
export declare function getPaperPath(paperId: string): string;
export declare function getThumbnailPath(paperId: string): string;
export declare function savePdf(paperId: string, fileBuffer: Buffer): Promise<string>;
export declare function deletePdf(paperId: string): Promise<void>;
//# sourceMappingURL=pdf.d.ts.map