import { TextInput, type TextInputProps } from "react-native";
import { cn } from "@studentos/shared";

export function Textarea({ className, ...props }: TextInputProps) {
  return (
    <TextInput
      multiline
      className={cn(
        "min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground web:ring-offset-background web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2 disabled:opacity-50",
        className,
      )}
      placeholderTextColor="hsl(var(--muted-foreground))"
      textAlignVertical="top"
      {...props}
    />
  );
}
