import { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, Modal } from "react-native";
import { Languages, ChevronDown } from "lucide-react-native";
import AIToolLayout from "../../../components/ai-tools/AIToolLayout";
import { streamAIChat } from "../../../lib/ai";
import { useSubscription } from "../../../hooks/useSubscription";
import { Button } from "../../../components/ui/button";
import { ErrorFallback } from "../../../components/ErrorFallback";
import FeatureGateSheet from "../../../components/subscription/FeatureGateSheet";
import Toast from "react-native-toast-message";

export { ErrorFallback as ErrorBoundary };

const languages = [
  { value: "english", label: "English" },
  { value: "spanish", label: "Spanish" },
  { value: "french", label: "French" },
  { value: "german", label: "German" },
  { value: "chinese", label: "Chinese" },
  { value: "japanese", label: "Japanese" },
  { value: "korean", label: "Korean" },
  { value: "arabic", label: "Arabic" },
  { value: "hindi", label: "Hindi" },
  { value: "portuguese", label: "Portuguese" },
];

export default function TranslatorScreen() {
  const { gateFeature, incrementUsage } = useSubscription();
  const [gateData, setGateData] = useState<any>(null);
  const [text, setText] = useState("");
  const [targetLang, setTargetLang] = useState("english");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const handleTranslate = async () => {
    if (!text.trim()) {
      Toast.show({
        type: "error",
        text1: "Missing text",
        text2: "Please enter text to translate.",
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

    const targetLabel =
      languages.find((l) => l.value === targetLang)?.label || "English";

    await streamAIChat({
      messages: [],
      mode: "translator",
      content: `Translate the following text to ${targetLabel}. Also explain any idioms or important vocabulary:\n\n${text}`,
      onDelta: (chunk) => setResult((prev) => prev + chunk),
      onDone: () => setLoading(false),
      onError: (err) => {
        Toast.show({ type: "error", text1: "Error", text2: err });
        setLoading(false);
      },
    });
  };

  const selectedLabel =
    languages.find((l) => l.value === targetLang)?.label || "English";

  return (
    <>
      <AIToolLayout
        title="Language Translator"
        description="Notes in any language"
        icon={<Languages size={20} className="text-primary" />}
        result={result}
        loading={loading}
      >
        <TextInput
          placeholder="Enter text to translate..."
          value={text}
          onChangeText={setText}
          multiline
          editable={!loading}
          className="bg-card border border-border rounded-xl p-3 text-foreground text-base min-h-[120px]"
          style={{ textAlignVertical: "top" }}
        />

        <Pressable
          onPress={() => setPickerOpen(true)}
          className="bg-card border border-border rounded-xl p-3 flex-row items-center justify-between"
        >
          <Text className="text-foreground">
            Translate to: {selectedLabel}
          </Text>
          <ChevronDown size={16} className="text-muted-foreground" />
        </Pressable>

        <Button
          onPress={handleTranslate}
          disabled={loading || !text.trim()}
          className="bg-primary"
        >
          <View className="flex-row items-center gap-2">
            <Languages size={16} className="text-primary-foreground" />
            <Text className="text-primary-foreground font-medium">
              Translate & Explain
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

      <Modal
        visible={pickerOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerOpen(false)}
      >
        <Pressable
          className="flex-1 bg-black/40 justify-end"
          onPress={() => setPickerOpen(false)}
        >
          <View className="bg-card rounded-t-2xl max-h-[60%]">
            <View className="p-4 border-b border-border">
              <Text className="text-lg font-bold text-foreground">
                Select Language
              </Text>
            </View>
            <ScrollView className="p-2">
              {languages.map((lang) => (
                <Pressable
                  key={lang.value}
                  onPress={() => {
                    setTargetLang(lang.value);
                    setPickerOpen(false);
                  }}
                  className={`p-3 rounded-lg ${
                    targetLang === lang.value ? "bg-primary/10" : ""
                  }`}
                >
                  <Text
                    className={`text-base ${
                      targetLang === lang.value
                        ? "text-primary font-semibold"
                        : "text-foreground"
                    }`}
                  >
                    {lang.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
