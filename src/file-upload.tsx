/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import * as React from 'react';

export const FileUpload: React.FC<{ onChange(text: string): void }> = props => {
  const uploadFile = React.useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    const reader = new FileReader();
    reader.onload = () => props.onChange(reader.result as string);
    reader.readAsText(evt.target.files![0]);
  }, []);

  return <input type="file" onChange={uploadFile} />;
};
