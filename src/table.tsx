/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import * as React from 'react';
import { ILogItem, protocolTags, logLevelToWord } from './model';

// @ts-ignore
import ReactDataGrid from 'react-data-grid';
import { TimestampSinceEpoch } from './timestamp';
import { RowInspector } from './row-inspector';

const stringifyMetadata = (metadata: any) => {
  return metadata === undefined ? 'undefined' : JSON.stringify(metadata).slice(0, 200);
};

const formatUnknownMetadata = (metadata: any) => {
  return <span className="inline-message">{stringifyMetadata(metadata)}</span>;
};

// ad-hoc formatting
const formatMetadata = (tag: string, metadata: any) => {
  const { message } = metadata;
  if (protocolTags.includes(tag)) {
    return formatUnknownMetadata(metadata);
  }

  const received = tag.endsWith('.receive');
  const verb = message.event || message.method || message.command;
  if (!verb) {
    return formatUnknownMetadata(metadata);
  }

  const subject = message.params || message.arguments || message.body;
  return (
    <span
      className={
        received ? 'inline-message inline-message-received' : 'inline-message inline-message-send'
      }
    >
      {verb}({stringifyMetadata(subject)})
    </span>
  );
};

const createColumns = (rows: ILogItem<any>[], inspect: (row: ILogItem<any>) => void) => [
  {
    key: 'level',
    name: 'Level',
    resizable: false,
    width: 50,
    formatter: ({ row }: { row: ILogItem<any> }) => logLevelToWord[row.level],
  },
  {
    key: 'timestamp',
    name: 'Timestamp',
    resizable: true,
    width: 120,
    formatter: ({ row }: { row: ILogItem<any> }) => {
      return <TimestampSinceEpoch value={row.timestamp} epoch={rows[0].timestamp} />;
    },
  },
  {
    key: 'tag',
    name: 'Tag',
    resizable: true,
    width: 120,
  },
  {
    key: 'log',
    name: 'Log Entry',
    resizable: true,
    formatter: ({ row }: { row: ILogItem<any> }) => (
      <span onClick={() => inspect(row)} className="log-data">
        {row.message && <span className="message">{row.message}</span>}
        {row.metadata && formatMetadata(row.tag, row.metadata)}
      </span>
    ),
  },
];

export const Table: React.FC<{ rows: ILogItem<any>[] }> = ({ rows }) => {
  const [inspectedRow, setInspected] = React.useState<ILogItem<any> | null>(null);
  const closeInspector = React.useCallback(() => setInspected(null), [setInspected]);
  const columns = React.useMemo(() => createColumns(rows, setInspected), [rows, setInspected]);

  return (
    <>
      {inspectedRow && <RowInspector row={inspectedRow} rows={rows} close={closeInspector} />}
      <ReactDataGrid
        columns={columns}
        rowGetter={(i: number) => rows[i]}
        rowsCount={rows.length}
        minHeight={window.innerHeight}
        minWidth={window.innerWidth - 250}
      />
    </>
  );
};
