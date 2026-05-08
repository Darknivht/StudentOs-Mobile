import { useState } from "react";
import { View, Text } from "react-native";
import { Microscope } from "lucide-react-native";
import AIToolLayout from "../../../components/ai-tools/AIToolLayout";
import ImageUpload from "../../../components/ai-tools/ImageUpload";
import { streamAIChat } from "../../../lib/ai";
import { useSubscription } from "../../../hooks/useSubscription";
import { Button } from "../../../components/ui/button";
import { ErrorFallback } from "../../../components/ErrorFallback";
import FeatureGateSheet from "../../../components/subscription/FeatureGateSheet";
import Toast from "react-native-toast-message";

export { ErrorFallback as ErrorBoundary };

export default function DiagramInterpreterScreen() {
  const { gateFeature, incrementUsage } = useSubscription();
  const [gateData, setGateData] = useState<any>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!imageBase64) {
      Toast.show({
        type: "error",
        text1: "Missing image",
        text2: "Please upload a diagram to analyze.",
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
      mode: "diagram_interpreter",
      imageBase64,
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
      title="Diagram Interpreter"
      description="Explain biology/physics diagrams"
      icon={<Microscope size={20} className="text-primary" />}
      result={result}
      loading={loading}
    >
      <ImageUpload onImageSelect={setImageBase64} disabled={loading} />
      <Button
        onPress={handleAnalyze}
        disabled={loading || !imageBase64}
        className="bg-primary"
      >
        <View className="flex-row items-center gap-2">
          <Microscope size={16} className="text-primary-foreground" />
          <Text className="text-primary-foreground font-medium">
            Explain Diagram
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
