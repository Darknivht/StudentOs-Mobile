import React from "react";
import { Pressable, View, type PressableProps, type ViewProps } from "react-native";
import { Circle } from "lucide-react-native";
import { cn } from "@studentos/shared";

export interface RadioGroupProps extends ViewProps {
  value?: string;
  onValueChange?: (value: string) => void;
}

export function RadioGroup({
  value,
  onValueChange,
  className,
  children,
  ...props
}: RadioGroupProps) {
  return (
    <View className={cn("gap-2", className)} accessibilityRole="radiogroup" {...props}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement<RadioGroupItemProps>(child)) {
          return React.cloneElement(child, {
            selected: child.props.value === value,
            onSelect: onValueChange,
          });
        }
        return child;
      })}
    </View>
  );
}

export interface RadioGroupItemProps extends Omit<PressableProps, "onPress"> {
  value: string;
  selected?: boolean;
  onSelect?: (value: string) => void;
}

export function RadioGroupItem({
  value,
  selected = false,
  onSelect,
  className,
  disabled,
  ...props
}: RadioGroupItemProps) {
  return (
    <Pressable
      className={cn(
        "h-5 w-5 shrink-0 rounded-full border border-primary items-center justify-center",
        disabled && "opacity-50",
        className,
      )}
      disabled={disabled}
      onPress={() => onSelect?.(value)}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      {...props}
    >
      {selected && <Circle className="h-2.5 w-2.5 fill-current text-primary" />}
    </Pressable>
  );
}
