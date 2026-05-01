import { View, Text, Pressable, StyleSheet } from "react-native";
import { useState, useEffect } from "react";
import { useBrainBoost } from "../../hooks/useBrainBoost";
import { colors, spacing, typography } from "../../lib/theme";

export function BrainBoostCard() {
  const {
    questions,
    currentQuestionIndex,
    answers,
    score,
    isCompletedToday,
    xpEarned,
    isLoading,
    error,
    fetchQuestions,
    answerQuestion,
    nextQuestion,
    completeBoost,
    getTimeUntilMidnight,
  } = useBrainBoost();

  const [countdown, setCountdown] = useState("");
  const [answeredCurrent, setAnsweredCurrent] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);

  useEffect(() => {
    if (!isCompletedToday) return;
    const update = () => {
      const ms = getTimeUntilMidnight();
      const hours = Math.floor(ms / 3600000);
      const minutes = Math.floor((ms % 3600000) / 60000);
      setCountdown(`${hours}h ${minutes}m`);
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [isCompletedToday, getTimeUntilMidnight]);

  useEffect(() => {
    setAnsweredCurrent(false);
  }, [currentQuestionIndex]);

  const handleStart = () => {
    setQuizStarted(true);
    fetchQuestions();
  };

  const handleAnswer = (answerIndex: number) => {
    if (answeredCurrent) return;
    setAnsweredCurrent(true);
    answerQuestion(currentQuestionIndex, answerIndex);

    const isLastQuestion = currentQuestionIndex === questions.length - 1;
    if (isLastQuestion) {
      setTimeout(() => completeBoost(), 1500);
    } else {
      setTimeout(() => nextQuestion(), 1500);
    }
  };

  if (isLoading && quizStarted) {
    return (
      <View style={styles.card}>
        <View style={styles.accentBar} />
        <View style={styles.cardContent}>
          <Text style={styles.emoji}>🧠</Text>
          <Text style={styles.title}>Loading questions...</Text>
        </View>
      </View>
    );
  }

  if (isCompletedToday) {
    return (
      <View style={styles.card}>
        <View style={styles.accentBar} />
        <View style={styles.cardContent}>
          <Text style={styles.emoji}>🏆</Text>
          <Text style={styles.title}>Brain Boost Complete!</Text>
          <Text style={styles.scoreText}>
            {score}/5 correct • {xpEarned} XP earned
          </Text>
          {countdown ? (
            <Text style={styles.countdown}>Next challenge in {countdown}</Text>
          ) : null}
        </View>
      </View>
    );
  }

  if (quizStarted && questions.length > 0) {
    const currentQ = questions[currentQuestionIndex];
    if (!currentQ) return null;

    const userAnswer = answers[currentQuestionIndex];
    const showResult = userAnswer !== -1 && userAnswer !== undefined;

    return (
      <View style={styles.card}>
        <View style={styles.accentBar} />
        <View style={styles.cardContent}>
          <Text style={styles.counter}>
            Question {currentQuestionIndex + 1}/{questions.length}
          </Text>
          <Text style={styles.questionText}>{currentQ.question}</Text>
          {currentQ.options.map((option: string, idx: number) => {
            let optionStyle = styles.optionBtn;
            let optionTextStyle = styles.optionText;
            if (showResult) {
              if (idx === currentQ.correct_index) {
                optionStyle = styles.optionCorrect;
                optionTextStyle = styles.optionCorrectText;
              } else if (idx === userAnswer && idx !== currentQ.correct_index) {
                optionStyle = styles.optionWrong;
                optionTextStyle = styles.optionWrongText;
              }
            }
            return (
              <Pressable
                key={idx}
                style={optionStyle}
                onPress={() => handleAnswer(idx)}
                disabled={showResult}
              >
                <Text style={optionTextStyle}>{option}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  }

  if (quizStarted && (error || questions.length === 0)) {
    return (
      <View style={styles.card}>
        <View style={styles.accentBar} />
        <View style={styles.cardContent}>
          <Text style={styles.emoji}>🧠</Text>
          <Text style={styles.title}>Daily Brain Boost</Text>
          <Text style={styles.subtitle}>
            {error || "No questions available right now"}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.accentBar} />
      <View style={styles.cardContent}>
        <Text style={styles.emoji}>🧠</Text>
        <Text style={styles.title}>Daily Brain Boost</Text>
        <Text style={styles.subtitle}>5 questions • 10 XP each</Text>
        <Pressable style={styles.startBtn} onPress={handleStart}>
          <Text style={styles.startBtnText}>Start Challenge</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardContent: {
    padding: spacing.lg,
  },
  accentBar: {
    height: 3,
    backgroundColor: colors.primary,
  },
  emoji: {
    fontSize: 28,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.base,
    fontWeight: "600",
    color: colors.foreground,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sm,
    color: colors.mutedForeground,
    marginBottom: spacing.md,
  },
  scoreText: {
    fontSize: typography.sm,
    color: colors.success,
    marginBottom: spacing.xs,
  },
  countdown: {
    fontSize: typography.sm,
    color: colors.mutedForeground,
  },
  startBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  startBtnText: {
    fontSize: typography.base,
    fontWeight: "600",
    color: colors.primaryForeground,
  },
  counter: {
    fontSize: typography.sm,
    color: colors.mutedForeground,
    marginBottom: spacing.sm,
  },
  questionText: {
    fontSize: typography.lg,
    fontWeight: "600",
    color: colors.foreground,
    marginBottom: spacing.md,
  },
  optionBtn: {
    backgroundColor: colors.muted,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: "transparent",
  },
  optionText: {
    fontSize: typography.base,
    color: colors.foreground,
  },
  optionCorrect: {
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.success,
  },
  optionCorrectText: {
    fontSize: typography.base,
    color: colors.success,
  },
  optionWrong: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.destructive,
  },
  optionWrongText: {
    fontSize: typography.base,
    color: colors.destructive,
  },
  skeleton: {
    height: 20,
    width: "80%",
    backgroundColor: colors.muted,
    borderRadius: 4,
    opacity: 0.3,
  },
});
