import * as React from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'default' | 'outline' | 'secondary' | 'ghost' | 'link';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
    default:
        'bg-jelly-bean-500 text-white hover:bg-blue-500 focus-visible:ring-blue-600',
    outline:
        'border border-slate-300 bg-white text-slate-900 hover:bg-slate-50 focus-visible:ring-slate-300',
    secondary:
        'bg-slate-100 text-slate-900 hover:bg-slate-200 focus-visible:ring-slate-300',
    ghost: 'bg-transparent hover:bg-jelly-bean-500 text-jelly-bean-50',
    link: 'bg-transparent text-blue-600 hover:text-blue-800 underline',
};

const sizeClasses: Record<ButtonSize, string> = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-9 px-4 text-sm',
    lg: 'h-11 px-6 text-base',
    icon: 'h-9 w-9 p-0',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'default', size = 'md', ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
                    variantClasses[variant],
                    sizeClasses[size],
                    className
                )}
                {...props}
            />
        );
    }
);

Button.displayName = 'Button';


