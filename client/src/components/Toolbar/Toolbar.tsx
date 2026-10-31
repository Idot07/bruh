import './Toolbar.css';

interface ToolbarProps {
  activeTool: Tool;
  onToolChange: (tool: Tool) => void;
  color: string;
  onColorChange: (color: string) => void;
  strokeWidth: number;
  onStrokeWidthChange: (width: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export type Tool = 'pen' | 'eraser' | 'highlighter' | 'text' | 'rectangle' | 'circle' | 'arrow' | 'select';

const TOOLS: { id: Tool; label: string; icon: string; cursor: string }[] = [
  { id: 'select', label: 'Select', icon: '🖱️', cursor: 'default' },
  { id: 'pen', label: 'Pen', icon: '✏️', cursor: 'crosshair' },
  { id: 'eraser', label: 'Eraser', icon: '🧽', cursor: 'cell' },
  { id: 'highlighter', label: 'Highlighter', icon: '🖍️', cursor: 'crosshair' },
  { id: 'text', label: 'Text', icon: '📝', cursor: 'text' },
  { id: 'rectangle', label: 'Rectangle', icon: '⬜', cursor: 'crosshair' },
  { id: 'circle', label: 'Circle', icon: '⭕', cursor: 'crosshair' },
  { id: 'arrow', label: 'Arrow', icon: '➡️', cursor: 'crosshair' },
];

const PRESET_COLORS = [
  '#000000', '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981',
  '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e', '#ffffff',
];

export function Toolbar({
  activeTool,
  onToolChange,
  color,
  onColorChange,
  strokeWidth,
  onStrokeWidthChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: ToolbarProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [customColor, setCustomColor] = useState(color);

  const handleColorClick = (c: string) => {
    onColorChange(c);
    setCustomColor(c);
    setShowColorPicker(false);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const c = e.target.value;
    onColorChange(c);
    setCustomColor(c);
  };

  return (
    <div className="toolbar">
      <div className="toolbar-section">
        <span className="toolbar-label">Tools</span>
        <div className="tool-group" role="radiogroup" aria-label="Drawing tools">
          {TOOLS.map(tool => (
            <button
              key={tool.id}
              className={`tool-btn ${activeTool === tool.id ? 'active' : ''}`}
              onClick={() => onToolChange(tool.id)}
              title={tool.label}
              role="radio"
              aria-checked={activeTool === tool.id}
              style={{ cursor: tool.cursor }}
            >
              {tool.icon}
            </button>
          ))}
        </div>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-section">
        <span className="toolbar-label">Color</span>
        <div className="color-section">
          <button
            className="current-color"
            onClick={() => setShowColorPicker(!showColorPicker)}
            style={{ backgroundColor: color }}
            title="Current color"
          />
          {showColorPicker && (
            <div className="color-picker">
              <div className="preset-colors">
                {PRESET_COLORS.map(c => (
                  <button
                    key={c}
                    className={`preset-color ${color === c ? 'selected' : ''}`}
                    onClick={() => handleColorClick(c)}
                    style={{ backgroundColor: c }}
                    title={c}
                  />
                ))}
              </div>
              <div className="custom-color">
                <input
                  type="color"
                  value={customColor}
                  onChange={handleCustomColorChange}
                />
                <span>Custom</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-section">
        <span className="toolbar-label">Stroke</span>
        <input
          type="range"
          className="stroke-slider"
          min="1"
          max="10"
          value={strokeWidth}
          onChange={(e) => onStrokeWidthChange(Number(e.target.value))}
          aria-label="Stroke width"
        />
        <span className="stroke-value">{strokeWidth}px</span>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-section">
        <span className="toolbar-label">History</span>
        <div className="history-buttons">
          <button
            className="icon-btn"
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
          >
            ↶
          </button>
          <button
            className="icon-btn"
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
          >
            ↷
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';