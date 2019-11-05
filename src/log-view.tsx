/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import * as React from 'react';
import { ILogItem } from './model';
import { Table } from './table';
import { Controls } from './controls';
import { RowInspector } from './row-inspector';

export const LogView: React.FC<{ file: string }> = ({ file }) => {
  const rows = React.useMemo(
    () =>
      file
        .split('\n')
        .map(line => {
          try {
            const parsed = JSON.parse(line);
            parsed._raw = line;
            return parsed;
          } catch (e) {
            // ignored
          }
        })
        .filter((v: unknown): v is ILogItem<any> => !!v),
    [file],
  );

  const [inspectedRow, setInspected] = React.useState<ILogItem<any> | null>(null);
  const closeInspector = React.useCallback(() => setInspected(null), [setInspected]);
  const [renderedRows, setRendered] = React.useState<ILogItem<any>[]>([]);

  return (
    <>
      {inspectedRow && <RowInspector row={inspectedRow} rows={rows} close={closeInspector} />}
      <Table rows={renderedRows} inspect={setInspected} />
      <Controls  data={rows} onUpdate={setRendered} />
    </>
  );
};
