'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CalibrationTool } from '../../../components/CalibrationTool';
import { apiClient } from '../../../lib/api';
import { autoAnalyzeScreenshots, type AutoCalibrateResult } from '../../../lib/autoCalibrate';
import type { GameType, Platform, ROI } from '@antigravity/core';

const AVAILABLE_PLATFORMS: { value: Platform; label: string; icon: string }[] = [
  { value: 'PC', label: 'PC', icon: '💻' },
  { value: 'CONSOLE', label: 'Console', icon: '🎮' },
  { value: 'MOBILE', label: 'Mobile', icon: '📱' },
  { value: 'WEB', label: 'Web / Browser', icon: '🌐' },
  { value: 'PHYSICAL', label: 'Physical Whiteboard', icon: '🎲' },
];

interface UploadedImage {
  id: string;
  name: string;
  url: string;
}

function NewGameProfileForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAdminMode = searchParams.get('mode') === 'admin';

  // Step 1: Identification & Multi-Platform
  const [displayName, setDisplayName] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(['PC']);

  // Step 2: Reference Images
  const [referenceImages, setReferenceImages] = useState<UploadedImage[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [autoAnalysisMessage, setAutoAnalysisMessage] = useState<string | null>(null);

  // Step 3: Game Parameters (Autofilled & Editable)
  const [gameType, setGameType] = useState<GameType>('HIGH_SCORE');
  const [endKeywords, setEndKeywords] = useState('Game Over, Victory, Defeat, Final Score');
  const [regexPattern, setRegexPattern] = useState('([0-9][0-9,\\.]*)');
  const [roi, setRoi] = useState<ROI>({ x: 0.65, y: 0.05, w: 0.3, h: 0.08 });
  const [autoApprove, setAutoApprove] = useState(isAdminMode);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Toggle platform selection (multi-select)
  const togglePlatform = (p: Platform) => {
    setSelectedPlatforms((prev) => {
      if (prev.includes(p)) {
        if (prev.length === 1) return prev; // At least one platform required
        return prev.filter((item) => item !== p);
      } else {
        return [...prev, p];
      }
    });
  };

  // Handle screenshot file uploads (multiple files)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newImages: UploadedImage[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file) continue;
      const dataUrl = await readFileAsDataUrl(file);
      newImages.push({
        id: `${Date.now()}-${i}`,
        name: file.name,
        url: dataUrl,
      });
    }

    const updated = [...referenceImages, ...newImages];
    setReferenceImages(updated);

    // Automatically run AI analysis on the uploaded images
    runAutoAnalysis(updated.map((img) => img.url));
  };

  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = referenceImages.filter((img) => img.id !== id);
    setReferenceImages(updated);
    if (activeImageIndex >= updated.length) {
      setActiveImageIndex(Math.max(0, updated.length - 1));
    }
  };

  // Run auto-analysis across reference images
  const runAutoAnalysis = async (urls: string[]) => {
    if (urls.length === 0) return;
    setAnalyzing(true);
    setAutoAnalysisMessage(null);
    setError(null);

    try {
      const result: AutoCalibrateResult = await autoAnalyzeScreenshots(urls);

      // Autofill fields
      setGameType(result.detectedGameType);
      setEndKeywords(result.detectedEndKeywords.join(', '));
      setRegexPattern(result.detectedRegexPattern);
      setRoi(result.detectedRoi);

      setAutoAnalysisMessage(
        `✅ Analysis Complete (${result.confidence}% confidence): Auto-detected ${result.detectedGameType} format, ${result.detectedEndKeywords.length} end trigger keywords, and calibrated score bounding box. You can adjust any values below.`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setAutoAnalysisMessage(`⚠️ Auto-scan note: ${msg} Default templates loaded.`);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError('Please provide a game title.');
      return;
    }
    if (selectedPlatforms.length === 0) {
      setError('Please select at least one platform.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const primaryPlatform = selectedPlatforms[0];
      const keywordsArray = endKeywords
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean);

      const created = await apiClient<{ id: string }>('/games', {
        method: 'POST',
        body: JSON.stringify({
          displayName: displayName.trim(),
          gameType,
          platform: primaryPlatform,
          roi,
          constraints: {
            platforms: selectedPlatforms,
          },
          endKeywords: keywordsArray,
          regexPattern: regexPattern.trim() ? regexPattern.trim() : null,
        }),
      });

      // If admin auto-approve is checked, approve immediately
      if (autoApprove && created?.id) {
        try {
          await apiClient(`/games/${created.id}/approve`, { method: 'POST' });
        } catch {
          // Non-blocking if current user is not full admin
        }
      }

      alert('Game profile registered successfully!');
      router.push('/games');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      setLoading(false);
    }
  };

  const activeImage = referenceImages[activeImageIndex]?.url || null;

  return (
    <div className="max-w-3xl mx-auto my-6 p-4 sm:p-8 bg-surface-elevated border border-surface-border rounded-xl text-white shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-6 border-b border-surface-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Calibrate & Register Game Profile
            </h1>
            <span className="px-2 py-0.5 bg-accent/20 text-accent font-bold text-[10px] rounded uppercase tracking-wide">
              ⚡ Smart Auto-Fill
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Register game details, upload screenshots for automated detection, and fine-tune OCR boundaries.
          </p>
        </div>

        <Link
          href="/admin/profiles"
          className="text-xs text-gray-400 hover:text-white transition underline underline-offset-4 self-start sm:self-auto"
        >
          View Admin Queue →
        </Link>
      </div>

      {error && (
        <div className="mt-6 p-3 bg-red-950/60 border border-red-800 rounded text-xs text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-6">
        {/* Step 1: Game Title */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5">
            1. Game Display Title <span className="text-accent">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Rocket League, Subway Surfers, Tekken 8"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-3 py-2.5 bg-surface border border-surface-border rounded-md text-sm text-white focus:outline-none focus:border-accent transition"
          />
        </div>

        {/* Step 2: Platforms (Allowing more than one selection) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-gray-300">
              2. Supported Platforms (Select one or more) <span className="text-accent">*</span>
            </label>
            <span className="text-[11px] text-gray-400">
              {selectedPlatforms.length} platform{selectedPlatforms.length > 1 ? 's' : ''} selected
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {AVAILABLE_PLATFORMS.map((p) => {
              const isSelected = selectedPlatforms.includes(p.value);
              return (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => togglePlatform(p.value)}
                  className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                    isSelected
                      ? 'bg-accent/20 border-accent text-white shadow-[0_0_10px_rgba(139,92,246,0.3)]'
                      : 'bg-surface border-surface-border text-gray-400 hover:border-gray-500 hover:text-gray-200'
                  }`}
                >
                  <span>{p.icon}</span>
                  <span>{p.label}</span>
                  {isSelected && <span className="text-accent ml-1 font-bold">✓</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 3: Reference Screenshots & Auto-Fill */}
        <div className="p-4 bg-surface rounded-lg border border-surface-border flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-accent flex items-center gap-1.5">
                <span>📸</span>
                <span>Reference Screenshots for Auto-Fill</span>
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Upload multiple screenshots (in-game HUD, victory screen, game over, or score board).
              </p>
            </div>

            {referenceImages.length > 0 && (
              <button
                type="button"
                onClick={() => runAutoAnalysis(referenceImages.map((i) => i.url))}
                disabled={analyzing}
                className="px-3 py-1.5 bg-accent hover:bg-accent-600 font-bold text-xs rounded transition flex items-center gap-1.5 self-start sm:self-auto"
              >
                <span>{analyzing ? '⏳ Analyzing...' : '⚡ Re-run Auto-Detection'}</span>
              </button>
            )}
          </div>

          {/* Upload Input Box */}
          <label className="border-2 border-dashed border-surface-border hover:border-accent/60 rounded-lg p-5 flex flex-col items-center justify-center cursor-pointer transition bg-surface-elevated/40 hover:bg-surface-elevated text-center">
            <span className="text-2xl mb-1">🖼️</span>
            <span className="text-xs font-semibold text-gray-200">
              Click to browse or drop screenshots here
            </span>
            <span className="text-[11px] text-gray-500 mt-1">
              Supports PNG, JPG, WebP. You can select multiple images at once.
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {/* Uploaded Thumbnails Carousel / Selector */}
          {referenceImages.length > 0 && (
            <div className="flex flex-col gap-2 mt-1">
              <span className="text-[11px] text-gray-400 font-semibold">
                Uploaded Screenshots ({referenceImages.length}) — Click thumbnail to display in calibration tool:
              </span>
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {referenceImages.map((img, idx) => (
                  <div
                    key={img.id}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-24 h-16 rounded-md overflow-hidden flex-shrink-0 cursor-pointer border-2 transition ${
                      activeImageIndex === idx ? 'border-accent shadow-md scale-105' : 'border-surface-border opacity-70 hover:opacity-100'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={(e) => removeImage(img.id, e)}
                      className="absolute top-0.5 right-0.5 bg-black/80 hover:bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] transition"
                      title="Remove image"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analysis Feedback Banner */}
          {analyzing && (
            <div className="p-3 bg-accent/15 border border-accent/40 rounded text-xs text-accent flex items-center gap-2">
              <span className="animate-spin text-base">⏳</span>
              <span>Scanning screenshots with client-side OCR and calculating optimal score bounding boxes...</span>
            </div>
          )}

          {autoAnalysisMessage && !analyzing && (
            <div className="p-3 bg-green-950/60 border border-green-800 rounded text-xs text-green-300">
              {autoAnalysisMessage}
            </div>
          )}
        </div>

        {/* Step 4: Autofilled & Fully Adjustable Fields */}
        <div className="flex flex-col gap-5 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-200">
              Game Engine & OCR Verification Rules (Adjust anytime)
            </h2>
            <span className="text-[11px] text-gray-400">All fields editable</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Engine Game Type
              </label>
              <select
                value={gameType}
                onChange={(e) => setGameType(e.target.value as GameType)}
                className="w-full px-3 py-2 bg-surface border border-surface-border rounded-md text-sm text-white focus:outline-none focus:border-accent"
              >
                <option value="HIGH_SCORE">HIGH_SCORE (Highest score wins)</option>
                <option value="LOW_TIME">LOW_TIME (Fastest duration wins)</option>
                <option value="SURVIVAL">SURVIVAL (Longest duration wins)</option>
                <option value="HEAD_TO_HEAD">HEAD_TO_HEAD (Both on screen)</option>
                <option value="BINARY_RESULT">BINARY_RESULT (Win / Loss detected)</option>
                <option value="COMPOSITE_STAT">COMPOSITE_STAT (Weighted formula)</option>
                <option value="PROGRESSION">PROGRESSION (Ranks + value)</option>
                <option value="PHYSICAL">PHYSICAL (Stable whiteboard reads)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Custom Regex Extraction Pattern (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. ([0-9][0-9,\.]*)"
                value={regexPattern}
                onChange={(e) => setRegexPattern(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-surface-border rounded-md text-sm text-white font-mono focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              End Match Detection Keywords (Comma-separated)
            </label>
            <input
              type="text"
              placeholder="Game Over, Victory, Defeat, Final Score"
              value={endKeywords}
              onChange={(e) => setEndKeywords(e.target.value)}
              className="w-full px-3 py-2 bg-surface border border-surface-border rounded-md text-sm text-white focus:outline-none focus:border-accent"
            />
            <p className="text-[11px] text-gray-500 mt-1">
              Trigger keywords that notify the engine that gameplay has concluded.
            </p>
          </div>

          {/* Calibration ROI Drag Tool with Real Screenshot Background */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Bounding Box Calibration (ROI)
            </label>
            <CalibrationTool
              initialRoi={roi}
              imageUrl={activeImage}
              onChange={(newRoi) => setRoi(newRoi)}
            />
          </div>
        </div>

        {/* Admin Auto-Approve Option */}
        {isAdminMode && (
          <div className="p-3 bg-accent/10 border border-accent/30 rounded-lg flex items-center gap-3">
            <input
              type="checkbox"
              id="autoApprove"
              checked={autoApprove}
              onChange={(e) => setAutoApprove(e.target.checked)}
              className="w-4 h-4 rounded text-accent focus:ring-accent"
            />
            <label htmlFor="autoApprove" className="text-xs text-gray-200 cursor-pointer">
              <span className="font-bold text-white">Direct Admin Approval:</span> Automatically approve and mark as official upon saving.
            </label>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || analyzing}
          className="mt-2 w-full py-3 bg-accent hover:bg-accent-600 font-bold text-sm rounded-lg transition shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <span>{loading ? 'Registering...' : 'Save & Register Game Profile'}</span>
          <span>→</span>
        </button>
      </form>
    </div>
  );
}

export default function NewGameProfilePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-gray-400">Loading Game Calibrator...</div>}>
      <NewGameProfileForm />
    </Suspense>
  );
}
