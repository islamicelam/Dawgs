// Shared Tailwind class fragments — the single source of truth for the
// board's visual language (Linear-style: neutral chrome, one indigo accent).

export const INPUT_CLS =
  'w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 ' +
  'rounded-md px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 ' +
  'placeholder-neutral-400 dark:placeholder-neutral-500 ' +
  'focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 ' +
  'transition-colors';

export const SELECT_CLS = INPUT_CLS;

export const LABEL_CLS =
  'text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5 block';

export const BUTTON_PRIMARY_CLS =
  'bg-indigo-600 text-white rounded-md py-2 px-4 text-sm font-medium ' +
  'hover:bg-indigo-500 active:scale-[0.98] transition-all ' +
  'disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 ' +
  'shadow-sm shadow-indigo-600/20';

export const BUTTON_SECONDARY_CLS =
  'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 ' +
  'rounded-md py-2 px-4 text-sm font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700 ' +
  'active:scale-[0.98] transition-all';

export const BUTTON_DANGER_CLS =
  'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 ' +
  'border border-red-200 dark:border-red-900/60 rounded-md py-2 text-sm font-medium ' +
  'hover:bg-red-100 dark:hover:bg-red-950/70 transition-colors';

export const GHOST_ICON_BUTTON_CLS =
  'text-neutral-400 hover:text-neutral-700 dark:text-neutral-500 dark:hover:text-neutral-200 transition-colors';

export const SURFACE_CLS =
  'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800';

export const CARD_CLS =
  'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-lg';
