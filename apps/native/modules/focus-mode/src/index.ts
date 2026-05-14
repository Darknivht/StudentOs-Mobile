import { requireNativeModule } from 'expo-modules-core';
import { EventSubscription } from 'expo-modules-core';

const FocusModeModule = requireNativeModule('FocusMode');

export interface FocusSessionConfig {
  blockedApps: string[];
  durationMinutes: number;
}

class FocusModeService {
  startSession(config: FocusSessionConfig): Promise<boolean> {
    return FocusModeModule.startSession(config.blockedApps, config.durationMinutes);
  }

  stopSession(): Promise<boolean> {
    return FocusModeModule.stopSession();
  }

  isActive(): Promise<boolean> {
    return FocusModeModule.isActive();
  }

  getBlockedApps(): Promise<string[]> {
    return FocusModeModule.getBlockedApps();
  }

  addListener(event: 'onAppBlocked', callback: (event: { packageName: string }) => void): EventSubscription {
    return FocusModeModule.addListener(event, callback);
  }

  addSessionEndListener(callback: () => void): EventSubscription {
    return FocusModeModule.addListener('onSessionEnd', callback);
  }
}

export const FocusMode = new FocusModeService();
