// Reexport the native module. On web, it will be resolved to FocusModeModule.web.ts
// and on native platforms to FocusModeModule.ts
export { default } from './src/FocusModeModule';
export { default as FocusModeView } from './src/FocusModeView';
export * from  './src/FocusMode.types';
