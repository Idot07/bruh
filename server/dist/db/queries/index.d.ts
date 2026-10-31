import { Subject, Year, Paper, Page, Question, Annotation, SubjectWithYears, YearWithPapers, PaperWithDetails } from '@/types';
export declare function generateId(): string;
export declare function now(): number;
export declare const subjectQueries: {
    getAll: () => (Subject & {
        yearCount: number;
    })[];
    getById: (id: string) => Subject | undefined;
    create: (subject: Omit<Subject, "id" | "createdAt" | "updatedAt">) => Subject;
    update: (id: string, updates: Partial<Omit<Subject, "id" | "createdAt">>) => Subject | undefined;
    delete: (id: string) => boolean;
    getWithYears: () => SubjectWithYears[];
};
export declare const yearQueries: {
    getBySubject: (subjectId: string) => Year[];
    getById: (id: string) => Year | undefined;
    create: (year: Omit<Year, "id" | "createdAt" | "updatedAt">) => Year;
    update: (id: string, updates: Partial<Omit<Year, "id" | "createdAt">>) => Year | undefined;
    delete: (id: string) => boolean;
    getWithPapers: (subjectId: string) => YearWithPapers[];
};
export declare const paperQueries: {
    getBySubjectYear: (subjectYearId: string, filters?: {
        status?: string;
        tags?: string[];
        search?: string;
    }) => Paper[];
    getById: (id: string) => Paper | undefined;
    getWithDetails: (id: string) => PaperWithDetails | undefined;
    create: (paper: Omit<Paper, "id" | "uploadDate" | "solvedStatus" | "tags"> & {
        tags?: string[];
    }) => Paper;
    update: (id: string, updates: Partial<Omit<Paper, "id" | "subjectYearId" | "filename" | "originalName" | "uploadDate" | "totalPages">>) => Paper | undefined;
    delete: (id: string) => boolean;
    updateSolvedStatus: (id: string) => Paper | undefined;
};
export declare const pageQueries: {
    getByPaper: (paperId: string) => Page[];
    getById: (id: string) => Page | undefined;
    create: (page: Omit<Page, "id">) => Page;
    createMany: (pages: Omit<Page, "id">[]) => Page[];
    update: (id: string, updates: Partial<Omit<Page, "id" | "paperId">>) => Page | undefined;
    reorder: (pageIds: string[]) => void;
    rotate: (id: string) => Page | undefined;
    delete: (id: string) => boolean;
    updateIndicesAfterDelete: (paperId: string, deletedIndex: number) => void;
};
export declare const questionQueries: {
    getByPaper: (paperId: string) => Question[];
    getById: (id: string) => Question | undefined;
    create: (question: Omit<Question, "id">) => Question;
    update: (id: string, updates: Partial<Omit<Question, "id" | "paperId">>) => Question | undefined;
    delete: (id: string) => boolean;
    updateForPageDeletion: (deletedPageId: string) => void;
};
export declare const annotationQueries: {
    getByPaper: (paperId: string, pageId?: string, questionId?: string) => Annotation[];
    getByPage: (pageId: string) => Annotation[];
    getById: (id: string) => Annotation | undefined;
    create: (annotation: Omit<Annotation, "id" | "createdAt" | "updatedAt">) => Annotation;
    batchUpsert: (annotations: Omit<Annotation, "id" | "createdAt" | "updatedAt">[]) => Annotation[];
    update: (id: string, updates: Partial<Omit<Annotation, "id" | "paperId" | "pageId" | "questionId" | "type" | "createdAt">>) => Annotation | undefined;
    delete: (id: string) => boolean;
    deleteByPage: (pageId: string) => void;
};
//# sourceMappingURL=index.d.ts.map