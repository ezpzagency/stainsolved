import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, "aria-label": ariaLabel, id, ...props }, ref) => {
    // If used outside of a FormControl, we should have an aria-label or label association
    const needsAriaLabel = !props["aria-labelledby"] && !ariaLabel && !id;
    
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        aria-label={needsAriaLabel ? (props.placeholder || "Text input area") : ariaLabel}
        id={id}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
