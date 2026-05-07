import { View, type ViewProps } from "react-native";
import { cn } from "@studentos/shared";
import { cva } from "../../lib/cva";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends ViewProps {
  variant?: "default" | "secondary" | "destructive" | "outline";
}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <View className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { badgeVariants };
