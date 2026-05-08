import { useState } from "react";
import { View, Text, TextInput } from "react-native";
import { Bug } from "lucide-react-native";
import AIToolLayout from "../../../components/ai-tools/AIToolLayout";
import { streamAIChat } from "../../../lib/ai";
import { useSubscription } from "../../../hooks/useSubscription";
import { Button } from "../../../components/ui/button";
import { ErrorFallback } from "../../../components/ErrorFallback";
import FeatureGateSheet from "../../../components/subscription/FeatureGateSheet";
import Toast from "react-native-toast-message";

export { ErrorFallback as ErrorBoundary };

export default function CodeDebuggerScreen() {
  const { gateFeature, incrementUsage } = useSubscription();
  const [gateData, setGateData] = useState<any>(null);
  const [code, setCode] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDebug = async () => {
    if (!code.trim()) {
      Toast.show({
        type: "error",
        text1: "Missing code",
        text2: "Please paste your code to debug.",
      });
      return;
    }

    const gate = gateFeature("ai");
    if (!gate.allowed) {
      setGateData(gate);
      return;
    }

    await incrementUsage("ai");
    setLoading(true);
    setResult("");

    await streamAIChat({
      messages: [],
      mode: "code_debugger",
      content: code,
      onDelta: (chunk) => setResult((prev) => prev + chunk),
      onDone: () => setLoading(false),
      onError: (err) => {
        Toast.show({ type: "error", text1: "Error", text2: err });
        setLoading(false);
      },
    });
  };

  return (
    <AIToolLayout
      title="Code Debugger"
      description="Paste code, AI explains fixes"
      icon={<Bug size={20} className="text-primary" />}
      result={result}
      loading={loading}
    >
      <TextInput
        placeholder="Paste your code here..."
        value={code}
        onChangeText={setCode}
        multiline
        editable={!loading}
        className="bg-card border border-border rounded-xl p-3 text-foreground text-sm min-h-[200px] font-mono"
        style={{ textAlignVertical: "top" }}
      />
      <Button
        onPress={handleDebug}
        disabled={loading || !code.trim()}
        className="bg-primary"
      >
        <View className="flex-row items-center gap-2">
          <Bug size={16} className="text-primary-foreground" />
          <Text className="text-primary-foreground font-medium">
            Debug & Explain
          </Text>
        </View>
      </Button>

      <FeatureGateSheet
        open={!!gateData}
        onOpenChange={() => setGateData(null)}
        feature="AI tool uses"
        currentUsage={gateData?.currentUsage || 0}
        limit={gateData?.limit || 0}
        isLifetime={gateData?.isLifetime}
        requiredTier={gateData?.requiredTier}
      />
    </AIToolLayout>
  );
}
