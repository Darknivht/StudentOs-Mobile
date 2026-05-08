import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Loader2, BookOpen, Target, Clock, Lightbulb } from "lucide-react-native";
import { Button } from "../../../components/ui/button";
import { supabase } from "../../../services/supabase";
import Markdown from "react-native-markdown-display";
import { env } from "../../../lib/env";
import { ErrorFallback } from "../../../components/ErrorFallback";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

export { ErrorFallback as ErrorBoundary };

export default function StudyPlanScreen() {
  const { examTypeId, subjectId, subjectName } = useLocalSearchParams<{
    examTypeId: string;
    subjectId: string;
    subjectName: string;
  }>();
  const router = useRouter();
  const [plan, setPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const generatePlan = async () => {
    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const resp = await fetch(
        `${env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/exam-practice`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token || env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            action: "generate-study-plan",
            exam_type_id: examTypeId,
            subject_id: subjectId,
          }),
        }
      );

      const result = await resp.json();
      if (result.plan) {
        setPlan(
          typeof result.plan === "string"
            ? result.plan
            : JSON.stringify(result.plan, null, 2)
        );
      } else if (result.error) {
        setPlan(`Could not generate plan: ${result.error}`);
      }
      setGenerated(true);
    } catch (err: any) {
      setPlan(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    if (!plan) return;
    try {
      const html = `
        <html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 24px; line-height: 1.6;">
          <h1 style="margin-bottom: 8px;">Study Plan - ${subjectName}</h1>
          <div>${plan.replace(/\n/g, "<br/>")}</div>
        </body></html>
      `;
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: `Study Plan - ${subjectName}`,
        });
      }
    } catch {}
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-6 gap-5">
        <Pressable onPress={() => router.back()}>
          <Text className="text-sm text-primary font-medium">← Back</Text>
        </Pressable>

        <View className="flex-row items-center gap-2">
          <Lightbulb size={18} className="text-foreground" />
          <Text className="text-lg font-bold text-foreground">
            AI Study Plan — {subjectName}
          </Text>
        </View>

        {!generated && !loading && (
          <View className="items-center py-12 gap-4">
            <View className="w-16 h-16 rounded-2xl bg-primary/10 items-center justify-center">
              <BookOpen size={28} className="text-primary" />
            </View>
            <Text className="font-semibold text-foreground">
              Personalized Study Plan
            </Text>
            <Text className="text-sm text-muted-foreground text-center max-w-sm">
              AI will analyze your performance, identify weak areas, and create
              a tailored study plan with priorities and recommendations.
            </Text>
            <View className="flex-row flex-wrap justify-center gap-3">
              <View className="flex-row items-center gap-1">
                <Target size={12} className="text-muted-foreground" />
                <Text className="text-xs text-muted-foreground">
                  Weak topic focus
                </Text>
              </View>
              <View className="flex-row items-center gap-1">
                <Clock size={12} className="text-muted-foreground" />
                <Text className="text-xs text-muted-foreground">
                  Time allocation
                </Text>
              </View>
              <View className="flex-row items-center gap-1">
                <BookOpen size={12} className="text-muted-foreground" />
                <Text className="text-xs text-muted-foreground">
                  Mode suggestions
                </Text>
              </View>
            </View>
            <Button onPress={generatePlan} className="mt-2">
              <Text className="text-primary-foreground">
                Generate My Plan
              </Text>
            </Button>
          </View>
        )}

        {loading && (
          <View className="items-center justify-center py-20 gap-3">
            <ActivityIndicator size="large" className="text-primary" />
            <Text className="text-sm text-muted-foreground">
              Analyzing your performance...
            </Text>
          </View>
        )}

        {plan && (
          <View className="p-4 rounded-2xl bg-card border border-border">
            <Markdown style={{ body: { fontSize: 14, lineHeight: 20 } }}>
              {plan}
            </Markdown>
          </View>
        )}

        {generated && (
          <View className="flex-row gap-2">
            <Button variant="outline" onPress={generatePlan} disabled={loading}>
              <Text className="text-foreground">Regenerate</Text>
            </Button>
            {plan && (
              <Button variant="outline" onPress={downloadPDF}>
                <Text className="text-foreground">Download PDF</Text>
              </Button>
            )}
            <Button variant="outline" onPress={() => router.back()}>
              <Text className="text-foreground">Back to Modes</Text>
            </Button>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
