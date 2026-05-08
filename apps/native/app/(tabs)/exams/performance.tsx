import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  Target,
  Zap,
  BarChart3,
} from "lucide-react-native";
import { supabase } from "../../../services/supabase";
import { useAuth } from "../../../hooks/useAuthContext";
import { Button } from "../../../components/ui/button";
import { Progress } from "../../../components/ui/progress";
import { Card, CardContent } from "../../../components/ui/card";
import { ErrorFallback } from "../../../components/ErrorFallback";
import {
  CartesianChart,
  Line,
  Bar,
} from "victory-native";
import { Dimensions } from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;

export { ErrorFallback as ErrorBoundary };

interface TopicPerf {
  topicId: string | null;
  topicName: string;
  total: number;
  correct: number;
  pct: number;
  avgTime: number;
}

interface SessionInfo {
  sessionId: string;
  date: string;
  total: number;
  correct: number;
  pct: number;
  totalTime: number;
}

interface DifficultyBreakdown {
  difficulty: string;
  total: number;
  correct: number;
  pct: number;
}

export default function PerformanceScreen() {
  const { examTypeId, subjectId, subjectName } = useLocalSearchParams<{
    examTypeId: string;
    subjectId: string;
    subjectName: string;
  }>();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [overall, setOverall] = useState({ total: 0, correct: 0 });
  const [topicPerfs, setTopicPerfs] = useState<TopicPerf[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [trendTopics, setTrendTopics] = useState<string[]>([]);
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [diffBreakdown, setDiffBreakdown] = useState<DifficultyBreakdown[]>(
    []
  );
  const [improvementTrend, setImprovementTrend] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [avgTimePerQ, setAvgTimePerQ] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const { data: attempts } = await supabase
        .from("exam_attempts")
        .select(
          "is_correct, topic_id, created_at, session_id, time_spent_seconds, question_id"
        )
        .eq("user_id", user.id)
        .eq("exam_type_id", examTypeId)
        .eq("subject_id", subjectId)
        .order("created_at", { ascending: true });

      const { data: topics } = await supabase
        .from("exam_topics")
        .select("id, name")
        .eq("subject_id", subjectId);

      const questionIds = [
        ...new Set(
          (attempts || [])
            .map((a: any) => a.question_id)
            .filter(Boolean)
        ),
      ];
      let difficultyMap = new Map<string, string>();
      if (questionIds.length > 0) {
        const { data: questions } = await supabase
          .from("exam_questions")
          .select("id, difficulty")
          .in("id", questionIds.slice(0, 500));
        (questions || []).forEach((q: any) =>
          difficultyMap.set(q.id, q.difficulty)
        );
      }

      const topicMap = new Map<string, string>();
      (topics || []).forEach((t: any) => topicMap.set(t.id, t.name));

      const atts = attempts || [];
      const totalCorrect = atts.filter((a: any) => a.is_correct).length;
      setOverall({ total: atts.length, correct: totalCorrect });

      const timesArr = atts
        .filter(
          (a: any) =>
            a.time_spent_seconds && a.time_spent_seconds > 0
        )
        .map((a: any) => a.time_spent_seconds);
      setAvgTimePerQ(
        timesArr.length > 0
          ? Math.round(
              timesArr.reduce((a: number, b: number) => a + b, 0) /
                timesArr.length
            )
          : 0
      );

      const byTopic = new Map<
        string,
        { total: number; correct: number; totalTime: number; timeCount: number }
      >();
      atts.forEach((a: any) => {
        const key = a.topic_id || "_general";
        const prev = byTopic.get(key) || {
          total: 0,
          correct: 0,
          totalTime: 0,
          timeCount: 0,
        };
        byTopic.set(key, {
          total: prev.total + 1,
          correct: prev.correct + (a.is_correct ? 1 : 0),
          totalTime: prev.totalTime + (a.time_spent_seconds || 0),
          timeCount: prev.timeCount + (a.time_spent_seconds ? 1 : 0),
        });
      });

      const perfs: TopicPerf[] = [];
      byTopic.forEach((v, k) => {
        perfs.push({
          topicId: k === "_general" ? null : k,
          topicName:
            k === "_general"
              ? "General"
              : topicMap.get(k) || "Unknown Topic",
          total: v.total,
          correct: v.correct,
          pct: Math.round((v.correct / v.total) * 100),
          avgTime: v.timeCount > 0 ? Math.round(v.totalTime / v.timeCount) : 0,
        });
      });
      perfs.sort((a, b) => a.pct - b.pct);
      setTopicPerfs(perfs);

      const byDiff = new Map<string, { total: number; correct: number }>();
      atts.forEach((a: any) => {
        const diff =
          (a.question_id && difficultyMap.get(a.question_id)) || "medium";
        const prev = byDiff.get(diff) || { total: 0, correct: 0 };
        byDiff.set(diff, {
          total: prev.total + 1,
          correct: prev.correct + (a.is_correct ? 1 : 0),
        });
      });
      const diffArr: DifficultyBreakdown[] = [];
      ["easy", "medium", "hard"].forEach((d) => {
        const v = byDiff.get(d);
        if (v)
          diffArr.push({
            difficulty: d,
            total: v.total,
            correct: v.correct,
            pct: Math.round((v.correct / v.total) * 100),
          });
      });
      setDiffBreakdown(diffArr);

      const bySession = new Map<
        string,
        { date: string; total: number; correct: number; totalTime: number }
      >();
      atts.forEach((a: any) => {
        const prev = bySession.get(a.session_id) || {
          date: a.created_at,
          total: 0,
          correct: 0,
          totalTime: 0,
        };
        bySession.set(a.session_id, {
          date: prev.date < a.created_at ? prev.date : a.created_at,
          total: prev.total + 1,
          correct: prev.correct + (a.is_correct ? 1 : 0),
          totalTime: prev.totalTime + (a.time_spent_seconds || 0),
        });
      });
      const sessionArr: SessionInfo[] = [];
      bySession.forEach((v, k) => {
        sessionArr.push({
          sessionId: k,
          date: v.date,
          total: v.total,
          correct: v.correct,
          pct: Math.round((v.correct / v.total) * 100),
          totalTime: v.totalTime,
        });
      });
      sessionArr.sort((a, b) => b.date.localeCompare(a.date));
      setSessions(sessionArr.slice(0, 10));

      if (sessionArr.length > 0) {
        setBestScore(Math.max(...sessionArr.map((s) => s.pct)));
        if (sessionArr.length >= 4) {
          const recent = sessionArr.slice(
            0,
            Math.min(5, Math.floor(sessionArr.length / 2))
          );
          const early = sessionArr.slice(
            -Math.min(5, Math.floor(sessionArr.length / 2))
          );
          const recentAvg =
            recent.reduce((a, b) => a + b.pct, 0) / recent.length;
          const earlyAvg =
            early.reduce((a, b) => a + b.pct, 0) / early.length;
          setImprovementTrend(Math.round(recentAvg - earlyAvg));
        }
      }

      const sessionMap = new Map<
        string,
        Map<string, { total: number; correct: number }>
      >();
      atts.forEach((a: any) => {
        const date = a.created_at.split("T")[0];
        if (!sessionMap.has(date)) sessionMap.set(date, new Map());
        const dateMap = sessionMap.get(date)!;
        const ov = dateMap.get("Overall") || { total: 0, correct: 0 };
        dateMap.set("Overall", {
          total: ov.total + 1,
          correct: ov.correct + (a.is_correct ? 1 : 0),
        });
        const topicName = a.topic_id
          ? topicMap.get(a.topic_id) || "Unknown"
          : "General";
        const tv = dateMap.get(topicName) || { total: 0, correct: 0 };
        dateMap.set(topicName, {
          total: tv.total + 1,
          correct: tv.correct + (a.is_correct ? 1 : 0),
        });
      });

      const allTopicNames = new Set<string>();
      const chartData: any[] = [];
      let idx = 0;
      sessionMap.forEach((dateMap, date) => {
        const entry: any = { date, idx: idx++ };
        dateMap.forEach((v, name) => {
          entry[name] = Math.round((v.correct / v.total) * 100);
          allTopicNames.add(name);
        });
        chartData.push(entry);
      });

      setTrendData(chartData);
      setTrendTopics(Array.from(allTopicNames));
      setLoading(false);
    };
    fetchData();
  }, [user, examTypeId, subjectId]);

  const TrendIcon = ({ pct }: { pct: number }) => {
    if (pct >= 70) return <TrendingUp size={14} className="text-green-500" />;
    if (pct >= 50) return <Minus size={14} className="text-yellow-500" />;
    return <TrendingDown size={14} className="text-destructive" />;
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" className="text-primary" />
      </View>
    );
  }

  const overallPct =
    overall.total > 0
      ? Math.round((overall.correct / overall.total) * 100)
      : 0;

  const CHART_COLORS = [
    "#6366f1",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#3b82f6",
  ];

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-6 gap-5">
        <Pressable onPress={() => router.back()}>
          <Text className="text-sm text-primary font-medium">← Back</Text>
        </Pressable>

        <Text className="text-lg font-bold text-foreground">
          Performance — {subjectName}
        </Text>

        {overall.total === 0 ? (
          <View className="items-center py-16">
            <Text className="text-4xl mb-3">📊</Text>
            <Text className="font-semibold text-foreground">
              No attempts yet
            </Text>
            <Text className="text-sm text-muted-foreground mt-1">
              Practice some questions to see your performance!
            </Text>
            <Button
              variant="outline"
              onPress={() => router.back()}
              className="mt-4"
            >
              <Text className="text-foreground">Start Practicing</Text>
            </Button>
          </View>
        ) : (
          <>
            <View className="p-5 rounded-2xl bg-card border border-border items-center">
              <Text className="text-4xl font-bold text-foreground">
                {overallPct}%
              </Text>
              <Text className="text-sm text-muted-foreground mt-1">
                {overall.correct} / {overall.total} questions correct
              </Text>
              <View className="w-full mt-3">
                <Progress value={overallPct} />
              </View>
            </View>

            <View className="flex-row flex-wrap gap-3">
              <View style={{ width: "48%" }}>
                <Card>
                  <CardContent className="pt-4 items-center">
                    <Target size={20} className="text-primary mb-1" />
                    <Text className="text-xl font-bold text-foreground">
                      {sessions.length}
                    </Text>
                    <Text className="text-xs text-muted-foreground">
                      Sessions
                    </Text>
                  </CardContent>
                </Card>
              </View>
              <View style={{ width: "48%" }}>
                <Card>
                  <CardContent className="pt-4 items-center">
                    <Zap size={20} className="text-yellow-500 mb-1" />
                    <Text className="text-xl font-bold text-foreground">
                      {bestScore}%
                    </Text>
                    <Text className="text-xs text-muted-foreground">
                      Best Score
                    </Text>
                  </CardContent>
                </Card>
              </View>
              <View style={{ width: "48%" }}>
                <Card>
                  <CardContent className="pt-4 items-center">
                    <Clock size={20} className="text-blue-500 mb-1" />
                    <Text className="text-xl font-bold text-foreground">
                      {avgTimePerQ}s
                    </Text>
                    <Text className="text-xs text-muted-foreground">
                      Avg/Question
                    </Text>
                  </CardContent>
                </Card>
              </View>
              <View style={{ width: "48%" }}>
                <Card>
                  <CardContent className="pt-4 items-center">
                    {improvementTrend >= 0 ? (
                      <TrendingUp
                        size={20}
                        className="text-green-500 mb-1"
                      />
                    ) : (
                      <TrendingDown
                        size={20}
                        className="text-destructive mb-1"
                      />
                    )}
                    <Text
                      className={`text-xl font-bold ${
                        improvementTrend >= 0
                          ? "text-green-500"
                          : "text-destructive"
                      }`}
                    >
                      {improvementTrend > 0 ? "+" : ""}
                      {improvementTrend}%
                    </Text>
                    <Text className="text-xs text-muted-foreground">
                      Improvement
                    </Text>
                  </CardContent>
                </Card>
              </View>
            </View>

            {topicPerfs.length >= 3 && (
              <View className="p-4 rounded-2xl bg-card border border-border">
                <View className="flex-row items-center gap-2 mb-3">
                  <BarChart3 size={16} className="text-foreground" />
                  <Text className="text-sm font-semibold text-foreground">
                    Topic Strengths
                  </Text>
                </View>
                <View style={{ height: 250, width: SCREEN_WIDTH - 48 }}>
                  <CartesianChart
                    data={topicPerfs.map((t, i) => ({
                      idx: i,
                      pct: t.pct,
                    }))}
                    xKey="idx"
                    yKeys={["pct"]}
                    domain={{ y: [0, 100] }}
                    axisOptions={{
                      formatXLabel: (v: number) => {
                        const t = topicPerfs[Math.round(v)];
                        return t
                          ? t.topicName.length > 8
                            ? t.topicName.slice(0, 8) + "…"
                            : t.topicName
                          : "";
                      },
                      formatYLabel: (v: number) => `${Math.round(v)}%`,
                    }}
                  >
                    {({ points, chartBounds }) => (
                      <Bar
                        points={points.pct}
                        chartBounds={chartBounds}
                        color="#6366f1"
                        barWidth={16}
                        opacity={0.8}
                      />
                    )}
                  </CartesianChart>
                </View>
              </View>
            )}

            {diffBreakdown.length > 0 && (
              <View className="p-4 rounded-2xl bg-card border border-border">
                <Text className="text-sm font-semibold text-foreground mb-3">
                  By Difficulty
                </Text>
                <View className="gap-3">
                  {diffBreakdown.map((d) => (
                    <View key={d.difficulty} className="flex-row items-center gap-3">
                      <Text
                        className={`text-xs font-medium capitalize w-14 ${
                          d.difficulty === "easy"
                            ? "text-green-500"
                            : d.difficulty === "hard"
                            ? "text-destructive"
                            : "text-yellow-500"
                        }`}
                      >
                        {d.difficulty}
                      </Text>
                      <View className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                        <View
                          className={`h-full rounded-full ${
                            d.difficulty === "easy"
                              ? "bg-green-500"
                              : d.difficulty === "hard"
                              ? "bg-destructive"
                              : "bg-yellow-500"
                          }`}
                          style={{ width: `${d.pct}%` }}
                        />
                      </View>
                      <Text className="text-xs font-bold w-12 text-right text-foreground">
                        {d.pct}%
                      </Text>
                      <Text className="text-xs text-muted-foreground w-14 text-right">
                        ({d.correct}/{d.total})
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {trendData.length > 1 && (
              <View className="p-4 rounded-2xl bg-card border border-border">
                <Text className="text-sm font-semibold text-foreground mb-3">
                  Accuracy Over Time
                </Text>
                <View style={{ height: 220, width: SCREEN_WIDTH - 48 }}>
                  <CartesianChart
                    data={trendData}
                    xKey="idx"
                    yKeys={trendTopics}
                    domain={{ y: [0, 100] }}
                    axisOptions={{
                      formatXLabel: (v: number) => {
                        const item = trendData.find((d: any) => d.idx === v);
                        return item ? item.date.slice(5) : "";
                      },
                      formatYLabel: (v: number) => `${Math.round(v)}%`,
                    }}
                  >
                    {({ points, chartBounds }) => (
                      <>
                        {trendTopics.map((name, i) => (
                          <Line
                            key={name}
                            points={points[name]}
                            color={CHART_COLORS[i % CHART_COLORS.length]}
                            strokeWidth={name === "Overall" ? 3 : 1.5}
                          />
                        ))}
                      </>
                    )}
                  </CartesianChart>
                </View>
                <View className="flex-row flex-wrap gap-2 mt-2">
                  {trendTopics.map((name, i) => (
                    <View
                      key={name}
                      className="flex-row items-center gap-1"
                    >
                      <View
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor:
                            CHART_COLORS[i % CHART_COLORS.length],
                        }}
                      />
                      <Text className="text-[10px] text-muted-foreground">
                        {name}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {sessions.length > 0 && (
              <View className="rounded-2xl bg-card border border-border overflow-hidden">
                <View className="p-4 pb-2">
                  <Text className="text-sm font-semibold text-foreground">
                    Recent Sessions
                  </Text>
                </View>
                <ScrollView horizontal>
                  <View className="p-4 pt-0">
                    <View className="flex-row border-b border-border pb-2 mb-2">
                      <Text className="text-xs font-semibold text-muted-foreground w-24">
                        Date
                      </Text>
                      <Text className="text-xs font-semibold text-muted-foreground w-16 text-center">
                        Qs
                      </Text>
                      <Text className="text-xs font-semibold text-muted-foreground w-16 text-center">
                        Score
                      </Text>
                      <Text className="text-xs font-semibold text-muted-foreground w-16 text-right">
                        Time
                      </Text>
                    </View>
                    {sessions.map((s) => (
                      <View
                        key={s.sessionId}
                        className="flex-row py-1.5 border-b border-border/50"
                      >
                        <Text className="text-xs text-foreground w-24">
                          {new Date(s.date).toLocaleDateString()}
                        </Text>
                        <Text className="text-xs text-foreground w-16 text-center">
                          {s.correct}/{s.total}
                        </Text>
                        <Text
                          className={`text-xs font-bold w-16 text-center ${
                            s.pct >= 70
                              ? "text-green-500"
                              : s.pct >= 50
                              ? "text-yellow-500"
                              : "text-destructive"
                          }`}
                        >
                          {s.pct}%
                        </Text>
                        <Text className="text-xs text-muted-foreground w-16 text-right">
                          {s.totalTime > 0 ? formatTime(s.totalTime) : "—"}
                        </Text>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}

            <Text className="text-sm font-semibold text-foreground pt-2">
              By Topic
            </Text>
            <View className="gap-2">
              {topicPerfs.map((tp, i) => (
                <View
                  key={tp.topicId || i}
                  className="flex-row items-center gap-3 p-3 rounded-xl bg-card border border-border"
                >
                  <TrendIcon pct={tp.pct} />
                  <View className="flex-1 min-w-0">
                    <Text
                      className="text-sm font-medium text-foreground"
                      numberOfLines={1}
                    >
                      {tp.topicName}
                    </Text>
                    <Text className="text-xs text-muted-foreground">
                      {tp.correct}/{tp.total} correct
                      {tp.avgTime > 0 ? ` • ${tp.avgTime}s avg` : ""}
                    </Text>
                  </View>
                  <Text
                    className={`text-sm font-bold ${
                      tp.pct >= 70
                        ? "text-green-500"
                        : tp.pct >= 50
                        ? "text-yellow-500"
                        : "text-destructive"
                    }`}
                  >
                    {tp.pct}%
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}
