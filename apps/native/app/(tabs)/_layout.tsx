import { Tabs, useRouter } from "expo-router";
import { Home, BookOpen, GraduationCap, Briefcase, CalendarDays, User, Users, Store, MessageCircle, Settings, Bell } from "lucide-react-native";
import { View, Text, Pressable } from "react-native";
import { useTheme } from "../../hooks/useThemeContext";
import { useAuth } from "../../hooks/useAuthContext";
import { Colors } from "../../theme/colors";

function HeaderRight() {
  const router = useRouter();

  return (
    <View className="flex-row items-center mr-4 gap-2">
      <Pressable 
        onPress={() => router.push("/(tabs)/profile")}
        className="p-2 rounded-full"
      >
        <User size={20} className="text-foreground" />
      </Pressable>
      <Pressable 
        onPress={() => router.push("/(tabs)/profile")}
        className="p-2 rounded-full"
      >
        <Settings size={20} className="text-foreground" />
      </Pressable>
    </View>
  );
}

export default function TabLayout() {
  const { isDark } = useTheme();

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
          height: 65,
          paddingBottom: 8,
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
        headerTintColor: isDark ? "#F8FAFC" : "#0F172A",
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
            <View className="flex-row items-center gap-2">
              <View className="w-8 h-8 rounded-lg bg-primary items-center justify-center">
                <Text className="text-primary-foreground font-bold text-sm">S</Text>
              </View>
              <Text className="text-foreground font-bold text-lg">StudentOS</Text>
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