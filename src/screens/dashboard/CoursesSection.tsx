import { View, Text, Pressable, FlatList, StyleSheet } from "react-native";
import { useCourses, type CourseWithProgress } from "../../hooks/useCourses";
import { CourseCard } from "./CourseCard";
import { colors, spacing, typography } from "../../lib/theme";

export function CoursesSection() {
  const { courses, isLoading } = useCourses();

  const handleCoursePress = (_courseId: string) => {
    // Course detail navigation — Phase 3
  };

  const handleAddCourse = () => {
    // Course creation — Phase 3
  };

  const data: (CourseWithProgress | { id: string; _isAdd: true })[] = [
    ...courses,
    { id: "__add__", _isAdd: true } as { id: string; _isAdd: true },
  ];

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Courses</Text>
        </View>
        <View style={styles.skeletonRow}>
          <View style={styles.skeletonCard} />
          <View style={styles.skeletonCard} />
        </View>
      </View>
    );
  }

  if (courses.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Courses</Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📚</Text>
          <Text style={styles.emptyText}>
            No courses yet — add your first course!
          </Text>
          <Pressable style={styles.addBtn} onPress={handleAddCourse}>
            <Text style={styles.addBtnText}>+ Add Course</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Courses</Text>
        <Pressable onPress={handleAddCourse}>
          <Text style={styles.seeAll}>See All</Text>
        </Pressable>
      </View>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        numColumns={2}
        scrollEnabled={false}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => {
          if ("_isAdd" in item) {
            return (
              <Pressable style={styles.addCard} onPress={handleAddCourse}>
                <Text style={styles.addIcon}>+</Text>
                <Text style={styles.addLabel}>Add Course</Text>
              </Pressable>
            );
          }
          return (
            <CourseCard
              course={item as CourseWithProgress}
              onPress={handleCoursePress}
            />
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.sm,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  headerTitle: {
    fontSize: typography.lg,
    fontWeight: "700",
    color: colors.foreground,
  },
  seeAll: {
    fontSize: typography.sm,
    fontWeight: "600",
    color: colors.primary,
  },
  row: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  addCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
    minHeight: 90,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.md,
    opacity: 0.7,
  },
  addIcon: {
    fontSize: typography["2xl"],
    color: colors.mutedForeground,
  },
  addLabel: {
    fontSize: typography.xs,
    color: colors.mutedForeground,
    marginTop: spacing.xs,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: typography.sm,
    color: colors.mutedForeground,
    marginBottom: spacing.md,
    textAlign: "center",
  },
  addBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
  },
  addBtnText: {
    fontSize: typography.base,
    fontWeight: "600",
    color: colors.primaryForeground,
  },
  skeletonRow: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  skeletonCard: {
    flex: 1,
    height: 90,
    backgroundColor: colors.muted,
    borderRadius: 16,
    opacity: 0.3,
  },
});
