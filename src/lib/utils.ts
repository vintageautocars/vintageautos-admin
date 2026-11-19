import { clsx, type ClassValue } from 'clsx';
import { format } from 'date-fns';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date, fmt = 'dd MMM yyyy'): string {
  return format(new Date(date), fmt);
}

export function durationDays(start: string | Date, end: string | Date): number {
  const s = new Date(start);
  const e = new Date(end);
  return Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

export function truncateMiddle(str: string, head = 6, tail = 4): string {
  if (str.length <= head + tail + 3) return str;
  return `${str.slice(0, head)}…${str.slice(-tail)}`;
}
