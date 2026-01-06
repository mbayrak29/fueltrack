import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  variant?: 'default' | 'ev' | 'fuel' | 'success';
  className?: string;
}

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  variant = 'default',
  className 
}: StatCardProps) {
  return (
    <div className={cn(
      'rounded-xl p-6 shadow-card transition-all hover:shadow-card-hover animate-fade-in',
      variant === 'ev' && 'bg-ev-light border border-ev/20',
      variant === 'fuel' && 'bg-fuel-light border border-fuel/20',
      variant === 'success' && 'bg-accent border border-success/20',
      variant === 'default' && 'bg-card border border-border',
      className
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className={cn(
            'mt-2 text-3xl font-display font-bold',
            variant === 'ev' && 'text-ev',
            variant === 'fuel' && 'text-fuel',
            variant === 'success' && 'text-success',
            variant === 'default' && 'text-foreground'
          )}>
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className={cn(
            'rounded-lg p-2',
            variant === 'ev' && 'bg-ev text-ev-foreground',
            variant === 'fuel' && 'bg-fuel text-fuel-foreground',
            variant === 'success' && 'bg-success text-success-foreground',
            variant === 'default' && 'bg-muted text-muted-foreground'
          )}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
