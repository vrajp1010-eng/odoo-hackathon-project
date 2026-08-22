import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-xl shadow-black/10 hover:bg-stone-800 hover:shadow-black/20",
        destructive: "bg-destructive text-destructive-foreground shadow-lg shadow-red-900/10 hover:bg-red-700",
        outline: "border border-border bg-white/70 backdrop-blur-md hover:bg-white hover:shadow-lg hover:shadow-black/5",
        secondary: "bg-secondary text-secondary-foreground hover:bg-[#e7e0d6]",
        ghost: "hover:bg-black/5 hover:text-foreground",
        link: "text-accent underline-offset-4 hover:underline",
        accent: "bg-accent text-accent-foreground shadow-xl shadow-orange-900/15 hover:bg-[#b45034]",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 rounded-full px-3.5",
        lg: "h-12 rounded-full px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
