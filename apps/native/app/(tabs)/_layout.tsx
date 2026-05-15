import { Tabs, useRouter } from "expo-router";
import { Home, BookOpen, GraduationCap, Briefcase, CalendarDays, User, Users, Store, MessageCircle, Settings, Bell } from "lucide-react-native";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import { useTheme } from "../../hooks/useThemeContext";
import { useAuth } from "../../hooks/useAuthContext";
import { Colors } from "../../theme/colors";

function HeaderRight() {
  const router = useRouter();
  const { isDark } = useTheme();

  return (
    <View style={styles.headerRight}>
      <Pressable 
        onPress={() => router.push("/(tabs)/profile")}
        style={styles.iconButton}
      >
        <User size={20} color={isDark ? Colors.darkForeground : Colors.foreground} />
      </Pressable>
      <Pressable 
        onPress={() => router.push("/(tabs)/profile")}
        style={styles.iconButton}
      >
        <Settings size={20} color={isDark ? Colors.darkForeground : Colors.foreground} />
      </Pressable>
    </View>
  );
}

export default function TabLayout() {
  const { isDark } = useTheme();
  const { user } = useAuth();

  const activeColor = isDark ? "hsl(262, 83%, 65%)" : "hsl(262, 83%, 58%)";
  const inactiveColor = isDark ? "#94A3B8" : "#64748B";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarStyle: {
          backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
          borderTopColor: isDark ? "#1E293B" : "#E2E8F0",
          borderTopWidth: 1,
          elevation: 0,
          shadowOpacity: 0,
          height: Platform.OS === "ios" ? 88 : 65,
          paddingBottom: Platform.OS === "ios" ? 28 : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "500",
          marginTop: 2,
        },
        headerShown: true,
        headerStyle: {
          backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: isDark ? "#1E293B" : "#E2E8F0",
        },
        headerTintColor: isDark ? Colors.darkForeground : Colors.foreground,
        headerTitleStyle: {
          fontWeight: "700",
          fontSize: 18,
        },
        headerRight: () => <HeaderRight />,
        headerTitleAlign: "left",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "StudentOS",
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
          headerTitle: () => (
            <View style={styles.headerTitle}>
              <View style={[styles.logo, { backgroundColor: activeColor }]}>
                <Text style={styles.logoText}>S</Text>
              </View>
              <Text style={[styles.appName, { color: isDark ? "#F8FAFC" : "#0F172A" }]}>
                StudentOS
              </Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="study"
        options={{
          title: "Study",
          tabBarIcon: ({ color, size }) => <BookOpen color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="exams"
        options={{
          title: "Exams",
          tabBarIcon: ({ color, size }) => <GraduationCap color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="career"
        options={{
          title: "Career",
          tabBarIcon: ({ color, size }) => <Briefcase color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="plan"
        options={{
          title: "Plan",
          tabBarIcon: ({ color, size }) => <CalendarDays color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="social"
        options={{
          title: "Social",
          tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="store"
        options={{
          title: "Store",
          tabBarIcon: ({ color, size }) => <Store color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ color, size }) => <MessageCircle color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    gap: 8,
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
  },
  headerTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  appName: {
    fontWeight: "700",
    fontSize: 18,
  },
});