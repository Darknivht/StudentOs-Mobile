import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, BookOpen, Library, Calendar, Users, Briefcase } from 'lucide-react-native';
import { MotiView } from 'moti';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import * as Haptics from 'expo-haptics';

// Import screens (placeholder for now)
import DashboardScreen from '@/screens/DashboardScreen';
import StudyScreen from '@/screens/StudyScreen';
import StoreScreen from '@/screens/StoreScreen';
import PlanScreen from '@/screens/PlanScreen';
import SocialScreen from '@/screens/SocialScreen';
import CareerScreen from '@/screens/CareerScreen';

const Tab = createBottomTabNavigator();

const items = [
  { name: 'Dashboard', label: 'Home', Icon: Home, Component: DashboardScreen },
  { name: 'Study', label: 'Study', Icon: BookOpen, Component: StudyScreen },
  { name: 'Store', label: 'Store', Icon: Library, Component: StoreScreen },
  { name: 'Plan', label: 'Plan', Icon: Calendar, Component: PlanScreen },
  { name: 'Social', label: 'Social', Icon: Users, Component: SocialScreen },
  { name: 'Career', label: 'Career', Icon: Briefcase, Component: CareerScreen },
];

export default function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      {items.map(({ name, Component }) => (
        <Tab.Screen key={name} name={name} component={Component} />
      ))}
    </Tab.Navigator>
  );
}

function CustomTabBar({ state, navigation }: any) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.tabBar,
        {
          backgroundColor: theme.card + 'CC', // 80% opacity
          borderTopColor: theme.border,
          paddingBottom: 12 + insets.bottom,
        },
      ]}
    >
      {state.routes.map((route: any, idx: number) => {
        const isActive = state.index === idx;
        const item = items[idx];
        const Icon = item.Icon;

        return (
          <Pressable
            key={route.key}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate(route.name);
            }}
            style={styles.tabItem}
          >
            <View style={styles.iconContainer}>
              {isActive && (
                <MotiView
                  from={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  style={[
                    styles.activePill,
                    { backgroundColor: theme.primary + '1A' }, // 10% opacity
                  ]}
                />
              )}
              <Icon
                size={20}
                color={isActive ? theme.primary : theme.mutedForeground}
              />
            </View>
            <Text
              style={[
                styles.label,
                { color: isActive ? theme.primary : theme.mutedForeground },
              ]}
            >
              {item.label}
            </Text>
            {isActive && (
              <MotiView
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                style={[styles.activeDot, { backgroundColor: theme.primary }]}
              />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 4,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  tabItem: {
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    position: 'relative',
  },
  iconContainer: {
    position: 'relative',
    padding: 8,
    borderRadius: 12,
  },
  activePill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },
  activeDot: {
    position: 'absolute',
    bottom: -2,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});