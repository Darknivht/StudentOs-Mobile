import { View, Text, type ViewProps, type TextProps } from "react-native";
import { cn } from "@studentos/shared";
import { cva } from "../../lib/cva";

const alertVariants = cva(
  "relative w-full rounded-lg border p-4",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground border-border",
        destructive: "border-destructive/50 text-destructive bg-destructive/10",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface AlertProps extends ViewProps {
  variant?: "default" | "destructive";
}

export function Alert({ className, variant, ...props }: AlertProps) {
  return (
    <View
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

export function AlertTitle({ className, ...props }: TextProps) {
  return (
    <Text
      className={cn("mb-1 font-medium leading-none tracking-tight text-foreground", className)}
      {...props}
    />
  );
}

export function AlertDescription({ className, ...props }: TextProps) {
  return (
    <Text
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}
