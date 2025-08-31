import * as React from "react"
import { cn } from "@/lib/utils"

interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg"
}

const Loader = React.forwardRef<HTMLDivElement, LoaderProps>(
  ({ className, size = "md", ...props }, ref) => {
    const sizeClasses = {
      sm: "h-4 w-4 border-2",
      md: "h-6 w-6 border-2", 
      lg: "h-8 w-8 border-[3px]"
    }

    return (
      <div
        ref={ref}
        className={cn(
          "animate-spin rounded-full border-muted border-t-primary",
          sizeClasses[size],
          className
        )}
        {...props}
      />
    )
  }
)

Loader.displayName = "Loader"

export { Loader }
