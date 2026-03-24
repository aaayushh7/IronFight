"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-br from-purple-300 to-pink-300 text-white shadow-lg shadow-purple-200/50 hover:shadow-purple-300/60 hover:brightness-105 rounded-2xl",
        outline:
          "border border-purple-200/60 bg-white/60 backdrop-blur-sm text-purple-700 hover:bg-purple-50 rounded-2xl",
        ghost:
          "text-purple-700 hover:bg-purple-50 rounded-2xl",
        secondary:
          "bg-pink-100 text-pink-700 hover:bg-pink-200 rounded-2xl",
        destructive:
          "bg-red-100 text-red-600 hover:bg-red-200 rounded-2xl",
        success:
          "bg-gradient-to-br from-emerald-300 to-teal-300 text-white shadow-lg shadow-emerald-200/50 rounded-2xl",
        pill:
          "bg-gradient-to-br from-purple-300 to-pink-300 text-white shadow-lg shadow-purple-200/50 hover:shadow-purple-300/60 hover:brightness-105 rounded-full px-6",
        "pill-outline":
          "border border-purple-200/60 bg-white/60 backdrop-blur-sm text-purple-700 hover:bg-purple-50 rounded-full",
      },
      size: {
        default: "h-11 px-5 py-2 text-sm",
        sm: "h-8 px-3 text-xs",
        lg: "h-13 px-8 text-base",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
