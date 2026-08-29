import React from 'react';

export const Badge: React.FC<{
  children: React.ReactNode;
  variant?: 'default' | 'accent' | 'success' | 'warning' | 'muted';
  className?: string;
}> = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] border-[var(--border-subtle)]',
    accent: 'bg-[var(--accent-glow)] text-[var(--accent)] border-[var(--accent)]/30',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    muted: 'bg-transparent text-[var(--text-muted)] border-transparent',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md border ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
