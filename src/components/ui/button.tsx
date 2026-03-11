import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 dark:focus-visible:ring-surface-300",
    {
        variants: {
            variant: {
                default:
                    "bg-primary-500 text-white shadow-sm hover:bg-primary-600 hover:shadow active:scale-[0.98]",
                destructive:
                    "bg-danger-500 text-white shadow-sm hover:bg-danger-600 active:scale-[0.98]",
                outline:
                    "border border-surface-200 bg-transparent shadow-sm hover:bg-surface-50 dark:border-surface-800 dark:hover:bg-surface-800 dark:text-surface-50",
                secondary:
                    "bg-surface-100 text-surface-900 shadow-sm hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-50 dark:hover:bg-surface-700 active:scale-[0.98]",
                ghost: "hover:bg-surface-50 hover:text-surface-900 dark:hover:bg-surface-800 dark:hover:text-surface-50",
                link: "text-primary-500 underline-offset-4 hover:underline",
            },
            size: {
                default: "h-10 px-5 py-2",
                sm: "h-8 rounded-md px-3 text-xs",
                lg: "h-12 rounded-xl px-8 text-base",
                icon: "h-10 w-10",
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
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

// eslint-disable-next-line react-refresh/only-export-components
export { Button, buttonVariants }
