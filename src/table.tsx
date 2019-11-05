/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import * as React from 'react';
import { ILogItem, protocolTags, logLevelToWord } from './model';
import { TimestampSinceEpoch } from './timestamp';
import ReactDataGrid, { Column } from 'react-data-grid';

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

const createColumns = (
  rows: ILogItem<any>[],
  inspect: (row: ILogItem<any>) => void,
): Column<ILogItem<any>>[] => [
  {
    key: 'level',
    name: 'Level',
    resizable: false,
    width: 50,
    formatter: ({ value }) => <>{logLevelToWord[value]}</>,
  },
  {
    key: 'timestamp',
    name: 'Timestamp',
    resizable: true,
    width: 120,
    formatter: ({ value }) => <TimestampSinceEpoch value={value} epoch={rows[0].timestamp} />,
  },
  {
    key: 'tag',
    name: 'Tag',
    resizable: true,
    width: 120,
  },
  {
    key: 'metadata',
    name: 'Log Entry',
    resizable: true,
    formatter: ({ row }) => (
      <span onClick={() => inspect(row)} className="log-data">
        {row.message && <span className="message">{row.message}</span>}
        {row.metadata && formatMetadata(row.tag, row.metadata)}
      </span>
    ),
  },
];

export const Table: React.FC<{ rows: ILogItem<any>[], inspect(row: ILogItem<any>): void }> = ({ rows, inspect }) => {
  const columns = React.useMemo(() => createColumns(rows, inspect), [rows, inspect]);

  return (
    <>
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
