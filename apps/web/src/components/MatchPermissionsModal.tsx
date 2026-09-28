'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

export interface MatchPermissionsModalProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
  gameName: string;
  isCapturing: boolean;
  onStartCapture: () => Promise<void> | void;
  notificationsGranted: boolean;
  onRequestNotifications: () => Promise<boolean>;
}

type DevicePlatform = 'windows' | 'mac' | 'android' | 'ios' | 'linux' | 'other';

export function MatchPermissionsModal({
  open,
  onClose,
  onComplete,
  gameName,
  isCapturing,
  onStartCapture,
  notificationsGranted,
  onRequestNotifications,
}: MatchPermissionsModalProps) {
  const [platform, setPlatform] = useState<DevicePlatform>('windows');
  const [requestingScreen, setRequestingScreen] = useState(false);
  const [requestingNotifs, setRequestingNotifs] = useState(false);
  const [localNotifsGranted, setLocalNotifsGranted] = useState(notificationsGranted);

  // Detect user operating system / platform
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ua = window.navigator.userAgent.toLowerCase();

    if (/iphone|ipad|ipod/.test(ua)) {
      setPlatform('ios');
    } else if (/android/.test(ua)) {
      setPlatform('android');
    } else if (/macintosh|mac os x/.test(ua)) {
      setPlatform('mac');
    } else if (/windows|win32|win64/.test(ua)) {
      setPlatform('windows');
    } else if (/linux/.test(ua)) {
      setPlatform('linux');
    } else {
      setPlatform('other');
    }
  }, []);

  useEffect(() => {
    setLocalNotifsGranted(notificationsGranted);
  }, [notificationsGranted]);

  if (!open) return null;

  const handleGrantScreen = async () => {
    try {
      setRequestingScreen(true);
      await onStartCapture();
    } catch {
      // Handled in pipeline
    } finally {
      setRequestingScreen(false);
    }
  };

  const handleGrantNotifications = async () => {
    try {
      setRequestingNotifs(true);
      const res = await onRequestNotifications();
      setLocalNotifsGranted(res);
    } catch {
      // Handled
    } finally {
      setRequestingNotifs(false);
    }
  };

  const getPlatformDetails = () => {
    switch (platform) {
      case 'windows':
        return {
          label: 'Windows PC (Desktop)',
          icon: '💻',
          screenTip: 'In the browser sharing popup, select your game window (or entire screen) so scores record automatically.',
          pushTip: 'Windows action center alerts will notify you during full-screen gameplay.',
        };
      case 'mac':
        return {
          label: 'macOS (Desktop / Safari / Chrome)',
          icon: '🍎',
          screenTip: 'Select the game window in System Screen Recording permissions if prompted.',
          pushTip: 'Notification banner alerts will ping you when your opponent joins or match finishes.',
        };
      case 'android':
        return {
          label: 'Android Mobile / Tablet',
          icon: '📱',
          screenTip: 'Allow screen cast / window sharing permission when prompted by Chrome/browser.',
          pushTip: 'System lockscreen & heads-up push notifications enabled.',
        };
      case 'ios':
        return {
          label: 'iOS / iPadOS (Safari & PWA)',
          icon: '📱',
          screenTip: 'Allow screen broadcast / share in Safari to sync match score feed.',
          pushTip: 'Web push notifications enabled for match room pings.',
        };
      default:
        return {
          label: 'Universal Browser Platform',
          icon: '🎮',
          screenTip: 'Select your game window or display to enable automated score sync and anti-cheat verification.',
          pushTip: 'Browser push notifications will keep you updated in real time.',
        };
    }
  };

  const platformInfo = getPlatformDetails();
  const screenDone = isCapturing;
  const notifsDone = localNotifsGranted;
  const allGranted = screenDone && notifsDone;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4 animate-in fade-in duration-150"
    >
      <Card className="w-full max-w-lg bg-card border-border shadow-2xl p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
              <h3 className="text-lg font-black text-foreground uppercase tracking-tight">
                Pre-Match Permissions
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Required by your device for automated verification and live match alerts.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge variant="secondary" className="font-mono text-[10px] gap-1">
              <span>{platformInfo.icon}</span>
              <span>{platformInfo.label}</span>
            </Badge>
          </div>
        </div>

        {/* Permissions Checklist */}
        <div className="space-y-4">
          {/* Permission 1: Game Feed Capture */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              screenDone
                ? 'bg-emerald-500/10 border-emerald-500/40'
                : 'bg-secondary/60 border-border hover:border-primary/40'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-base select-none">📺</span>
                  <span className="text-xs font-bold text-foreground">
                    1. Game Window Feed & Anti-Cheat
                  </span>
                  {screenDone && (
                    <Badge variant="success" className="font-mono text-[9px] py-0 px-1.5">
                      CONNECTED ✓
                    </Badge>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Streams your {gameName} HUD in the background to automatically record final scores and win conditions. Never captures personal windows.
                </p>
                <p className="text-[10px] text-primary/80 font-mono mt-1">
                  💡 {platformInfo.screenTip}
                </p>
              </div>

              <div className="flex-shrink-0">
                {screenDone ? (
                  <Button variant="outline" size="sm" disabled className="text-xs text-emerald-400 border-emerald-500/40 font-mono">
                    ✓ Connected
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    disabled={requestingScreen}
                    onClick={handleGrantScreen}
                    className="text-xs font-bold shadow-sm"
                  >
                    {requestingScreen ? 'Selecting...' : 'Grant Feed'}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Permission 2: Push Notifications */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              notifsDone
                ? 'bg-emerald-500/10 border-emerald-500/40'
                : 'bg-secondary/60 border-border hover:border-primary/40'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-base select-none">🔔</span>
                  <span className="text-xs font-bold text-foreground">
                    2. Device Push & Audio Alerts
                  </span>
                  {notifsDone && (
                    <Badge variant="success" className="font-mono text-[9px] py-0 px-1.5">
                      ACTIVE ✓
                    </Badge>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Pings you with audio and system alerts when your opponent accepts, matches start, or prize money is deposited to your wallet.
                </p>
                <p className="text-[10px] text-primary/80 font-mono mt-1">
                  💡 {platformInfo.pushTip}
                </p>
              </div>

              <div className="flex-shrink-0">
                {notifsDone ? (
                  <Button variant="outline" size="sm" disabled className="text-xs text-emerald-400 border-emerald-500/40 font-mono">
                    ✓ Active
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    disabled={requestingNotifs}
                    onClick={handleGrantNotifications}
                    className="text-xs font-bold shadow-sm"
                  >
                    {requestingNotifs ? 'Enabling...' : 'Enable Alerts'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer / Completion */}
        <div className="pt-2 border-t border-border flex items-center justify-between gap-3">
          <div className="text-[11px] text-muted-foreground font-mono">
            {allGranted ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span>✓</span> Both permissions verified
              </span>
            ) : (
              <span>
                {screenDone ? 1 : 0} of 2 permissions granted
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
              Later
            </Button>
            <Button
              variant={allGranted ? 'default' : 'secondary'}
              size="sm"
              disabled={!screenDone}
              onClick={() => {
                onComplete();
                onClose();
              }}
              className="text-xs font-bold gap-1"
            >
              <span>{allGranted ? 'Ready to Duel →' : 'Continue with Feed →'}</span>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
