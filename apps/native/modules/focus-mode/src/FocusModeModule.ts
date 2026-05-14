import { NativeModule, requireNativeModule } from 'expo';

import { FocusModeModuleEvents } from './FocusMode.types';

declare class FocusModeModule extends NativeModule<FocusModeModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<FocusModeModule>('FocusMode');
