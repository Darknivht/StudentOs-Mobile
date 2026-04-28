import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  HomeScreen,
  StudyScreen,
  FocusScreen,
  ProfileScreen,
} from "../screens";
import type { MainTabParamList } from "./types";

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainNavigator() {
  return (
    <Tab.Navigator id="MainTabs" screenOptions={{ headerShown: false }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "Home", tabBarIcon: () => null }}
      />
      <Tab.Screen
        name="Study"
        component={StudyScreen}
        options={{ title: "Study", tabBarIcon: () => null }}
      />
      <Tab.Screen
        name="Focus"
        component={FocusScreen}
        options={{ title: "Focus", tabBarIcon: () => null }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: "Profile", tabBarIcon: () => null }}
      />
    </Tab.Navigator>
  );
}
