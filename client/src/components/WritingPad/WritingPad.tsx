import { useEffect, useRef, useCallback, useState, useImperativeHandle, forwardRef } from 'react';
import { fabric } from 'fabric';
import { Annotation } from '../../types';
import './WritingPad.css';

interface WritingPadProps {
  paperId: string;
  pageId: string;
  annotations: Annotation[];
  onAnnotationsChange: (annotations: Annotation[]) => void;
  containerRef: React.RefObject<HTMLDivElement>;
}

export interface WritingPadHandle {
  undo: () => void;
  redo: () => void;
  setTool: (tool: string, color: string, strokeWidth: number) => void;
  canUndo: boolean;
  canRedo: boolean;
}

const WritingPad = forwardRef<WritingPadHandle, WritingPadProps>(
  ({ paperId, pageId, annotations, onAnnotationsChange, containerRef }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [history, setHistory] = useState<fabric.Object[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isUpdatingRef = useRef(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Initialize Fabric canvas
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      isDrawingMode: false,
      selection: true,
      preserveObjectStacking: true,
      backgroundColor: 'transparent',
    });

    fabricCanvasRef.current = canvas;

    // Set canvas size to match container
    const resizeCanvas = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      canvas.setDimensions({ width: rect.width, height: rect.height });
      canvas.renderAll();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Load existing annotations
    loadAnnotations(annotations);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.dispose();
      fabricCanvasRef.current = null;
    };
  }, [containerRef]);

  // Load annotations from server
  const loadAnnotations = useCallback((anns: Annotation[]) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    isUpdatingRef.current = true;
    canvas.clear();

    let completed = 0;
    const total = anns.length;

    if (total === 0) {
      canvas.renderAll();
      saveHistoryState();
      isUpdatingRef.current = false;
      return;
    }

    anns.forEach(ann => {
      try {
        const objects = JSON.parse(ann.data);
        fabric.util.enlivenObjects(objects, (enlivenedObjects: fabric.Object[]) => {
          enlivenedObjects.forEach((obj: fabric.Object) => {
            (obj as any).set({
              id: ann.id,
              annotationType: ann.type,
              annotationColor: ann.color,
              annotationStrokeWidth: ann.strokeWidth,
            });
            canvas.add(obj);
          });
          
          completed++;
          if (completed === total) {
            canvas.renderAll();
            saveHistoryState();
            isUpdatingRef.current = false;
          }
        }, '');
      } catch (e) {
        console.error('Failed to load annotation:', e);
        completed++;
        if (completed === total) {
          canvas.renderAll();
          saveHistoryState();
          isUpdatingRef.current = false;
        }
      }
    });
  }, []);

  // Save current canvas state to history
  const saveHistoryState = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const state = canvas.getObjects().map(obj => obj.toObject(['id', 'annotationType', 'annotationColor', 'annotationStrokeWidth'] as const));
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(state);
      if (newHistory.length > 50) newHistory.shift();
      return newHistory;
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  }, [historyIndex]);

  // Undo/Redo
  const undo = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || historyIndex <= 0) return;

    isUpdatingRef.current = true;
    canvas.clear();
    const prevState = history[historyIndex - 1];
    fabric.util.enlivenObjects(prevState, (objects: fabric.Object[]) => {
      objects.forEach(obj => canvas.add(obj));
      canvas.renderAll();
      setHistoryIndex(prev => prev - 1);
      isUpdatingRef.current = false;
      triggerSave();
    }, '');
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || historyIndex >= history.length - 1) return;

    isUpdatingRef.current = true;
    canvas.clear();
    const nextState = history[historyIndex + 1];
    fabric.util.enlivenObjects(nextState, (objects: fabric.Object[]) => {
      objects.forEach(obj => canvas.add(obj));
      canvas.renderAll();
      setHistoryIndex(prev => prev + 1);
      isUpdatingRef.current = false;
      triggerSave();
    }, '');
  }, [history, historyIndex]);

  // Trigger save to backend
  const triggerSave = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      const objects = canvas.getObjects();
      const annotationsToSave: Omit<Annotation, 'id' | 'createdAt' | 'updatedAt'>[] = objects.map(obj => {
        const objData = obj.toObject(['id', 'annotationType', 'annotationColor', 'annotationStrokeWidth'] as const);
        return {
          paperId,
          pageId,
          type: (objData as any).annotationType || 'drawing',
          data: JSON.stringify(objData),
          color: (objData as any).annotationColor || '#000000',
          strokeWidth: (objData as any).annotationStrokeWidth || 2,
        };
      });
      onAnnotationsChange(annotationsToSave as Annotation[]);
    }, 1000);
  }, [paperId, pageId, onAnnotationsChange]);

  // Handle canvas changes
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const handleObjectModified = () => {
      if (isUpdatingRef.current) return;
      saveHistoryState();
      triggerSave();
    };

    const handleObjectAdded = () => {
      if (isUpdatingRef.current) return;
      saveHistoryState();
      triggerSave();
    };

    const handleObjectRemoved = () => {
      if (isUpdatingRef.current) return;
      saveHistoryState();
      triggerSave();
    };

    canvas.on('object:modified', handleObjectModified);
    canvas.on('object:added', handleObjectAdded);
    canvas.on('object:removed', handleObjectRemoved);

    return () => {
      canvas.off('object:modified', handleObjectModified);
      canvas.off('object:added', handleObjectAdded);
      canvas.off('object:removed', handleObjectRemoved);
    };
  }, [saveHistoryState, triggerSave]);

  // Sync annotations from props
  useEffect(() => {
    if (isUpdatingRef.current) return;
    if (fabricCanvasRef.current) {
      loadAnnotations(annotations);
    }
  }, [annotations, loadAnnotations]);

  // Set drawing mode based on tool
  const setTool = useCallback((tool: string, color: string, strokeWidth: number) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    canvas.isDrawingMode = tool === 'pen' || tool === 'highlighter' || tool === 'eraser';

    if (tool === 'pen' || tool === 'highlighter') {
      const brush = new fabric.PencilBrush(canvas);
      brush.color = color;
      brush.width = strokeWidth;
      canvas.freeDrawingBrush = brush;
    } else if (tool === 'eraser') {
      // Use PencilBrush with white color for eraser effect
      const brush = new fabric.PencilBrush(canvas);
      brush.color = '#ffffff';
      brush.width = strokeWidth * 3;
      canvas.freeDrawingBrush = brush;
      canvas.isDrawingMode = true;
    } else {
      canvas.isDrawingMode = false;
    }

    canvas.renderAll();
  }, []);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    undo,
    redo,
    setTool,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
  }), [undo, redo, setTool, historyIndex, history.length]);

  return (
    <div className="writing-pad" ref={containerRef}>
      <canvas ref={canvasRef} className="writing-pad-canvas" />
    </div>
  );
});

WritingPad.displayName = 'WritingPad';

export default WritingPad;