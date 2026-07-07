import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Wanderlust unified button.
 * Pill-first (`rounded-full`), consistent heights/paddings across the site,
 * shared hover/active/focus states. Every CTA in the app should route
 * through this component (use `asChild` to wrap `<Link>` / `<a>`).
 */
const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full",
    "font-medium cursor-pointer select-none",
    "transition-[background-color,color,transform,box-shadow,opacity] duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "active:scale-[0.97]",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        primary:
          "bg-moss-deep text-paper shadow-sm hover:bg-moss hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:bg-moss-deep",
        secondary:
          "bg-paper text-ink shadow-sm hover:bg-paper/90 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0",
        outline:
          "border border-border bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground",
        "outline-light":
          "border border-paper/40 bg-transparent text-paper hover:bg-paper/10",
        ghost: "text-foreground hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline rounded-none px-0 h-auto",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        /**
         * Enter Gauja category CTA — apply the category color via
         * `style={{ backgroundColor }}` on the same element.
         */
        category:
          "text-white shadow-sm hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 hover:brightness-105",
      },
      size: {
        sm: "h-9 px-4 text-xs",
        md: "h-11 px-6 text-sm",
        lg: "h-12 px-7 text-sm",
        xl: "h-14 px-8 text-base",
        icon: "h-10 w-10 p-0",
        /** Compat with legacy shadcn default (h-9 px-4). */
        default: "h-11 px-6 text-sm",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
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
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
