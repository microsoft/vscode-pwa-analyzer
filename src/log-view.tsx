/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import * as React from 'react';
import { ILogItem } from './model';
import { Table } from './table';
import { Controls } from './controls';

export const LogView: React.FC<{ file: string }> = ({ file }) => {
  const data = React.useMemo(
    () =>
      file
        .split('\n')
        .map(line => {
          try {
            return JSON.parse(line);
          } catch (e) {
            // ignored
          }
        })
        .filter((v: unknown): v is ILogItem<any> => !!v),
    [file],
  );

  const [renderedRows, setRendered] = React.useState<ILogItem<any>[]>([]);

  return (
    <>
      <Table rows={renderedRows} />
      <Controls data={data} onUpdate={setRendered} />
    </>
  );
};
