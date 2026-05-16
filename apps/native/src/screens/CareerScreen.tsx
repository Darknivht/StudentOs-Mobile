import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

export default function CareerScreen() {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.foreground, fontFamily: 'SpaceGrotesk_700Bold' }]}>
        Career
      </Text>
      <Text style={[styles.subtitle, { color: theme.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
        Resume Builder & Internships
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 32, marginBottom: 8 },
  subtitle: { fontSize: 16 },
});
