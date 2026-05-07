import { Switch as RNSwitch, type SwitchProps } from "react-native";
import { useAppColorScheme } from "../../hooks/useColorScheme";

export function Switch(props: SwitchProps) {
  const { isDark } = useAppColorScheme();
  const primaryColor = isDark ? "hsl(262, 83%, 65%)" : "hsl(262, 83%, 58%)";

  return (
    <RNSwitch
      trackColor={{
        false: "hsl(var(--input))",
        true: primaryColor,
      }}
      thumbColor="hsl(var(--background))"
      {...props}
    />
  );
}
