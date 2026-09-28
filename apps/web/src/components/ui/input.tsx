import * as React from 'react';
import { cn } from '@antigravity/ui';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-xl border border-[#202430] bg-[#0B0C10] px-3.5 py-2 text-xs text-white placeholder:text-gray-500 transition-colors focus-visible:outline-none focus-visible:border-[#C86228] disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';
