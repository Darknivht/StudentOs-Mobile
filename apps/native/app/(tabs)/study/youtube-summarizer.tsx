import { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { Video, AlertTriangle, Info } from "lucide-react-native";
import AIToolLayout from "../../../components/ai-tools/AIToolLayout";
import { streamAIChat } from "../../../lib/ai";
import { useSubscription } from "../../../hooks/useSubscription";
import { Button } from "../../../components/ui/button";
import { ErrorFallback } from "../../../components/ErrorFallback";
import FeatureGateSheet from "../../../components/subscription/FeatureGateSheet";
import Toast from "react-native-toast-message";

export { ErrorFallback as ErrorBoundary };

export default function YouTubeSummarizerScreen() {
  const { gateFeature, incrementUsage } = useSubscription();
  const [gateData, setGateData] = useState<any>(null);
  const [url, setUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSummarize = async () => {
    const gate = gateFeature("ai");
    if (!gate.allowed) {
      setGateData(gate);
      return;
    }

    const content = transcript.trim() || url.trim();
    if (!content) {
      Toast.show({
        type: "error",
        text1: "Missing input",
        text2: "Please paste the video transcript.",
      });
      return;
    }

    if (!transcript.trim() && url.trim()) {
      Toast.show({
        type: "info",
        text1: "URL-only mode",
        text2: "For accurate results, paste the transcript instead. URL summaries are topic-based estimates only.",
      });
    }

    await incrementUsage("ai");
    setLoading(true);
    setResult("");

    await streamAIChat({
      messages: [],
      mode: "youtube_summary",
      content: transcript.trim()
        ? `Video Transcript:\n${transcript}`
        : `YouTube URL (no transcript provided): ${url}\n\nIMPORTANT: The user only provided a URL, NOT a transcript. You CANNOT watch this video. Clearly state that this is a topic-based inference, not a real summary. Extract any keywords from the URL to guess the topic.`,
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
      title="YouTube Summarizer"
      description="Paste transcript to key points"
      icon={<Video size={20} className="text-primary" />}
      result={result}
      loading={loading}
    >
      <View className="p-3 rounded-xl bg-primary/5 border border-primary/20 gap-2">
        <View className="flex-row items-start gap-2">
          <Info size={16} className="text-primary flex-shrink-0 mt-0.5" />
          <View>
            <Text className="text-xs text-muted-foreground">
              <Text className="font-medium text-foreground">
                How to get a transcript:
              </Text>
              {"\n"}1. Open the YouTube video
              {"\n"}2. Click the "..." button below the video
              {"\n"}3. Select "Show transcript"
              {"\n"}4. Copy all the text and paste below
            </Text>
          </View>
        </View>
      </View>

      <TextInput
        placeholder="Paste video transcript here (recommended for accurate results)..."
        value={transcript}
        onChangeText={setTranscript}
        multiline
        editable={!loading}
        className="bg-card border border-border rounded-xl p-3 text-foreground text-base min-h-[140px]"
        style={{ textAlignVertical: "top" }}
      />

      <View className="flex-row items-center gap-2">
        <View className="h-px flex-1 bg-border" />
        <Text className="text-sm text-muted-foreground">
          or provide URL (less accurate)
        </Text>
        <View className="h-px flex-1 bg-border" />
      </View>

      <View className="gap-1">
        <TextInput
          placeholder="Paste YouTube URL..."
          value={url}
          onChangeText={setUrl}
          editable={!loading}
          className="bg-card border border-border rounded-xl p-3 text-foreground text-base"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
        />
        {url.trim() && !transcript.trim() && (
          <View className="flex-row items-center gap-1 px-1">
            <AlertTriangle size={12} className="text-amber-500" />
            <Text className="text-xs text-amber-500">
              URL-only summaries are topic estimates. Paste transcript for
              accuracy.
            </Text>
          </View>
        )}
      </View>

      <Button
        onPress={handleSummarize}
        disabled={loading || (!url.trim() && !transcript.trim())}
        className="bg-primary"
      >
        <View className="flex-row items-center gap-2">
          <Video size={16} className="text-primary-foreground" />
          <Text className="text-primary-foreground font-medium">
            {transcript.trim()
              ? "Summarize Transcript"
              : "Estimate from URL"}
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
