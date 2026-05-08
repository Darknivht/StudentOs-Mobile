import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AlertTriangle, Target } from "lucide-react-native";
import { supabase } from "../../../services/supabase";
import { useAuth } from "../../../hooks/useAuthContext";
import { Button } from "../../../components/ui/button";
import { Progress } from "../../../components/ui/progress";
import { ErrorFallback } from "../../../components/ErrorFallback";

export { ErrorFallback as ErrorBoundary };

interface WeakTopic {
  topicId: string;
  topicName: string;
  accuracy: number;
  attempts: number;
}

export default function WeaknessScreen() {
  const { examTypeId, subjectId, subjectName } = useLocalSearchParams<{
    examTypeId: string;
    subjectId: string;
    subjectName: string;
  }>();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [weakTopics, setWeakTopics] = useState<WeakTopic[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data: attempts } = await supabase
        .from("exam_attempts")
        .select("is_correct, topic_id")
        .eq("user_id", user.id)
        .eq("exam_type_id", examTypeId)
        .eq("subject_id", subjectId)
        .not("topic_id", "is", null);

      const { data: topics } = await supabase
        .from("exam_topics")
        .select("id, name")
        .eq("subject_id", subjectId);

      const topicMap = new Map<string, string>();
      (topics || []).forEach((t: any) => topicMap.set(t.id, t.name));

      const byTopic = new Map<string, { total: number; correct: number }>();
      (attempts || []).forEach((a: any) => {
        if (!a.topic_id) return;
        const prev = byTopic.get(a.topic_id) || { total: 0, correct: 0 };
        byTopic.set(a.topic_id, {
          total: prev.total + 1,
          correct: prev.correct + (a.is_correct ? 1 : 0),
        });
      });

      const weak: WeakTopic[] = [];
      byTopic.forEach((v, k) => {
        const acc = Math.round((v.correct / v.total) * 100);
        if (acc < 60 && v.total >= 3) {
          weak.push({
            topicId: k,
            topicName: topicMap.get(k) || "Unknown",
            accuracy: acc,
            attempts: v.total,
          });
        }
      });
      weak.sort((a, b) => a.accuracy - b.accuracy);
      setWeakTopics(weak);
      setLoading(false);
    };
    fetch();
  }, [user, examTypeId, subjectId]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" className="text-primary" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-6 gap-5">
        <Pressable onPress={() => router.back()}>
          <Text className="text-sm text-primary font-medium">← Back</Text>
        </Pressable>

        <View className="flex-row items-center gap-1">
          <AlertTriangle size={18} className="text-yellow-500" />
          <Text className="text-lg font-bold text-foreground">
            Weak Topics — {subjectName}
          </Text>
        </View>

        {weakTopics.length === 0 ? (
          <View className="items-center py-16">
            <Text className="text-4xl mb-3">🎯</Text>
            <Text className="font-semibold text-foreground">
              No weak topics found!
            </Text>
            <Text className="text-sm text-muted-foreground mt-1">
              Keep practicing to build enough data, or you're doing great!
            </Text>
            <Button
              variant="outline"
              onPress={() => router.back()}
              className="mt-4"
            >
              <Text className="text-foreground">Go Back</Text>
            </Button>
          </View>
        ) : (
          <View className="gap-3">
            {weakTopics.map((wt) => (
              <View
                key={wt.topicId}
                className="p-4 rounded-2xl bg-card border border-destructive/20"
              >
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="font-semibold text-foreground text-sm flex-1">
                    {wt.topicName}
                  </Text>
                  <Text className="text-sm font-bold text-destructive">
                    {wt.accuracy}%
                  </Text>
                </View>
                <Progress value={wt.accuracy} />
                <View className="flex-row items-center justify-between mt-2">
                  <Text className="text-xs text-muted-foreground">
                    {wt.attempts} attempts
                  </Text>
                  <Pressable
                    onPress={() =>
                      router.push({
                        pathname: "/exams/practice",
                        params: {
                          examTypeId,
                          subjectId,
                          subjectName,
                          mode: "topic",
                          topicId: wt.topicId,
                        },
                      })
                    }
                    className="flex-row items-center gap-1"
                  >
                    <Target size={12} className="text-primary" />
                    <Text className="text-xs font-medium text-primary">
                      Practice This
                    </Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
