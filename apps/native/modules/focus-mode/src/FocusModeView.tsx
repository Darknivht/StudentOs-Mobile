import { requireNativeView } from 'expo';
import * as React from 'react';

import { FocusModeViewProps } from './FocusMode.types';

const NativeView: React.ComponentType<FocusModeViewProps> =
  requireNativeView('FocusMode');

export default function FocusModeView(props: FocusModeViewProps) {
  return <NativeView {...props} />;
}
