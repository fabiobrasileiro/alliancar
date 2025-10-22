import { cn } from '@/lib/utils'
import { Subtitles } from 'lucide-react'
import React from 'react'

interface CardProp{
    title: string,
    text: number | string,
    subtitle: number | string,
    className?: string,
    path: string,
    color: string 
    spanColor?: string
    iconColor: string
}

function Cards( { title, text, subtitle, className, path, color, spanColor, iconColor }: CardProp) {
    return (
        <div className={cn("bg-white rounded-xl shadow-lg p-6 border-l-4", className)}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-bold text-gray-900">{text}</p>
                </div>
                <div className={cn("p-3  rounded-lg", iconColor)}>
                    <svg className={cn("w-6 h-6", color)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path}/>
                    </svg>
                </div>
            </div>
            <div className="mt-2">
                <span className={cn("text-sm font-medium text-gray-600", spanColor )}>
                    {subtitle}
                </span>
            </div>
        </div>
    )
}

export default Cards
