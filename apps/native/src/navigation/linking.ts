import * as Linking from 'expo-linking';

export const linking = {
  prefixes: [Linking.createURL('/')],
  config: {
    screens: {
      Dashboard: '',
      Study: 'study',
      Store: 'store',
      Plan: 'plan',
      Social: 'social',
      Career: 'career',
    },
  },
};