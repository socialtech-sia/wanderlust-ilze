import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Wanderlust unified button — Devonian system.
 * Sharp 3px radius, Archivo Narrow uppercase lettering with tracking,
 * sandstone fill for the primary action, hairline outline for the secondary.
 */
const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full",
    "font-[family-name:var(--font-utility)] font-semibold uppercase tracking-[0.08em]",
    "cursor-pointer select-none",
    "transition-[background-color,color,transform,border-color,opacity] duration-200 ease-out",
    "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[color-mix(in_oklab,var(--sandstone)_25%,transparent)] focus-visible:border-[var(--sandstone)]",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        /** Legacy shadcn alias for `primary`. */
        default:
          "border border-transparent bg-sandstone text-bone hover:bg-sandstone-bright hover:-translate-y-px active:translate-y-0",
        primary:
          "border border-transparent bg-sandstone text-bone hover:bg-sandstone-bright hover:-translate-y-px active:translate-y-0",
        secondary:
          "border border-border bg-transparent text-foreground hover:bg-[color-mix(in_oklab,var(--bone)_8%,transparent)] hover:-translate-y-px active:translate-y-0",
        outline:
          "border border-border bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground",
        "outline-light":
          "border border-[color-mix(in_oklab,var(--bone)_35%,transparent)] bg-transparent text-bone hover:bg-[color-mix(in_oklab,var(--bone)_8%,transparent)]",
        ghost: "border border-transparent text-foreground hover:bg-accent hover:text-accent-foreground",
        link: "border-0 text-primary underline-offset-4 hover:underline rounded-none px-0 h-auto normal-case tracking-normal",
        destructive:
          "border border-transparent bg-destructive text-destructive-foreground hover:opacity-90",
        /**
         * Enter Gauja category CTA — apply the category color via
         * `style={{ backgroundColor }}` on the same element.
         */
        category:
          "border border-transparent text-white hover:-translate-y-px active:translate-y-0 hover:brightness-110",
      },
      size: {
        sm: "h-9 px-4 text-[11px]",
        md: "h-11 px-6 text-xs",
        lg: "h-12 px-7 text-xs",
        xl: "h-14 px-9 text-sm",
        icon: "h-10 w-10 p-0",
        /** Compat with legacy shadcn default. */
        default: "h-11 px-6 text-xs",
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
