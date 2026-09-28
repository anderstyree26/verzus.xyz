'use client';

import { useState } from 'react';
import {
  SUPPORTED_COUNTRY_LIST,
  getPaymentProfileForCountry,
  type PaymentRail,
} from '../lib/paymentMethods';
import { notifyUser } from '../lib/notifications';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface CashierModalProps {
  open: boolean;
  onClose: () => void;
  initialMode?: 'deposit' | 'withdraw';
  countryCode?: string;
  userBalanceEur?: number;
  onSuccess?: () => void;
}

export function CashierModal({
  open,
  onClose,
  initialMode = 'deposit',
  countryCode = 'DE',
  userBalanceEur = 0,
  onSuccess,
}: CashierModalProps) {
  const [mode, setMode] = useState<'deposit' | 'withdraw'>(initialMode);
  const [selectedCountry, setSelectedCountry] = useState<string>(countryCode);
  const [selectedRailId, setSelectedRailId] = useState<string>('');
  const [customAmount, setCustomAmount] = useState<string>('25');
  const [accountDetails, setAccountDetails] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!open) return null;

  const profile = getPaymentProfileForCountry(selectedCountry);
  const availableRails = mode === 'deposit' ? profile.depositRails : profile.withdrawalRails;
  const activeRail = availableRails.find((r) => r.id === selectedRailId) || availableRails[0];

  const presetAmounts = mode === 'deposit'
    ? ['10', '25', '50', '100', '250']
    : ['20', '50', '100', '250', '500'];

  const handleAction = async () => {
    const numAmount = parseFloat(customAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      notifyUser('Invalid Amount', { body: 'Please enter a valid numeric amount.', type: 'error' });
      return;
    }

    if (mode === 'withdraw' && numAmount > userBalanceEur && profile.currency === 'EUR') {
      notifyUser('Insufficient Balance', {
        body: `Your available ledger cash is €${userBalanceEur.toFixed(2)}.`,
        type: 'error',
      });
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      const actionName = mode === 'deposit' ? 'Deposit' : 'Withdrawal';
      const railTitle = activeRail?.name || 'Instant Banking Rail';
      notifyUser(`${actionName} Initiated via ${railTitle}`, {
        body: `${profile.currencySymbol}${customAmount} ${actionName.toLowerCase()} request submitted. Zero fees applied.`,
        sound: 'score',
        type: 'success',
      });
      if (onSuccess) onSuccess();
      onClose();
    }, 900);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4 animate-in fade-in duration-150"
    >
      <div className="w-full max-w-2xl bg-card border border-border rounded-3xl p-6 sm:p-8 text-foreground flex flex-col gap-6 shadow-2xl relative overflow-hidden max-h-[92vh] overflow-y-auto scrollbar-thin">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground font-black text-sm flex items-center justify-center shadow-md">
              €
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-foreground uppercase tracking-tight">
                Competitive Cashier
              </h3>
              <p className="text-xs text-muted-foreground">
                Zero exchange-rate slippage & localized instant payment gateways.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground flex items-center justify-center text-sm font-bold transition"
            aria-label="Close cashier modal"
          >
            ✕
          </button>
        </div>

        {/* 1. Deposit vs Withdraw Tab Switcher */}
        <div className="flex items-center bg-secondary p-1 rounded-2xl border border-border">
          <button
            type="button"
            onClick={() => setMode('deposit')}
            className={`flex-1 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition ${
              mode === 'deposit'
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            ↓ Deposit Funds
          </button>
          <button
            type="button"
            onClick={() => setMode('withdraw')}
            className={`flex-1 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition ${
              mode === 'withdraw'
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            ↑ Withdraw Cash
          </button>
        </div>

        {/* 2. Country / Location Filter Bar (Crucial Feature) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-foreground flex items-center gap-1.5">
              <span>📍</span> Your Country Location:
            </span>
            <span className="text-[11px] text-muted-foreground font-mono">
              Available methods adapt to your selected country
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {SUPPORTED_COUNTRY_LIST.map((c) => {
              const isSelected = selectedCountry === c.code;
              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => setSelectedCountry(c.code)}
                  className={`p-2 rounded-xl text-left border text-xs transition flex flex-col justify-between ${
                    isSelected
                      ? 'bg-primary/15 border-primary text-foreground font-bold shadow-sm'
                      : 'bg-secondary/60 hover:bg-secondary border-border text-muted-foreground'
                  }`}
                >
                  <span className="text-base">{c.flag}</span>
                  <span className="truncate font-semibold text-[11px] mt-1">{c.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Available Payment Rails for this Country */}
        <div className="space-y-2.5">
          <span className="text-xs font-bold text-foreground block">
            Select {mode === 'deposit' ? 'Deposit' : 'Withdrawal'} Method for {profile.countryName}:
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {availableRails.map((rail) => {
              const isSelected = activeRail ? activeRail.id === rail.id : false;

              return (
                <button
                  key={rail.id}
                  type="button"
                  onClick={() => setSelectedRailId(rail.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 ${
                    isSelected
                      ? 'bg-primary/10 border-primary ring-2 ring-primary/30 shadow-md'
                      : 'bg-secondary/50 hover:bg-secondary border-border'
                  }`}
                >
                  <div className="flex items-start justify-between w-full">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl p-1.5 rounded-lg bg-card border border-border shadow-xs">
                        {rail.icon}
                      </span>
                      <div>
                        <span className="font-bold text-xs text-foreground block leading-tight">
                          {rail.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          Fee: <strong className="text-emerald-400">{rail.fee}</strong> · {rail.processingTime}
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                    )}
                  </div>

                  <p className="text-[11px] text-muted-foreground leading-snug">
                    {rail.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Amount Input & Presets */}
        <div className="space-y-3 p-4 bg-secondary/50 rounded-2xl border border-border">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-foreground">
              Amount ({profile.currency}):
            </span>
            {mode === 'withdraw' && (
              <span className="font-mono text-muted-foreground text-[11px]">
                Balance: €{userBalanceEur.toFixed(2)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-2.5 font-mono font-bold text-muted-foreground text-sm">
                {profile.currencySymbol}
              </span>
              <input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-2 bg-card border border-border focus:border-primary rounded-xl font-mono font-bold text-sm text-foreground focus:outline-none transition"
              />
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {presetAmounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setCustomAmount(amt)}
                  className={`px-2.5 py-2 rounded-xl text-xs font-mono font-bold border transition ${
                    customAmount === amt
                      ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                      : 'bg-card hover:bg-secondary border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {profile.currencySymbol}{amt}
                </button>
              ))}
            </div>
          </div>

          {/* Account Detail field for withdrawals */}
          {mode === 'withdraw' && (
            <div className="space-y-1 pt-2 border-t border-border">
              <span className="text-[11px] text-muted-foreground font-semibold">
                Destination Account / Identifier:
              </span>
              <input
                type="text"
                value={accountDetails}
                onChange={(e) => setAccountDetails(e.target.value)}
                placeholder={
                  selectedCountry === 'KE'
                    ? 'Enter Safaricom M-PESA Phone (07XX...)'
                    : selectedCountry === 'BR'
                    ? 'Enter PIX Key (CPF, Phone, or Email)'
                    : selectedCountry === 'GB'
                    ? 'Enter UK Account Number & Sort Code'
                    : 'Enter IBAN or Bank Account Number'
                }
                className="w-full px-3 py-2 bg-card border border-border focus:border-primary rounded-xl text-xs text-foreground focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* 5. Submit CTA */}
        <div className="flex flex-col gap-2">
          <Button
            variant="default"
            size="lg"
            disabled={isProcessing}
            onClick={handleAction}
            className="w-full font-black text-xs uppercase tracking-wider h-11"
          >
            {isProcessing ? (
              'Processing Request...'
            ) : mode === 'deposit' ? (
              `Confirm Deposit of ${profile.currencySymbol}${customAmount} via ${activeRail?.name || 'Selected Method'} →`
            ) : (
              `Withdraw ${profile.currencySymbol}${customAmount} to Account →`
            )}
          </Button>

          <p className="text-[10px] text-center text-muted-foreground font-mono">
            Direct smart escrow verification. Instant clearance for online esports duels.
          </p>
        </div>
      </div>
    </div>
  );
}
