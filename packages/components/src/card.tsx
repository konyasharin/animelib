import type { ComponentPropsWithRef } from 'react';

import { cn } from './cn';

export function Card({ className, ...props }: ComponentPropsWithRef<'div'>) {
  return (
    <div
      className={cn(
        'rounded-card border border-neutral-200 bg-white shadow-card dark:border-neutral-800 dark:bg-neutral-900',
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: ComponentPropsWithRef<'div'>) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 border-b border-neutral-200 px-5 py-4 dark:border-neutral-800',
        className,
      )}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ...props
}: ComponentPropsWithRef<'h2'>) {
  return (
    <h2
      className={cn(
        'text-base font-semibold text-neutral-900 dark:text-neutral-100',
        className,
      )}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: ComponentPropsWithRef<'div'>) {
  return <div className={cn('px-5 py-4', className)} {...props} />;
}

export function CardFooter({
  className,
  ...props
}: ComponentPropsWithRef<'div'>) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 border-t border-neutral-200 px-5 py-3 dark:border-neutral-800',
        className,
      )}
      {...props}
    />
  );
}
