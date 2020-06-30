/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import * as React from 'react';
import { inflate } from 'pako';

export const FileUpload: React.FC<{ onChange(text: string): void }> = props => {
  const uploadFile = React.useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        props.onChange(reader.result);
        return;
      }

      const result = new Uint8Array(reader.result as ArrayBuffer);
      try {
        props.onChange(inflate(result, { to: 'string' }));
      } catch (e) {
        alert(`Error decompressing file: ${e}`);
      }
    };

    const file = evt.target.files?.[0];
    if (!file) {
      return;
    }

    if (file.name.endsWith('.json')) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  }, []);

  return <input type="file" onChange={uploadFile} />;
};
