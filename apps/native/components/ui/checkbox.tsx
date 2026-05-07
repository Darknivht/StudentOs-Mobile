import { Pressable, View, type PressableProps } from "react-native";
import { Check } from "lucide-react-native";
import { cn } from "@studentos/shared";

export interface CheckboxProps extends Omit<PressableProps, "onPress"> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export function Checkbox({
  className,
  checked = false,
  onCheckedChange,
  disabled,
  ...props
}: CheckboxProps) {
  return (
    <Pressable
      className={cn(
        "h-5 w-5 shrink-0 rounded-sm border border-primary items-center justify-center",
        checked && "bg-primary border-primary",
        disabled && "opacity-50",
        className,
      )}
      disabled={disabled}
      onPress={() => onCheckedChange?.(!checked)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      {...props}
    >
      {checked && <Check className="h-3.5 w-3.5 text-primary-foreground" strokeWidth={3} />}
    </Pressable>
  );
}
