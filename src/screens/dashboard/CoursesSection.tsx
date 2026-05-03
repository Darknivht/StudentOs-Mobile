import { useState } from "react";
import { View, Text, Pressable, FlatList, StyleSheet } from "react-native";
import { useCourses, type CourseWithProgress } from "../../hooks/useCourses";
import { CourseCard } from "./CourseCard";
import { AddCourseModal } from "./AddCourseModal";
import { colors, spacing, typography } from "../../lib/theme";

export function CoursesSection() {
  const { courses, isLoading, createCourse } = useCourses();
  const [showAddCourse, setShowAddCourse] = useState(false);

  const handleCoursePress = (_courseId: string) => {};

  const handleAddCourse = () => {
    setShowAddCourse(true);
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
        <AddCourseModal
          visible={showAddCourse}
          onClose={() => setShowAddCourse(false)}
          onCreateCourse={createCourse}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>My Courses</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{courses.length}</Text>
          </View>
        </View>
        <Pressable onPress={handleAddCourse}>
          <Text style={styles.seeAll}>+ Add</Text>
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
      <AddCourseModal
        visible={showAddCourse}
        onClose={() => setShowAddCourse(false)}
        onCreateCourse={createCourse}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  headerTitle: {
    fontSize: typography.lg,
    fontWeight: "600",
    color: colors.foreground,
    letterSpacing: -0.2,
  },
  countBadge: {
    backgroundColor: colors.muted,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 8,
  },
  countText: {
    fontSize: typography.xs,
    fontWeight: "600",
    color: colors.mutedForeground,
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
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: "dashed",
    minHeight: 100,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.md,
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
    height: 100,
    backgroundColor: colors.muted,
    borderRadius: 16,
    opacity: 0.3,
  },
});
