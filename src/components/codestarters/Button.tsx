import { cn } from "@/lib/utils";
import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, type = "button", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none text-xs";

    const variants = {
      primary: "bg-slate-900 text-white hover:bg-slate-800 border border-transparent shadow-xs active:bg-slate-950",
      secondary: "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-xs active:bg-slate-100",
      outline: "border border-slate-200 bg-transparent hover:bg-slate-100 text-slate-800",
      ghost: "bg-transparent hover:bg-slate-100 text-slate-700",
      danger: "bg-rose-600 text-white hover:bg-rose-700 border border-transparent active:bg-rose-800",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-9 px-3.5 text-xs gap-2",
      lg: "h-10 px-4 text-sm gap-2",
    };

    return (
      <button
        ref={ref}
        type={type}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";

