import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, "aria-labelledby": ariaLabelledBy, "aria-describedby": ariaDescribedBy, ...props }, ref) => {
  // Create a context that child components can access
  const alertContext = React.useRef({
    titleId: ariaLabelledBy || React.useId(),
    descriptionId: ariaDescribedBy || React.useId(),
  });
  
  return (
    <div
      ref={ref}
      role="alert"
      aria-labelledby={ariaLabelledBy || alertContext.current.titleId}
      aria-describedby={ariaDescribedBy || alertContext.current.descriptionId}
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
})
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, id, ...props }, ref) => {
  // Use the parent Alert's titleId if available
  const titleId = id || React.useId();
  
  return (
    <h5
      ref={ref}
      id={titleId}
      className={cn("mb-1 font-medium leading-none tracking-tight", className)}
      {...props}
    />
  );
})
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  // Generate a unique ID for ARIA purposes if one isn't provided
  const descriptionId = React.useId();
  
  return (
    <div
      ref={ref}
      className={cn("text-sm [&_p]:leading-relaxed", className)}
      id={props.id || `alert-desc-${descriptionId}`}
      {...props}
    />
  )
})
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
