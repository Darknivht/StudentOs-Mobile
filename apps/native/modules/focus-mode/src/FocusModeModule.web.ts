import { registerWebModule, NativeModule } from 'expo';

import { ChangeEventPayload } from './FocusMode.types';

type FocusModeModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
}

class FocusModeModule extends NativeModule<FocusModeModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
};

export default registerWebModule(FocusModeModule, 'FocusModeModule');
