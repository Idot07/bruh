import { useEffect, useRef, useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Page } from '../../types';
import './PaperViewer.css';

// Configure pdf.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

interface PaperViewerProps {
  paperId: string;
  pages: Page[];
  currentPageIndex: number;
  onPageChange: (index: number) => void;
  onRotationChange: (pageId: string, rotation: number) => void;
  scale: number;
  onScaleChange: (scale: number) => void;
  writingPadRef: React.RefObject<HTMLDivElement>;
}

export function PaperViewer({
  paperId,
  pages,
  currentPageIndex,
  onPageChange,
  onRotationChange,
  scale,
  onScaleChange,
  writingPadRef,
}: PaperViewerProps) {
  const pdfDocRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);
  const pageRef = useRef<pdfjsLib.PDFPageProxy | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfScale, setPdfScaleState] = useState(scale);

  // Load PDF document
  useEffect(() => {
    const loadPdf = async () => {
      try {
        setLoading(true);
        setError(null);
        const loadingTask = pdfjsLib.getDocument(`/api/papers/${paperId}/file`);
        pdfDocRef.current = await loadingTask.promise;
        await renderPage(currentPageIndex);
      } catch (err) {
        setError('Failed to load PDF');
        console.error('PDF load error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPdf();

    return () => {
      if (pdfDocRef.current) {
        pdfDocRef.current.destroy();
      }
    };
  }, [paperId]);

  // Render specific page
  const renderPage = useCallback(async (pageIndex: number) => {
    if (!pdfDocRef.current || pageIndex < 0 || pageIndex >= pages.length) return;

    try {
      setLoading(true);
      const page = await pdfDocRef.current.getPage(pageIndex + 1);
      pageRef.current = page;

      const viewport = page.getViewport({ scale: pdfScale });
      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext('2d');
      if (!context) return;

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      await page.render(renderContext).promise;

      // Update writing pad size
      if (writingPadRef.current) {
        setPdfScaleState(pdfScale);
      }
    } catch (err) {
      setError('Failed to render page');
      console.error('Page render error:', err);
    } finally {
      setLoading(false);
    }
  }, [pages.length, pdfScale, writingPadRef]);

  // Handle page change
  useEffect(() => {
    renderPage(currentPageIndex);
  }, [currentPageIndex, renderPage]);

  // Handle scale change
  useEffect(() => {
    setPdfScaleState(scale);
    renderPage(currentPageIndex);
  }, [scale, currentPageIndex, renderPage]);

  const handlePrevPage = () => {
    if (currentPageIndex > 0) {
      onPageChange(currentPageIndex - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPageIndex < pages.length - 1) {
      onPageChange(currentPageIndex + 1);
    }
  };

  const handleRotate = () => {
    const page = pages[currentPageIndex];
    if (page) {
      onRotationChange(page.id, (page.rotation + 90) % 360);
    }
  };

  const handleZoomIn = () => {
    onScaleChange(Math.min(scale + 0.25, 3));
  };

  const handleZoomOut = () => {
    onScaleChange(Math.max(scale - 0.25, 0.5));
  };

  const handleZoomReset = () => {
    onScaleChange(1);
  };

  if (error) {
    return (
      <div className="paper-viewer error">
        <p>{error}</p>
        <button onClick={() => renderPage(currentPageIndex)}>Retry</button>
      </div>
    );
  }

  const currentPage = pages[currentPageIndex];
  const displayPageNumber = currentPage ? currentPage.pageNumber : currentPageIndex + 1;

  return (
    <div className="paper-viewer" ref={containerRef}>
      <div className="viewer-toolbar">
        <div className="toolbar-left">
          <button className="icon-btn" onClick={handleZoomOut} disabled={scale <= 0.5} title="Zoom out">−</button>
          <span className="zoom-level">{Math.round(scale * 100)}%</span>
          <button className="icon-btn" onClick={handleZoomIn} disabled={scale >= 3} title="Zoom in">+</button>
          <button className="icon-btn" onClick={handleZoomReset} title="Reset zoom">⟲</button>
        </div>
        <div className="toolbar-center">
          <button className="icon-btn" onClick={handlePrevPage} disabled={currentPageIndex === 0} title="Previous page">◀</button>
          <span className="page-indicator">
            <input
              type="number"
              min="1"
              max={pages.length}
              value={displayPageNumber}
              onChange={(e) => {
                const num = parseInt(e.target.value, 10);
                if (!isNaN(num) && num >= 1 && num <= pages.length) {
                  onPageChange(num - 1);
                }
              }}
              className="page-input"
            />
            / {pages.length}
          </span>
          <button className="icon-btn" onClick={handleNextPage} disabled={currentPageIndex === pages.length - 1} title="Next page">▶</button>
        </div>
        <div className="toolbar-right">
          <button className="icon-btn" onClick={handleRotate} title="Rotate 90°">↻</button>
        </div>
      </div>

      <div className="viewer-canvas-container">
        {loading && <div className="loading-overlay">Loading page...</div>}
        <canvas
          ref={canvasRef}
          className="pdf-canvas"
          style={{
            transform: currentPage ? `rotate(${currentPage.rotation}deg)` : 'none',
            transformOrigin: 'center center',
          }}
        />
      </div>
    </div>
  );
}