import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon?: React.ReactNode;
  trend?: string;
  color?: 'default' | 'accent' | 'success';
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subValue,
  icon,
  trend,
  color = 'default',
}) => {
  const valueColor =
    color === 'accent'
      ? 'text-[var(--accent)]'
      : color === 'success'
      ? 'text-emerald-400'
      : 'text-[var(--text-primary)]';

  return (
    <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex flex-col justify-between transition-all duration-200 hover:border-[var(--border-subtle)]/80 hover:bg-[var(--bg-surface-hover)]/40">
      <div className="flex items-center justify-between text-[var(--text-secondary)] text-xs font-medium uppercase tracking-wider mb-2">
        <span>{label}</span>
        {icon && <span className="text-[var(--text-muted)]">{icon}</span>}
      </div>
      <div>
        <div className={`text-2xl font-bold font-typing ${valueColor}`}>
          {value}
        </div>
        {subValue && (
          <div className="text-xs text-[var(--text-secondary)] mt-0.5">
            {subValue}
          </div>
        )}
        {trend && (
          <div className="text-xs text-emerald-400 mt-1 font-medium">
            {trend}
          </div>
        )}
      </div>
    </div>
  );
};

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
