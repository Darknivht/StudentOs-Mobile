import { View, type ViewProps } from "react-native";
import { cn } from "@studentos/shared";

export interface ProgressProps extends ViewProps {
  value?: number;
}

export function Progress({ value = 0, className, ...props }: ProgressProps) {
  const clampedValue = Math.max(0, Math.min(100, value));

  return (
    <View
      className={cn("relative h-4 w-full overflow-hidden rounded-full bg-secondary", className)}
      {...props}
    >
      <View
        className="h-full bg-primary"
        style={{ width: `${clampedValue}%` }}
      />
    </View>
  );
}