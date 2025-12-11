import * as React from "react"
import { cn } from "../../lib/utils"
import { Loader2 } from "lucide-react"

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost" | "danger"
    size?: "sm" | "md" | "lg"
    isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", isLoading, children, ...props }, ref) => {

        // Base styles: Focus rings, transitions, centering
        const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]"

        // Variants for "Radical Clarity" look
        const variants = {
            primary: "bg-primary text-white shadow-soft hover:bg-primary-light hover:shadow-lg hover:-translate-y-0.5",
            secondary: "bg-secondary text-white shadow-soft hover:bg-secondary-light hover:shadow-lg hover:-translate-y-0.5",
            outline: "border border-surface-border bg-white text-text-primary hover:bg-surface-muted hover:text-primary",
            ghost: "hover:bg-surface-muted text-text-secondary hover:text-text-primary",
            danger: "bg-red-600 text-white shadow-soft hover:bg-red-700"
        }

        const sizes = {
            sm: "h-9 px-3 text-xs",
            md: "h-11 px-6 text-sm",
            lg: "h-14 px-8 text-base",
        }

        return (
            <button
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                ref={ref}
                disabled={isLoading || props.disabled}
                {...props}
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {children}
            </button>
        )
    }
)
Button.displayName = "Button"

export { Button }
