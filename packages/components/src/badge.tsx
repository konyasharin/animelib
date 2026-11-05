import type { ComponentPropsWithRef } from 'react';

import { cn } from './cn';

const TONES = {
  neutral:
    'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300',
  brand: 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-200',
  success: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
  danger: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
} as const;

export interface BadgeProps extends ComponentPropsWithRef<'span'> {
  tone?: keyof typeof TONES;
}

export function Badge({ tone = 'neutral', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        TONES[tone],
        className,
      )}
      {...props}
    />
  );
}
