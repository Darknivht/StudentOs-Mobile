import React, { forwardRef, useCallback, useEffect, useMemo } from "react";
import { View, type ViewProps } from "react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
  type BottomSheetProps,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { cn } from "@studentos/shared";

export interface SheetProps extends Omit<BottomSheetProps, "children"> {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Sheet({
  children,
  open = false,
  onOpenChange,
  snapPoints,
  ...props
}: SheetProps) {
  const sheetRef = React.useRef<BottomSheet>(null);
  const defaultSnapPoints = useMemo(() => ["50%", "90%"], []);

  useEffect(() => {
    if (open) {
      sheetRef.current?.expand();
    } else {
      sheetRef.current?.close();
    }
  }, [open]);

  const handleChange = useCallback(
    (index: number) => {
      onOpenChange?.(index >= 0);
    },
    [onOpenChange],
  );

  const renderBackdrop = useCallback(
    (backdropProps: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...backdropProps}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.8}
      />
    ),
    [],
  );

  return (
    <BottomSheet
      ref={sheetRef}
      snapPoints={snapPoints ?? defaultSnapPoints}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      onChange={handleChange}
      backgroundStyle={{ backgroundColor: "hsl(var(--card))" }}
      handleIndicatorStyle={{ backgroundColor: "hsl(var(--muted))" }}
      {...props}
    >
      <BottomSheetView className="p-6">
        {children}
      </BottomSheetView>
    </BottomSheet>
  );
}

export function SheetHeader({ className, ...props }: ViewProps) {
  return <View className={cn("flex flex-col gap-2 pb-4", className)} {...props} />;
}

export function SheetFooter({ className, ...props }: ViewProps) {
  return <View className={cn("flex flex-col gap-2 pt-4", className)} {...props} />;
}

export function SheetTitle({ className, ...props }: ViewProps) {
  return <View className={cn("text-lg font-semibold text-foreground", className)} {...props} />;
}

export function SheetDescription({ className, ...props }: ViewProps) {
  return <View className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

export function SheetClose() {
  return null;
}

export function SheetTrigger() {
  return null;
}

export function SheetContent() {
  return null;
}
