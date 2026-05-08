import { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { FileText, Copy, Check, Printer } from "lucide-react-native";
import { supabase } from "../../../services/supabase";
import { useAuth } from "../../../hooks/useAuthContext";
import { useSubscription } from "../../../hooks/useSubscription";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import FeatureGateSheet from "../../../components/subscription/FeatureGateSheet";
import { ErrorFallback } from "../../../components/ErrorFallback";
import { streamAIChat, formatAIResponse } from "../../../lib/ai";
import Markdown from "react-native-markdown-display";
import Toast from "react-native-toast-message";
import Clipboard from "@react-native-clipboard/clipboard";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

export { ErrorFallback as ErrorBoundary };

export default function CheatSheetScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { gateFeature, incrementUsage } = useSubscription();
  const [gateData, setGateData] = useState<any>(null);
  const [notes, setNotes] = useState<{ id: string; title: string }[]>([]);
  const [cheatSheet, setCheatSheet] = useState("");
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState("");

  useEffect(() => {
    if (user) fetchNotes();
  }, [user]);

  const fetchNotes = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("notes")
      .select("id, title")
      .eq("user_id", user?.id || "")
      .order("created_at", { ascending: false })
      .limit(20);
    setNotes(data || []);
    setLoading(false);
  };

  const generateCheatSheet = async (noteId: string, noteTitle: string) => {
    const gate = gateFeature("ai");
    if (!gate.allowed) {
      setGateData(gate);
      return;
    }
    await incrementUsage("ai");
    setGenerating(true);
    setSelectedTitle(noteTitle);

    try {
      const { data: note } = await supabase
        .from("notes")
        .select("content, title")
        .eq("id", noteId)
        .single();
      if (!note?.content) throw new Error("No content");

      await streamAIChat({
        messages: [],
        mode: "cheatsheet",
        content: note.content,
        onDelta: (chunk) => setCheatSheet((c) => c + chunk),
        onDone: () => setGenerating(false),
        onError: (err) => {
          Toast.show({ type: "error", text1: "Error", text2: err });
          setGenerating(false);
        },
      });
    } catch {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to generate cheat sheet",
      });
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    Clipboard.setString(cheatSheet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    Toast.show({ type: "success", text1: "Copied!" });
  };

  const handlePrint = async () => {
    try {
      const html = `<html><body><h1>Cheat Sheet: ${selectedTitle}</h1><div style="white-space:pre-wrap;font-family:sans-serif;">${cheatSheet}</div></body></html>`;
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri);
    } catch {
      Toast.show({ type: "error", text1: "Error", text2: "Failed to export" });
    }
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
              Cheat Sheet Creator
            </Text>
            <Text className="text-sm text-muted-foreground">
              One-page printable study guides
            </Text>
          </View>
          <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center">
            <FileText size={20} className="text-primary" />
          </View>
        </View>

        {!cheatSheet && !generating && (
          <View className="gap-3">
            <Text className="text-sm font-medium text-muted-foreground">
              Select a note:
            </Text>
            {loading ? (
              <ActivityIndicator size="large" className="text-primary" />
            ) : notes.length === 0 ? (
              <Text className="text-center text-muted-foreground py-8">
                No notes yet. Create notes first!
              </Text>
            ) : (
              notes.map((note) => (
                <Pressable
                  key={note.id}
                  onPress={() => generateCheatSheet(note.id, note.title)}
                >
                  <Card>
                    <CardContent className="p-4">
                      <Text className="font-medium text-foreground">
                        {note.title}
                      </Text>
                    </CardContent>
                  </Card>
                </Pressable>
              ))
            )}
          </View>
        )}

        {(generating || cheatSheet) && (
          <Card>
            <View className="p-3 bg-muted border-b border-border flex-row items-center justify-between">
              <Text className="font-medium text-sm text-foreground">
                {generating ? "Generating..." : "Your Cheat Sheet"}
              </Text>
              {cheatSheet && !generating && (
                <View className="flex-row items-center gap-2">
                  <Pressable onPress={handleCopy}>
                    {copied ? (
                      <Check size={16} className="text-green-500" />
                    ) : (
                      <Copy size={16} className="text-foreground" />
                    )}
                  </Pressable>
                  <Pressable onPress={handlePrint}>
                    <Printer size={16} className="text-foreground" />
                  </Pressable>
                </View>
              )}
            </View>
            <CardContent className="p-4">
              {generating ? (
                <View className="items-center py-8">
                  <ActivityIndicator size="large" className="text-primary" />
                </View>
              ) : (
                <Markdown>{formatAIResponse(cheatSheet)}</Markdown>
              )}
            </CardContent>
            {cheatSheet && !generating && (
              <View className="p-3 border-t border-border">
                <Button
                  variant="outline"
                  onPress={() => {
                    setCheatSheet("");
                    setSelectedTitle("");
                  }}
                  className="w-full"
                >
                  <Text className="text-foreground">
                    Create Another Cheat Sheet
                  </Text>
                </Button>
              </View>
            )}
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
