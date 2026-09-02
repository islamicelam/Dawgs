// Shared Tailwind class fragments — the single source of truth for the
// app's visual language. Palette values themselves live in tailwind.config.js
// (dawgs brand: neutral + indigo=accent + sky/emerald/amber/red=signals).
// Button philosophy: soft-outline / ghost — no solid fills. Accent budget:
// indigo appears only on the mark, the active filter, and primary buttons.

export const INPUT_CLS =
  'w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 ' +
  'rounded-md px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 ' +
  'placeholder-neutral-400 dark:placeholder-neutral-500 ' +
  'focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 ' +
  'transition-colors';

export const SELECT_CLS = INPUT_CLS;

export const LABEL_CLS =
  'text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5 block';

// Primary — the accent-budget's "primary button" slot. Soft border + tint,
// never a solid fill.
export const BUTTON_PRIMARY_CLS =
  'inline-flex items-center justify-center gap-1.5 border rounded-md text-sm font-medium ' +
  'py-2 px-4 transition-all active:scale-[0.98] ' +
  'disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 ' +
  'border-indigo-600 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 ' +
  'dark:border-indigo-500 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500/15';

// Secondary — bordered, fully neutral (no accent).
export const BUTTON_SECONDARY_CLS =
  'inline-flex items-center justify-center gap-1.5 border rounded-md text-sm font-medium ' +
  'py-2 px-4 transition-all active:scale-[0.98] ' +
  'border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-100 hover:text-neutral-900 ' +
  'dark:border-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-100';

// Danger — ghost until hover, rust-tinted.
export const BUTTON_DANGER_CLS =
  'inline-flex items-center justify-center gap-1.5 border rounded-md text-sm font-medium ' +
  'py-2 px-4 transition-all active:scale-[0.98] ' +
  'border-red-300 text-red-600 hover:bg-red-50 ' +
  'dark:border-red-500/50 dark:text-red-400 dark:hover:bg-red-900/20';

// Ghost icon button — no border/fill, for compact icon-only actions.
export const GHOST_ICON_BUTTON_CLS =
  'inline-flex items-center justify-center rounded-md text-neutral-400 hover:text-neutral-700 ' +
  'hover:bg-neutral-100 dark:text-neutral-500 dark:hover:text-neutral-200 dark:hover:bg-neutral-800 ' +
  'transition-colors';

export const SURFACE_CLS =
  'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800';

export const CARD_CLS =
  'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-lg';
