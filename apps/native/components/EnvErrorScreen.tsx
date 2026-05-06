import { View, Text, Pressable, ScrollView } from "react-native";
import { envParseError } from "../lib/env";

interface EnvErrorScreenProps {
  onRetry?: () => void;
}

export function EnvErrorScreen({ onRetry }: EnvErrorScreenProps) {
  return (
    <View style={{ flex: 1, backgroundColor: "#fef2f2", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <Text style={{ fontSize: 20, fontWeight: "700", color: "#dc2626", marginBottom: 8 }}>
        Configuration Error
      </Text>
      <Text style={{ fontSize: 14, color: "#7f1d1d", marginBottom: 16, textAlign: "center" }}>
        Missing or invalid environment variables. The app cannot start.
      </Text>
      {__DEV__ && envParseError && (
        <ScrollView style={{ maxHeight: 200, width: "100%", marginBottom: 16 }}>
          <Text style={{ fontSize: 12, color: "#991b1b", fontFamily: "monospace" }}>
            {envParseError}
          </Text>
        </ScrollView>
      )}
      {onRetry && (
        <Pressable
          onPress={onRetry}
          style={{ paddingHorizontal: 24, paddingVertical: 12, backgroundColor: "#dc2626", borderRadius: 8 }}
        >
          <Text style={{ color: "#ffffff", fontWeight: "600" }}>Retry</Text>
        </Pressable>
      )}
    </View>
  );
}
