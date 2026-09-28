import * as React from 'react';
import { cn } from '@antigravity/ui';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'copper';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const base = 'inline-flex items-center justify-center rounded-xl font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C86228] disabled:pointer-events-none disabled:opacity-50 select-none';

    const variants = {
      default: 'bg-[#C86228] hover:bg-[#D97736] text-white shadow-md shadow-[#C86228]/20',
      copper: 'bg-gradient-to-r from-[#AF4F1A] to-[#C86228] hover:from-[#C86228] hover:to-[#D97736] text-white shadow-md',
      secondary: 'bg-[#161922] hover:bg-[#202430] border border-[#202430] text-gray-200 hover:text-white',
      outline: 'border border-[#202430] hover:border-[#C86228]/60 bg-transparent text-gray-300 hover:text-white',
      ghost: 'hover:bg-[#161922] text-gray-400 hover:text-white',
      destructive: 'bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-400 hover:text-red-300',
    };

    const sizes = {
      default: 'h-10 px-4 py-2 text-xs uppercase tracking-wider',
      sm: 'h-8 px-3 text-[11px] uppercase tracking-wider',
      lg: 'h-12 px-6 text-sm uppercase tracking-wider',
      icon: 'h-9 w-9 p-0',
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
