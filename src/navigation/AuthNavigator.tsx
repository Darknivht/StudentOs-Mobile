import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "./types";
import {
  SignInScreen,
  SignUpScreen,
  ForgotPasswordScreen,
  PINSetupScreen,
} from "../screens";

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  return (
    <Stack.Navigator id="AuthStack" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="PINSetup" component={PINSetupScreen} />
    </Stack.Navigator>
  );
}
