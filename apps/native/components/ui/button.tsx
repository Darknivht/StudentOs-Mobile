import { Pressable, type PressableProps, type ViewStyle } from "react-native";
import { cn } from "@studentos/shared";
import { cva } from "../../lib/cva";

const buttonVariants = cva(
  "flex-row items-center justify-center gap-2 rounded-md text-sm font-medium web:ring-offset-background web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2 disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground active:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground active:bg-destructive/90",
        outline: "border border-input bg-background active:bg-accent active:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground active:bg-secondary/80",
        ghost: "active:bg-accent active:text-accent-foreground",
        link: "text-primary web:underline-offset-4 web:active:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps extends PressableProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export function Button({
  className,
  variant,
  size,
  children,
  style,
  ...props
}: ButtonProps) {
  return (
    <Pressable
      className={cn(buttonVariants({ variant, size }), className)}
      style={style as ViewStyle}
      {...props}
    >
      {children}
    </Pressable>
  );
}

export { buttonVariants };
