"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showLabel?: boolean;
  label?: string;
  sublabel?: string;
  color?: string;
  trackColor?: string;
}

export function ProgressRing({
  percentage,
  size = 120,
  strokeWidth = 10,
  className,
  showLabel = true,
  label,
  sublabel,
  color = "url(#ringGradient)",
  trackColor = "rgba(201, 167, 235, 0.15)",
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        <defs>
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C9A7EB" />
            <stop offset="100%" stopColor="#F4B8C7" />
          </linearGradient>
          <linearGradient id="ringGradientGreen" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#B8E4C9" />
            <stop offset="100%" stopColor="#A8D8EA" />
          </linearGradient>
        </defs>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-slate-700 leading-none">
            {label ?? `${Math.round(percentage)}%`}
          </span>
          {sublabel && (
            <span className="text-xs text-purple-400 mt-0.5 font-medium">
              {sublabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
