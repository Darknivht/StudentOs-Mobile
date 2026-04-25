import type { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
};

export type MainTabParamList = {
  Home: NavigatorScreenParams<HomeStackParamList>;
  Study: NavigatorScreenParams<StudyStackParamList>;
  Focus: NavigatorScreenParams<FocusStackParamList>;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
};

export type HomeStackParamList = {
  HomeMain: undefined;
};

export type StudyStackParamList = {
  StudyMain: undefined;
};

export type FocusStackParamList = {
  FocusMain: undefined;
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends AuthStackParamList {}
  }
}