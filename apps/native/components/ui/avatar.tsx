import { View, Image, type ViewProps, type ImageSourcePropType } from "react-native";
import { Text } from "react-native";
import { cn } from "@studentos/shared";

export interface AvatarProps extends ViewProps {
  size?: number;
}

export function Avatar({ size = 40, className, ...props }: AvatarProps) {
  return (
    <View
      className={cn("relative shrink-0 overflow-hidden rounded-full", className)}
      style={{ width: size, height: size }}
      {...props}
    />
  );
}

export interface AvatarImageProps {
  source: ImageSourcePropType;
  size?: number;
  className?: string;
}

export function AvatarImage({ source, size = 40, className }: AvatarImageProps) {
  return (
    <Image
      source={source}
      className={cn("aspect-square", className)}
      style={{ width: size, height: size }}
      resizeMode="cover"
    />
  );
}

export interface AvatarFallbackProps extends ViewProps {
  initials?: string;
  size?: number;
}

export function AvatarFallback({ initials = "?", size = 40, className, ...props }: AvatarFallbackProps) {
  const fontSize = size * 0.4;
  return (
    <View
      className={cn("flex items-center justify-center rounded-full bg-muted", className)}
      style={{ width: size, height: size }}
      {...props}
    >
      <Text className="font-semibold text-muted-foreground" style={{ fontSize }}>
        {initials.slice(0, 2).toUpperCase()}
      </Text>
    </View>
  );
}
