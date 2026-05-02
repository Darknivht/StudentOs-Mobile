import { View, Text, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  HomeScreen,
  StudyScreen,
  NotesListScreen,
  NoteEditorScreen,
  NoteViewerScreen,
  FocusScreen,
  ProfileScreen,
} from "../screens";
import { colors, spacing, typography } from "../lib/theme";
import type { MainTabParamList, NotesStackParamList } from "./types";

const Tab = createBottomTabNavigator<MainTabParamList>();
const NotesStack = createNativeStackNavigator<NotesStackParamList>();

function NotesNavigator() {
  return (
    <NotesStack.Navigator
      id="NotesStack"
      screenOptions={{ headerShown: false }}
    >
      <NotesStack.Screen name="NotesMain" component={NotesListScreen} />
      <NotesStack.Screen name="NoteEditor" component={NoteEditorScreen} />
      <NotesStack.Screen name="NoteViewer" component={NoteViewerScreen} />
    </NotesStack.Navigator>
  );
}

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Home: "🏠",
    Study: "📚",
    Notes: "📝",
    Focus: "🎯",
    Profile: "👤",
  };
  return (
    <View style={styles.iconContainer}>
      <Text style={[styles.icon, { opacity: focused ? 1 : 0.5 }]}>
        {icons[name] || "•"}
      </Text>
      {focused && <View style={styles.activeDot} />}
    </View>
  );
}

export function MainNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      id="MainTabs"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: spacing.xs,
        },
        tabBarLabelStyle: {
          fontSize: typography.xs,
          color: colors.mutedForeground,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarIcon: ({ focused }) => (
          <TabIcon name={route.name} focused={focused} />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Study" component={StudyScreen} />
      <Tab.Screen name="Notes" component={NotesNavigator} />
      <Tab.Screen name="Focus" component={FocusScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 22,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
    marginTop: 2,
  },
});
