'use client';

import { useState, useRef, MouseEvent } from 'react';
import type { ROI } from '@antigravity/core';

interface CalibrationToolProps {
  initialRoi?: ROI;
  onSave: (roi: ROI) => void;
}

export function CalibrationTool({
  initialRoi = { x: 0.1, y: 0.1, w: 0.3, h: 0.2 },
  onSave,
}: CalibrationToolProps) {
  const [roi, setRoi] = useState<ROI>(initialRoi);
  const [isDrawing, setIsDrawing] = useState(false);
  const startPos = useRef<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    startPos.current = { x, y };
    setIsDrawing(true);
    setRoi({ x, y, w: 0.05, h: 0.05 });
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !startPos.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const currentX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const currentY = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    const x = Math.min(startPos.current.x, currentX);
    const y = Math.min(startPos.current.y, currentY);
    const w = Math.abs(currentX - startPos.current.x);
    const h = Math.abs(currentY - startPos.current.y);

    setRoi({ x, y, w, h });
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-surface-elevated border border-surface-border rounded-lg text-white">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">Screen Calibration Tool</h3>
          <p className="text-sm text-gray-400">
            Click and drag over the screen preview to define the OCR capture bounding box (ROI).
          </p>
        </div>
        <button
          onClick={() => onSave(roi)}
          className="px-4 py-2 bg-accent hover:bg-accent-600 font-semibold rounded-md transition"
        >
          Save Calibration
        </button>
      </div>

      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="relative w-full h-80 bg-black/60 rounded-md overflow-hidden cursor-crosshair border border-dashed border-gray-600 select-none flex items-center justify-center"
      >
        <div className="text-gray-500 pointer-events-none text-center">
          <p className="text-sm">Interactive Capture Preview Area</p>
          <p className="text-xs mt-1">Drag to adjust target coordinates</p>
        </div>

        {/* Bounding Box overlay */}
        <div
          className="absolute border-2 border-accent bg-accent/20 pointer-events-none transition-all duration-75"
          style={{
            left: `${roi.x * 100}%`,
            top: `${roi.y * 100}%`,
            width: `${roi.w * 100}%`,
            height: `${roi.h * 100}%`,
          }}
        >
          <div className="absolute top-1 left-1 bg-black/80 px-1.5 py-0.5 rounded text-[10px] text-accent font-mono">
            ROI: {(roi.w * 100).toFixed(1)}% × {(roi.h * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 text-xs font-mono text-gray-400">
        <div>X: {(roi.x * 100).toFixed(2)}%</div>
        <div>Y: {(roi.y * 100).toFixed(2)}%</div>
        <div>W: {(roi.w * 100).toFixed(2)}%</div>
        <div>H: {(roi.h * 100).toFixed(2)}%</div>
      </div>
    </div>
  );
}
