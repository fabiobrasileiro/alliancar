"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

interface ProgressProps extends React.ComponentProps<typeof ProgressPrimitive.Root> {
  markers?: number[];
  showMarkers?: boolean;
  showLabels?: boolean;
  markerColor?: string;
  labelColor?: string;
  showTopLabels?: boolean;
  percentages?: number[];
}

function Progress({
  className,
  value,
  markers = [0, 49, 99, 199, 340, 490],
  showMarkers = true,
  showLabels = true,
  markerColor = "bg-white/50",
  labelColor = "text-white",
  percentages = [3, 5, 7, 9, 12, 15],
  showTopLabels = true,
  ...props
}: ProgressProps) {
  const maxValue = Math.max(...markers);

  // POSIÇÕES MANUAIS - AJUSTE AQUI O QUE PRECISAR
  const topLabelPositions = [5, 14, 28, 50, 76, 95];

  // Valores para os tooltips respectivamente
  const tooltipValues = [
    "±220,00/A.M",
    "±750,00/A.M", 
    "±2.100,00/A.M",
    "±4.700,00/A.M",
    "±9.000,00/A.M",
    "±10.000,00/A.M"
  ];

  const markerPositions = markers.map(marker => (marker / maxValue) * 90);

  return (
    <div className="relative w-full">
      {/* Labels superiores com porcentagens */}
      {showTopLabels && (
        <div className="relative w-full mb-2 h-6 rounded">
          {percentages.map((percentage, index) => (
            <Tooltip key={index}>
              <TooltipTrigger
                className="absolute text-xs font-medium text-center px-1 rounded"
                style={{
                  left: `${topLabelPositions[index]}%`,
                  transform: 'translateX(-50%)'
                }}
              >
                {percentage}%
              </TooltipTrigger>
              <TooltipContent className="bg-a1">
                <p>{tooltipValues[index]}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      )}

      {/* Barra de progresso */}
      <ProgressPrimitive.Root
        data-slot="progress"
        className={cn(
          "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
          className,
        )}
        {...props}
      >
        <ProgressPrimitive.Indicator
          data-slot="progress-indicator"
          className="bg-a1 h-full w-full flex-1 transition-all"
          style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
        />

        {/* Marcadores verticais */}
        {showMarkers && markers.map((marker, index) => (
          <div
            key={index}
            className={cn(
              "absolute top-1/2 w-px h-3 transform -translate-y-1/2",
              markerColor
            )}
            style={{
              left: `${markerPositions[index]}%`,
              opacity: 1
            }}
          />
        ))}
      </ProgressPrimitive.Root>

      {/* Labels inferiores */}
      {showLabels && (
        <div className="relative w-full mt-1 h-4">
          {markers.map((marker, index) => (
            <span
              key={index}
              className={cn(
                "absolute text-xs whitespace-nowrap",
                labelColor,
                value && value >= marker && "font-medium text-black"
              )}
              style={{
                left: `${markerPositions[index]}%`,
                transform: index === 0
                  ? 'translateX(0)'
                  : index === markers.length - 1
                    ? 'translateX(-100%)'
                    : 'translateX(-50%)'
              }}
            >
              {marker}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export { Progress };