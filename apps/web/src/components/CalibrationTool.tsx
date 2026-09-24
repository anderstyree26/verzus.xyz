'use client';

import { useState, useRef, MouseEvent, useEffect } from 'react';
import type { ROI } from '@antigravity/core';
import { testOcrOnRoi } from '../lib/autoCalibrate';

interface CalibrationToolProps {
  initialRoi?: ROI;
  imageUrl?: string | null;
  onSave?: (roi: ROI) => void;
  onChange?: (roi: ROI) => void;
}

export function CalibrationTool({
  initialRoi = { x: 0.1, y: 0.1, w: 0.3, h: 0.2 },
  imageUrl = null,
  onSave,
  onChange,
}: CalibrationToolProps) {
  const [roi, setRoi] = useState<ROI>(initialRoi);
  const [isDrawing, setIsDrawing] = useState(false);
  const [testResult, setTestResult] = useState<{ text: string; confidence: number } | null>(null);
  const [testing, setTesting] = useState(false);
  const startPos = useRef<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Sync state if initialRoi updates from parent auto-fill
  useEffect(() => {
    setRoi(initialRoi);
  }, [initialRoi.x, initialRoi.y, initialRoi.w, initialRoi.h]);

  const updateRoi = (newRoi: ROI) => {
    setRoi(newRoi);
    setTestResult(null);
    onChange?.(newRoi);
  };

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    startPos.current = { x, y };
    setIsDrawing(true);
    updateRoi({ x, y, w: 0.05, h: 0.05 });
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !startPos.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const currentX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const currentY = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    const x = Math.min(startPos.current.x, currentX);
    const y = Math.min(startPos.current.y, currentY);
    const w = Math.max(0.04, Math.abs(currentX - startPos.current.x));
    const h = Math.max(0.03, Math.abs(currentY - startPos.current.y));

    updateRoi({
      x: Number(x.toFixed(4)),
      y: Number(y.toFixed(4)),
      w: Number(w.toFixed(4)),
      h: Number(h.toFixed(4)),
    });
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const applyPreset = (preset: ROI) => {
    updateRoi(preset);
  };

  const handleTestOcr = async () => {
    if (!imageUrl) {
      alert('Please upload a reference screenshot first to test OCR.');
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const res = await testOcrOnRoi(imageUrl, roi);
      setTestResult(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`OCR Test failed: ${msg}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-surface-elevated border border-surface-border rounded-lg text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold flex items-center gap-2">
            <span>🎯 Screen Calibration Tool (ROI)</span>
            {imageUrl && (
              <span className="px-2 py-0.5 bg-green-500/20 text-green-400 font-semibold text-[10px] rounded">
                Screenshot Loaded
              </span>
            )}
          </h3>
          <p className="text-xs text-gray-400">
            Drag to draw the score capture box directly over the gameplay screen.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {imageUrl && (
            <button
              type="button"
              onClick={handleTestOcr}
              disabled={testing}
              className="px-3 py-1.5 bg-surface hover:bg-surface-border border border-surface-border font-bold text-xs rounded transition flex items-center gap-1.5 text-accent"
            >
              <span>{testing ? '⏳ Reading...' : '🧪 Test OCR on ROI'}</span>
            </button>
          )}

          {onSave && (
            <button
              type="button"
              onClick={() => onSave(roi)}
              className="px-3 py-1.5 bg-accent hover:bg-accent-600 font-bold text-xs rounded transition"
            >
              Save Calibration
            </button>
          )}
        </div>
      </div>

      {/* Preset Quick Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] text-gray-400 font-semibold">Quick Presets:</span>
        <button
          type="button"
          onClick={() => applyPreset({ x: 0.65, y: 0.04, w: 0.3, h: 0.08 })}
          className="px-2 py-1 bg-surface hover:bg-surface-border border border-surface-border text-[11px] rounded transition"
        >
          📌 Top-Right (Score)
        </button>
        <button
          type="button"
          onClick={() => applyPreset({ x: 0.05, y: 0.04, w: 0.28, h: 0.08 })}
          className="px-2 py-1 bg-surface hover:bg-surface-border border border-surface-border text-[11px] rounded transition"
        >
          ⏱️ Top-Left (Timer)
        </button>
        <button
          type="button"
          onClick={() => applyPreset({ x: 0.15, y: 0.35, w: 0.7, h: 0.2 })}
          className="px-2 py-1 bg-surface hover:bg-surface-border border border-surface-border text-[11px] rounded transition"
        >
          🏆 Center (Victory Banner)
        </button>
        <button
          type="button"
          onClick={() => applyPreset({ x: 0.3, y: 0.85, w: 0.4, h: 0.1 })}
          className="px-2 py-1 bg-surface hover:bg-surface-border border border-surface-border text-[11px] rounded transition"
        >
          📊 Bottom (HUD)
        </button>
      </div>

      {/* Interactive Canvas Container */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="relative w-full h-80 sm:h-96 bg-black/80 rounded-lg overflow-hidden cursor-crosshair border border-dashed border-gray-600 select-none flex items-center justify-center shadow-inner"
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt="Reference screenshot for calibration"
            className="w-full h-full object-contain pointer-events-none"
          />
        ) : (
          <div className="text-gray-500 pointer-events-none text-center p-4">
            <span className="text-3xl block mb-2">📸</span>
            <p className="text-sm font-semibold text-gray-400">Interactive Preview Canvas</p>
            <p className="text-xs mt-1 text-gray-500">
              Upload reference screenshots above to see your real game HUD here, or drag to calibrate ROI.
            </p>
          </div>
        )}

        {/* Bounding Box overlay */}
        <div
          className="absolute border-2 border-accent bg-accent/25 pointer-events-none transition-all duration-75 shadow-[0_0_15px_rgba(139,92,246,0.5)]"
          style={{
            left: `${roi.x * 100}%`,
            top: `${roi.y * 100}%`,
            width: `${roi.w * 100}%`,
            height: `${roi.h * 100}%`,
          }}
        >
          <div className="absolute top-1 left-1 bg-black/90 px-1.5 py-0.5 rounded text-[10px] text-accent font-mono border border-accent/40 shadow">
            ROI: {(roi.w * 100).toFixed(1)}% × {(roi.h * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Test OCR Live Result Banner */}
      {testResult && (
        <div className="p-3 bg-surface border border-accent/40 rounded-lg flex items-center justify-between text-xs">
          <div>
            <span className="text-gray-400">Live Read inside Box: </span>
            <span className="font-mono font-bold text-white text-sm">
              {testResult.text ? `"${testResult.text}"` : '<No readable text found>'}
            </span>
          </div>
          <span className="px-2 py-0.5 bg-accent/20 text-accent font-mono font-bold rounded">
            {testResult.confidence}% confidence
          </span>
        </div>
      )}

      {/* Numerical Coordinate Inputs / Display */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
        <div className="p-2 bg-surface rounded border border-surface-border">
          <span className="text-gray-400 block text-[10px]">X OFFSET</span>
          <span className="font-bold text-white">{(roi.x * 100).toFixed(2)}%</span>
        </div>
        <div className="p-2 bg-surface rounded border border-surface-border">
          <span className="text-gray-400 block text-[10px]">Y OFFSET</span>
          <span className="font-bold text-white">{(roi.y * 100).toFixed(2)}%</span>
        </div>
        <div className="p-2 bg-surface rounded border border-surface-border">
          <span className="text-gray-400 block text-[10px]">WIDTH</span>
          <span className="font-bold text-white">{(roi.w * 100).toFixed(2)}%</span>
        </div>
        <div className="p-2 bg-surface rounded border border-surface-border">
          <span className="text-gray-400 block text-[10px]">HEIGHT</span>
          <span className="font-bold text-white">{(roi.h * 100).toFixed(2)}%</span>
        </div>
      </div>
    </div>
  );
}
