import * as React from 'react';

import { FocusModeViewProps } from './FocusMode.types';

export default function FocusModeView(props: FocusModeViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
