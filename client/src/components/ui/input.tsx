import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, "aria-label": ariaLabel, id, ...props }, ref) => {
    // If used outside of a FormControl, we should have an aria-label or label association
    const needsAriaLabel = !props["aria-labelledby"] && !ariaLabel && !id;
    
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        aria-label={needsAriaLabel ? (props.placeholder || "Input field") : ariaLabel}
        id={id}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
