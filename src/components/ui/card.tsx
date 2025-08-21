import * as React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Card({ className, ...props }: CardProps) {
    return (
        <div
            className={cn('rounded-md border border-slate-200 bg-white', className)}
            {...props}
        />
    );
}

export function CardHeader({ className, ...props }: CardProps) {
    return (
        <div className={cn('p-6 md:p-8', className)} {...props} />
    );
}

export function CardTitle({ className, ...props }: CardProps) {
    return (
        <h2 className={cn('text-2xl font-bold text-slate-700', className)} {...props} />
    );
}

export function CardDescription({ className, ...props }: CardProps) {
    return (
        <p className={cn('text-base text-slate-700', className)} {...props} />
    );
}

export function CardContent({ className, ...props }: CardProps) {
    return (
        <div className={cn('p-0', className)} {...props} />
    );
}

export function CardFooter({ className, ...props }: CardProps) {
    return (
        <div className={cn('p-6 md:p-8', className)} {...props} />
    );
}


