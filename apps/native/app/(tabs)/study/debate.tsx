import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Swords,
  MessageSquare,
  History,
  Trash2,
  Save,
  Loader2,
} from "lucide-react-native";
import Animated, { FadeIn, SlideInRight } from "react-native-reanimated";
import { streamAIChat } from "../../../lib/ai";
import { formatAIResponse } from "../../../lib/ai";
import { useSubscription } from "../../../hooks/useSubscription";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { ErrorFallback } from "../../../components/ErrorFallback";
import FeatureGateSheet from "../../../components/subscription/FeatureGateSheet";
import { appStorage } from "../../../services/app-storage";
import Markdown from "react-native-markdown-display";
import Toast from "react-native-toast-message";

export { ErrorFallback as ErrorBoundary };

interface DebateMessage {
  role: "user" | "ai";
  content: string;
}

interface SavedDebate {
  id: string;
  topic: string;
  messages: DebateMessage[];
  createdAt: string;
}

const DEBATES_STORAGE_KEY = "studentos_saved_debates";

export default function DebatePartnerScreen() {
  const router = useRouter();
  const { gateFeature, incrementUsage } = useSubscription();
  const [gateData, setGateData] = useState<any>(null);
  const [topic, setTopic] = useState("");
  const [userPosition, setUserPosition] = useState("");
  const [debate, setDebate] = useState<DebateMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [savedDebates, setSavedDebates] = useState<SavedDebate[]>([]);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const stored = appStorage.getItemSync(DEBATES_STORAGE_KEY);
    if (stored) {
      try {
        setSavedDebates(JSON.parse(stored));
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (debate.length > 0) {
      setTimeout(() => {
        scrollRef.current?.scrollToEnd?.({ animated: true });
      }, 100);
    }
  }, [debate]);

  const saveDebate = () => {
    if (debate.length < 2) return;
    const newDebate: SavedDebate = {
      id: Date.now().toString(),
      topic,
      messages: debate,
      createdAt: new Date().toISOString(),
    };
    const updated = [newDebate, ...savedDebates].slice(0, 20);
    setSavedDebates(updated);
    appStorage.setItemSync(DEBATES_STORAGE_KEY, JSON.stringify(updated));
    Toast.show({
      type: "success",
      text1: "Debate Saved!",
      text2: "You can review it later from history.",
    });
  };

  const loadDebate = (saved: SavedDebate) => {
    setTopic(saved.topic);
    setDebate(saved.messages);
    setStarted(true);
    setShowHistory(false);
  };

  const deleteDebate = (id: string) => {
    const updated = savedDebates.filter((d) => d.id !== id);
    setSavedDebates(updated);
    appStorage.setItemSync(DEBATES_STORAGE_KEY, JSON.stringify(updated));
  };

  const startDebate = async () => {
    if (!topic.trim() || !userPosition.trim()) return;
    const gate = gateFeature("ai");
    if (!gate.allowed) {
      setGateData(gate);
      return;
    }
    await incrementUsage("ai");
    setLoading(true);
    setStarted(true);
    setDebate([{ role: "user", content: userPosition }]);

    let response = "";
    await streamAIChat({
      messages: [
        { role: "user", content: `Topic: ${topic}\n\nMy position: ${userPosition}` },
      ],
      mode: "debate",
      content: `Topic: ${topic}\n\nOpponent's position: ${userPosition}\n\nArgue the opposite view convincingly.`,
      onDelta: (chunk) => {
        response += chunk;
        setDebate([
          { role: "user", content: userPosition },
          { role: "ai", content: response },
        ]);
      },
      onDone: () => setLoading(false),
      onError: (err) => {
        Toast.show({ type: "error", text1: "Error", text2: err });
        setLoading(false);
      },
    });
  };

  const continueDebate = async () => {
    if (!userInput.trim()) return;
    const gate = gateFeature("ai");
    if (!gate.allowed) {
      setGateData(gate);
      return;
    }
    await incrementUsage("ai");
    const newDebate = [...debate, { role: "user" as const, content: userInput }];
    setDebate(newDebate);
    setUserInput("");
    setLoading(true);

    let response = "";
    const messages = newDebate.map((d) => ({
      role: d.role === "ai" ? ("assistant" as const) : ("user" as const),
      content: d.content,
    }));

    await streamAIChat({
      messages,
      mode: "debate",
      content: `Topic: ${topic}\n\nContinue arguing the opposite position. Challenge their latest point: "${userInput}"`,
      onDelta: (chunk) => {
        response += chunk;
        setDebate([...newDebate, { role: "ai", content: response }]);
      },
      onDone: () => setLoading(false),
      onError: (err) => {
        Toast.show({ type: "error", text1: "Error", text2: err });
        setLoading(false);
      },
    });
  };

  if (showHistory) {
    return (
      <ScrollView className="flex-1 bg-background">
        <View className="p-6 gap-4">
          <View className="flex-row items-center gap-3">
            <Pressable onPress={() => setShowHistory(false)}>
              <ArrowLeft size={20} className="text-foreground" />
            </Pressable>
            <View className="flex-1">
              <Text className="text-xl font-bold text-foreground">
                Debate History
              </Text>
              <Text className="text-sm text-muted-foreground">
                {savedDebates.length} saved debates
              </Text>
            </View>
          </View>

          {savedDebates.length === 0 ? (
            <Text className="text-center text-muted-foreground py-12">
              No saved debates yet
            </Text>
          ) : (
            savedDebates.map((d) => (
              <Card key={d.id}>
                <CardContent className="p-4 flex-row items-start justify-between gap-2">
                  <Pressable
                    onPress={() => loadDebate(d)}
                    className="flex-1"
                  >
                    <Text className="font-medium text-foreground text-sm">
                      {d.topic}
                    </Text>
                    <Text className="text-xs text-muted-foreground mt-1">
                      {d.messages.length} messages &bull;{" "}
                      {new Date(d.createdAt).toLocaleDateString()}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => deleteDebate(d.id)}
                    className="p-2"
                  >
                    <Trash2 size={16} className="text-muted-foreground" />
                  </Pressable>
                </CardContent>
              </Card>
            ))
          )}
        </View>
      </ScrollView>
    );
  }

  if (!started) {
    return (
      <ScrollView className="flex-1 bg-background">
        <View className="p-6 gap-5">
          <View className="flex-row items-center gap-3">
            <Pressable onPress={() => router.back()}>
              <ArrowLeft size={20} className="text-foreground" />
            </Pressable>
            <View className="flex-1">
              <Text className="text-xl font-bold text-foreground">
                Debate Partner
              </Text>
              <Text className="text-sm text-muted-foreground">
                AI argues the opposite view
              </Text>
            </View>
            <Pressable
              onPress={() => setShowHistory(true)}
              className="relative p-2"
            >
              <History size={20} className="text-foreground" />
              {savedDebates.length > 0 && (
                <View className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary items-center justify-center">
                  <Text className="text-primary-foreground text-[10px] font-bold">
                    {savedDebates.length}
                  </Text>
                </View>
              )}
            </Pressable>
          </View>

          <View className="gap-4">
            <View>
              <Text className="text-sm font-medium text-foreground mb-2">
                Debate Topic
              </Text>
              <TextInput
                value={topic}
                onChangeText={setTopic}
                placeholder="e.g., Should social media be banned for teenagers?"
                multiline
                className="bg-card border border-border rounded-xl p-3 text-foreground text-base min-h-[80px]"
                style={{ textAlignVertical: "top" }}
              />
            </View>
            <View>
              <Text className="text-sm font-medium text-foreground mb-2">
                Your Position
              </Text>
              <TextInput
                value={userPosition}
                onChangeText={setUserPosition}
                placeholder="State your argument and why you believe it..."
                multiline
                className="bg-card border border-border rounded-xl p-3 text-foreground text-base min-h-[120px]"
                style={{ textAlignVertical: "top" }}
              />
            </View>
            <Button
              onPress={startDebate}
              disabled={!topic.trim() || !userPosition.trim()}
              className="bg-primary"
            >
              <View className="flex-row items-center gap-2">
                <Swords size={16} className="text-primary-foreground" />
                <Text className="text-primary-foreground font-medium">
                  Start Debate
                </Text>
              </View>
            </Button>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === "android" ? undefined : "padding"}
      keyboardVerticalOffset={90}
    >
      <View className="p-3 border-b border-border flex-row items-center gap-2">
        <Pressable onPress={() => router.back()}>
          <ArrowLeft size={20} className="text-foreground" />
        </Pressable>
        <View className="flex-1 min-w-0">
          <Text className="text-sm font-bold text-foreground" numberOfLines={1}>
            Debate: {topic}
          </Text>
        </View>
        <Pressable onPress={saveDebate} className="p-2">
          <Save size={18} className="text-foreground" />
        </Pressable>
      </View>

      <ScrollView
        ref={scrollRef}
        className="flex-1 px-3 py-4"
        contentContainerStyle={{ gap: 12, paddingBottom: 16 }}
      >
        {debate.map((msg, i) => (
          <Animated.View
            key={i}
            entering={SlideInRight.duration(200)}
            className={`flex ${
              msg.role === "user" ? "items-end" : "items-start"
            }`}
          >
            <View
              className={`max-w-[85%] p-3 rounded-2xl ${
                msg.role === "user"
                  ? "bg-primary rounded-br-sm"
                  : "bg-muted rounded-bl-sm"
              }`}
            >
              {msg.role === "ai" ? (
                <Markdown
                  style={{
                    body: { color: "transparent" },
                    paragraph: { color: undefined },
                    heading1: { color: undefined },
                    heading2: { color: undefined },
                    heading3: { color: undefined },
                  }}
                >
                  {formatAIResponse(msg.content)}
                </Markdown>
              ) : (
                <Text className="text-sm text-primary-foreground whitespace-pre-wrap">
                  {msg.content}
                </Text>
              )}
            </View>
          </Animated.View>
        ))}
        {loading && (
          <View className="items-start">
            <View className="p-4 rounded-2xl bg-muted">
              <ActivityIndicator size="small" className="text-primary" />
            </View>
          </View>
        )}
      </ScrollView>

      <View className="p-3 border-t border-border gap-2">
        <TextInput
          value={userInput}
          onChangeText={setUserInput}
          placeholder="Counter their argument..."
          multiline
          editable={!loading}
          className="bg-card border border-border rounded-xl p-3 text-foreground text-base min-h-[60px]"
          style={{ textAlignVertical: "top" }}
        />
        <Button
          onPress={continueDebate}
          disabled={loading || !userInput.trim()}
          className="bg-primary"
        >
          <View className="flex-row items-center gap-2">
            <MessageSquare size={16} className="text-primary-foreground" />
            <Text className="text-primary-foreground font-medium">Respond</Text>
          </View>
        </Button>
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
    </KeyboardAvoidingView>
  );
}
