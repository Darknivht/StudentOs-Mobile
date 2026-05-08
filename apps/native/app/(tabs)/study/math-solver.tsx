import { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { Calculator } from "lucide-react-native";
import AIToolLayout from "../../../components/ai-tools/AIToolLayout";
import ImageUpload from "../../../components/ai-tools/ImageUpload";
import { streamAIChat } from "../../../lib/ai";
import { useSubscription } from "../../../hooks/useSubscription";
import { Button } from "../../../components/ui/button";
import { ErrorFallback } from "../../../components/ErrorFallback";
import FeatureGateSheet from "../../../components/subscription/FeatureGateSheet";
import Toast from "react-native-toast-message";

export { ErrorFallback as ErrorBoundary };

export default function MathSolverScreen() {
  const { gateFeature, incrementUsage } = useSubscription();
  const [gateData, setGateData] = useState<any>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [textInput, setTextInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSolve = async () => {
    if (!imageBase64 && !textInput.trim()) {
      Toast.show({
        type: "error",
        text1: "Missing input",
        text2: "Please upload a photo or type the math problem.",
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
      mode: "math_solver",
      content: textInput,
      imageBase64: imageBase64 || undefined,
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
      title="Math Scanner & Solver"
      description="Photo to step-by-step solution"
      icon={<Calculator size={20} className="text-primary" />}
      result={result}
      loading={loading}
    >
      <ImageUpload onImageSelect={setImageBase64} disabled={loading} />
      <Text className="text-center text-sm text-muted-foreground">
        or type the problem
      </Text>
      <TextInput
        placeholder="Type your math problem here... e.g., 'Solve 2x + 5 = 15'"
        value={textInput}
        onChangeText={setTextInput}
        multiline
        editable={!loading}
        className="bg-card border border-border rounded-xl p-3 text-foreground text-base min-h-[80px]"
        style={{ textAlignVertical: "top" }}
      />
      <Button
        onPress={handleSolve}
        disabled={loading || (!imageBase64 && !textInput.trim())}
        className="bg-primary"
      >
        <View className="flex-row items-center gap-2">
          <Calculator size={16} className="text-primary-foreground" />
          <Text className="text-primary-foreground font-medium">
            Solve Step-by-Step
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
