import { View, Text, Pressable, Modal, ScrollView, type ViewProps } from "react-native";
import { ChevronDown, Check } from "lucide-react-native";
import { cn } from "@studentos/shared";
import { useState, useCallback } from "react";

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps extends ViewProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  options: SelectOption[];
  disabled?: boolean;
}

export function Select({
  value,
  onValueChange,
  placeholder = "Select an option",
  options,
  disabled,
  className,
  ...props
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const selectedLabel = options.find((o) => o.value === value)?.label;

  const handleSelect = useCallback(
    (val: string) => {
      onValueChange?.(val);
      setOpen(false);
    },
    [onValueChange],
  );

  return (
    <View className={className} {...props}>
      <Pressable
        className={cn(
          "flex h-10 flex-row items-center justify-between rounded-md border border-input bg-background px-3 py-2",
          disabled && "opacity-50",
        )}
        disabled={disabled}
        onPress={() => setOpen(true)}
      >
        <Text className={cn("text-sm", selectedLabel ? "text-foreground" : "text-muted-foreground")}>
          {selectedLabel ?? placeholder}
        </Text>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          className="flex-1 bg-black/50 items-end justify-end"
          onPress={() => setOpen(false)}
        >
          <View className="w-full bg-card rounded-t-lg border-t border-border pb-8 pt-2 max-h-[50%]">
            <View className="h-1 w-10 self-center rounded-full bg-muted mb-4" />
            <ScrollView>
              {options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <Pressable
                    key={option.value}
                    className={cn(
                      "flex flex-row items-center justify-between px-4 py-3 active:bg-accent",
                      isSelected && "bg-accent/50",
                    )}
                    onPress={() => handleSelect(option.value)}
                  >
                    <Text className={cn("text-sm", isSelected ? "font-semibold text-accent-foreground" : "text-foreground")}>
                      {option.label}
                    </Text>
                    {isSelected && <Check className="h-4 w-4 text-primary" />}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
