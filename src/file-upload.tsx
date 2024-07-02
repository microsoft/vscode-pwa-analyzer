/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import { Gunzip, gunzipSync, strFromU8 } from 'fflate';
import * as React from 'react';

export const FileUpload: React.FC<{ onChange(text: string): void }> = props => {
  const uploadFile = React.useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        props.onChange(reader.result);
        return;
      }

      const result = new Uint8Array(reader.result as ArrayBuffer);

      // first try decompressing as a complete stream:
      let err: Error;
      try {
        props.onChange(strFromU8(gunzipSync(result)));
        return;
      } catch (e) {
        err = e as Error;
      }

      // may error if the log was collected before the session ends, so try as
      // a stream and decompress as much as we can:
      const finish = debounce(() => props.onChange(text), 100);
      const showAlert = setTimeout(() => alert(`Error decompressing file: ${err}`), 3000);

      let text: string;
      const decoder = new TextDecoder();
      const ds = new Gunzip(chunk => {
        text = decoder.decode(chunk, { stream: true });
        clearTimeout(showAlert);
        finish();
      });

      ds.push(result);
    };

    const file = evt.target.files?.[0];
    if (!file) {
      return;
    }

    if (file.name.endsWith('.json') || file.name.endsWith('.txt')) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  }, []);

  return <input type="file" onChange={uploadFile} />;
};

const debounce = (func: () => void, delay: number) => {
  let timeoutId: number;

  return () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func();
    }, delay);
  };
};
