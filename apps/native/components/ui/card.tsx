import { View, type ViewProps } from "react-native";
import { cn } from "@studentos/shared";

export function Card({ className, ...props }: ViewProps) {
  return (
    <View
      className={cn("rounded-lg border border-border bg-card text-card-foreground shadow-sm", className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: ViewProps) {
  return <View className={cn("flex flex-col gap-1.5 p-6", className)} {...props} />;
}

export function CardTitle({ className, ...props }: ViewProps) {
  return <View className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />;
}

export function CardDescription({ className, ...props }: ViewProps) {
  return <View className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

export function CardContent({ className, ...props }: ViewProps) {
  return <View className={cn("p-6 pt-0", className)} {...props} />;
}

export function CardFooter({ className, ...props }: ViewProps) {
  return <View className={cn("flex flex-row items-center p-6 pt-0", className)} {...props} />;
}
