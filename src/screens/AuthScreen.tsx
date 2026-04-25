import { View, Text, StyleSheet } from 'react-native';

export function AuthScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>StudentOS Auth</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f23',
  },
  text: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: '600',
  },
});