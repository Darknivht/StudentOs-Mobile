import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Lightbulb, Sparkles, Copy, Check } from "lucide-react-native";
import { useSubscription } from "../../../hooks/useSubscription";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import FeatureGateSheet from "../../../components/subscription/FeatureGateSheet";
import { ErrorFallback } from "../../../components/ErrorFallback";
import { streamAIChat, formatAIResponse } from "../../../lib/ai";
import Markdown from "react-native-markdown-display";
import Toast from "react-native-toast-message";
import * as Clipboard from "expo-clipboard";

export { ErrorFallback as ErrorBoundary };

export default function MnemonicGeneratorScreen() {
  const router = useRouter();
  const { gateFeature, incrementUsage } = useSubscription();
  const [gateData, setGateData] = useState<any>(null);
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateMnemonic = async () => {
    if (!input.trim()) return;
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
      mode: "mnemonic",
      content: input,
      onDelta: (chunk) => setResult((r) => r + chunk),
      onDone: () => setLoading(false),
      onError: (err) => {
        Toast.show({ type: "error", text1: "Error", text2: err });
        setLoading(false);
      },
    });
  };

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    Toast.show({ type: "success", text1: "Copied!", text2: "Mnemonics copied" });
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-6 gap-5">
        <View className="flex-row items-center gap-3">
          <Pressable onPress={() => router.back()}>
            <Text className="text-sm text-primary font-medium">← Back</Text>
          </Pressable>
          <View className="flex-1">
            <Text className="text-xl font-bold text-foreground">
              Mnemonic Generator
            </Text>
            <Text className="text-sm text-muted-foreground">
              Funny rhymes & acronyms to remember
            </Text>
          </View>
          <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center">
            <Lightbulb size={20} className="text-primary" />
          </View>
        </View>

        <View className="gap-4">
          <View>
            <Text className="text-sm font-medium text-foreground mb-2">
              What do you need to memorize?
            </Text>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder={`Enter terms, lists, or concepts...\n\nExample:\n- Planets: Mercury, Venus, Earth...\n- Biological classification: Kingdom, Phylum...`}
              multiline
              numberOfLines={6}
              className="bg-card border border-border rounded-xl p-3 text-foreground text-sm min-h-[150px] align-text-top"
              style={{ textAlignVertical: "top" }}
            />
          </View>

          <Button
            onPress={generateMnemonic}
            disabled={loading || !input.trim()}
            className="w-full bg-primary"
          >
            <View className="flex-row items-center gap-2">
              {loading ? (
                <ActivityIndicator size="small" className="text-primary-foreground" />
              ) : (
                <Sparkles size={16} className="text-primary-foreground" />
              )}
              <Text className="text-primary-foreground font-medium">
                Generate Mnemonics
              </Text>
            </View>
          </Button>
        </View>

        {(loading || result) && (
          <Card>
            <View className="p-3 bg-muted border-b border-border flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Lightbulb size={16} className="text-primary" />
                <Text className="font-medium text-sm text-foreground">
                  {loading ? "Creating memory aids..." : "Your Mnemonics"}
                </Text>
              </View>
              {result && !loading && (
                <Pressable onPress={copyToClipboard}>
                  {copied ? (
                    <Check size={16} className="text-green-500" />
                  ) : (
                    <Copy size={16} className="text-foreground" />
                  )}
                </Pressable>
              )}
            </View>
            <CardContent className="p-4">
              {loading ? (
                <View className="items-center py-8">
                  <ActivityIndicator size="large" className="text-primary" />
                </View>
              ) : (
                <Markdown>{formatAIResponse(result)}</Markdown>
              )}
            </CardContent>
          </Card>
        )}
      </View>
    <FeatureGateSheet
      open={!!gateData}
      onOpenChange={() => setGateData(null)}
        feature="AI calls"
        currentUsage={gateData?.currentUsage || 0}
        limit={gateData?.limit || 0}
        isLifetime={gateData?.isLifetime}
        requiredTier={gateData?.requiredTier}
      />
    </ScrollView>
  );
}
