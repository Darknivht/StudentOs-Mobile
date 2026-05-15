import { TextInput, type TextInputProps } from "react-native";
import { cn } from "@studentos/shared";
import { Colors } from "../../theme/colors";

export function Input({ className, placeholderTextColor, ...props }: TextInputProps) {
  return (
    <TextInput
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base text-foreground placeholder:text-muted-foreground web:ring-offset-background web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2 disabled:opacity-50 md:text-sm",
        className,
      )}
      placeholderTextColor={placeholderTextColor || Colors.inputForeground}
      {...props}
    />
  );
}
