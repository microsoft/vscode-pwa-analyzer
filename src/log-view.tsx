/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import * as React from 'react';
import { ILogItem } from './model';
import { Table } from './table';
import { Controls } from './controls';
import { RowInspector } from './row-inspector';
import { RowSelection } from './row-selection';

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
        .filter((v: unknown): v is ILogItem<any> => !!v)
        .map((v, i) => ({ ...v, _index: i })),
    [file],
  );

  const [highlightRows, setHighlightRows] = React.useState<ReadonlySet<number>>(new Set());
  const [selectedRows, setSelectedRows] = React.useState(RowSelection.empty);
  const [inspectedRow, setInspected] = React.useState<ILogItem<any> | null>(null);
  const closeInspector = React.useCallback(() => setInspected(null), [setInspected]);
  const [renderedRows, setRendered] = React.useState<ILogItem<any>[]>([]);
  const epoch = rows.length ? rows[0].timestamp : 0;

  return (
    <>
      {inspectedRow && <RowInspector row={inspectedRow} rows={rows} close={closeInspector} />}
      <Table
        epoch={epoch}
        rows={renderedRows}
        inspect={setInspected}
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
        highlightRows={highlightRows}
      />
      <Controls
        selection={selectedRows}
        data={rows}
        onUpdate={setRendered}
        onHighlight={setHighlightRows}
      />
    </>
  );
};
