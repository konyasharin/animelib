import type { ComponentPropsWithRef } from 'react';

import { cn } from './cn';

export function Input({ className, ...props }: ComponentPropsWithRef<'input'>) {
  return (
    <input
      className={cn(
        'h-10 w-full rounded-control border border-neutral-200 bg-white px-3 text-sm text-neutral-900',
        'placeholder:text-neutral-400',
        'dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500',
        'focus-visible:border-brand-500 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-500/40',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'aria-invalid:border-red-500 aria-invalid:outline-red-500/40',
        className,
      )}
      {...props}
    />
  );
}
