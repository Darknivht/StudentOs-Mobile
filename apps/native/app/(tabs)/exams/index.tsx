import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import { ArrowRight, GraduationCap } from "lucide-react-native";
import { useRouter } from "expo-router";
import { supabase } from "../../../services/supabase";
import { useSubscription } from "../../../hooks/useSubscription";
import { Card, CardContent } from "../../../components/ui/card";
import FeatureGateSheet from "../../../components/subscription/FeatureGateSheet";
import { ErrorFallback } from "../../../components/ErrorFallback";

export { ErrorFallback as ErrorBoundary };

interface ExamType {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  country: string | null;
  exam_mode: string;
  subjects_required: number;
  time_limit_minutes: number;
  questions_per_subject: number;
  logo_url: string | null;
}

export default function ExamsScreen() {
  const router = useRouter();
  const { subscription, loading: subLoading } = useSubscription();
  const [exams, setExams] = useState<ExamType[]>([]);
  const [loading, setLoading] = useState(true);
  const [gateOpen, setGateOpen] = useState(false);

  useEffect(() => {
    const fetchExams = async () => {
      const { data } = await supabase
        .from("exam_types")
        .select("*")
        .eq("is_active", true)
        .order("name");
      setExams(
        (data || []).map((d: any) => ({
          ...d,
          exam_mode: d.exam_mode || "per_subject",
          subjects_required: d.subjects_required || 1,
          time_limit_minutes: d.time_limit_minutes || 60,
          questions_per_subject: d.questions_per_subject || 40,
          logo_url: d.logo_url || null,
        }))
      );
      setLoading(false);
    };
    fetchExams();
  }, []);

  useEffect(() => {
    if (!subLoading && subscription.tier === "free") {
      setGateOpen(true);
    }
  }, [subLoading, subscription.tier]);

  const handleSelect = (exam: ExamType) => {
    router.push({
      pathname: "/exams/subjects",
      params: {
        examTypeId: exam.id,
        examName: exam.name,
        examMode: exam.exam_mode,
        subjectsRequired: String(exam.subjects_required),
        timeLimitMinutes: String(exam.time_limit_minutes),
        questionsPerSubject: String(exam.questions_per_subject),
      },
    });
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-6 pt-12">
        <Text className="text-2xl font-bold text-foreground mb-1">
          Exam Prep
        </Text>
        <Text className="text-muted-foreground mb-6">
          Practice past questions & ace your exams
        </Text>

        {loading ? (
          <View className="items-center justify-center py-20">
            <ActivityIndicator size="large" className="text-primary" />
          </View>
        ) : exams.length === 0 ? (
          <View className="items-center py-20">
            <Text className="text-4xl mb-3">📝</Text>
            <Text className="font-semibold text-foreground">
              No exams available yet
            </Text>
            <Text className="text-sm text-muted-foreground mt-1">
              Check back soon — exams are being added!
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            {exams.map((exam) => (
              <Pressable
                key={exam.id}
                onPress={() => handleSelect(exam)}
                className="active:scale-[0.98]"
              >
                <Card>
                  <CardContent className="p-4 flex-row items-center gap-4">
                    {exam.icon ? (
                      <Text className="text-3xl">{exam.icon}</Text>
                    ) : (
                      <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center">
                        <GraduationCap size={20} className="text-primary" />
                      </View>
                    )}
                    <View className="flex-1 min-w-0">
                      <Text className="font-semibold text-foreground">
                        {exam.name}
                      </Text>
                      {exam.description ? (
                        <Text
                          className="text-xs text-muted-foreground mt-0.5"
                          numberOfLines={1}
                        >
                          {exam.description}
                        </Text>
                      ) : null}
                      <View className="flex-row gap-2 mt-1">
                        {exam.country ? (
                          <View className="bg-muted rounded-full px-2 py-0.5">
                            <Text className="text-[10px] text-muted-foreground">
                              {exam.country}
                            </Text>
                          </View>
                        ) : null}
                        {exam.exam_mode === "multi_subject" ? (
                          <View className="bg-primary/10 rounded-full px-2 py-0.5">
                            <Text className="text-[10px] text-primary font-medium">
                              Full CBT
                            </Text>
                          </View>
                        ) : null}
                      </View>
                    </View>
                    <ArrowRight size={18} className="text-muted-foreground" />
                  </CardContent>
                </Card>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      <FeatureGateSheet
        open={gateOpen}
        onOpenChange={(open) => {
          setGateOpen(open);
        }}
        feature="Exam Prep access"
        currentUsage={0}
        limit={0}
        requiredTier="plus"
      />
    </ScrollView>
  );
}
