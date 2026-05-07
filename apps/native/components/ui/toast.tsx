import Toast, { type ToastConfigParams } from "react-native-toast-message";
import { View, Text } from "react-native";

type ToastType = "success" | "error" | "info";

const toastConfig: Record<ToastType, (params: ToastConfigParams<ToastType>) => React.ReactNode> = {
  success: ({ text1, text2 }) => (
    <View className="flex-row items-center gap-3 mx-4 my-1 p-4 rounded-lg border border-border bg-card shadow-lg">
      <View className="flex-1">
        {text1 ? <Text className="font-semibold text-sm text-foreground">{text1}</Text> : null}
        {text2 ? <Text className="text-sm text-muted-foreground">{text2}</Text> : null}
      </View>
    </View>
  ),
  error: ({ text1, text2 }) => (
    <View className="flex-row items-center gap-3 mx-4 my-1 p-4 rounded-lg border border-destructive/50 bg-destructive/10 shadow-lg">
      <View className="flex-1">
        {text1 ? <Text className="font-semibold text-sm text-destructive">{text1}</Text> : null}
        {text2 ? <Text className="text-sm text-destructive/80">{text2}</Text> : null}
      </View>
    </View>
  ),
  info: ({ text1, text2 }) => (
    <View className="flex-row items-center gap-3 mx-4 my-1 p-4 rounded-lg border border-secondary/50 bg-secondary/10 shadow-lg">
      <View className="flex-1">
        {text1 ? <Text className="font-semibold text-sm text-secondary">{text1}</Text> : null}
        {text2 ? <Text className="text-sm text-secondary/80">{text2}</Text> : null}
      </View>
    </View>
  ),
};

export { Toast, toastConfig };
