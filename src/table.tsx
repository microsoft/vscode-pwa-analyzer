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
  if (!protocolTags.includes(tag)) {
    return formatUnknownMetadata(metadata);
  }

  const received = tag.endsWith('.receive');
  const verb = message.event || message.method || message.command;
  if (!verb) {
    return formatUnknownMetadata(metadata);
  }

  const subject = message.params || message.arguments || message.body;
  const className = received
    ? 'inline-message inline-message-received'
    : 'inline-message inline-message-send';
  return (
    <span className={className}>
      {verb}({stringifyMetadata(subject)})
    </span>
  );
};

const createColumns = (
  epoch: number,
  onLogEntryClick: (evt: React.MouseEvent) => void,
): Column<ILogItem<any>>[] => {
  return [
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
      formatter: ({ value }) => <TimestampSinceEpoch value={value} epoch={epoch} />,
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
      formatter: ({ row, rowIdx }) => (
        <span onClick={onLogEntryClick} data-index={rowIdx} role="button" className="log-data">
          {row.message && <span className="message">{row.message}</span>}
          {row.message && row.metadata && ': '}
          {row.metadata && formatMetadata(row.tag, row.metadata)}
        </span>
      ),
    },
  ];
};

export const Table: React.FC<{
  epoch: number;
  rows: ILogItem<any>[];
  inspect(row: ILogItem<any>): void;
}> = ({ epoch, rows, inspect }) => {
  const onLogEntryClick = React.useCallback(
    (evt: React.MouseEvent) => {
      for (let target = evt.target as HTMLElement | null; target; target = target.parentElement) {
        if (target.dataset.index) {
          // loop upwards from any possible child of the cell
          inspect(rows[Number(target.dataset.index)]);
        }
      }
    },
    [rows],
  );

  const columns = React.useMemo(() => createColumns(epoch, onLogEntryClick), [
    rows,
    onLogEntryClick,
  ]);

  const rowGetter = React.useCallback((i: number) => rows[i], [rows]);
  const minWidth = window.innerWidth - 250;

  return (
    <ReactDataGrid
      columns={columns}
      rowGetter={rowGetter}
      rowsCount={rows.length}
      minHeight={window.innerHeight}
      minWidth={minWidth}
    />
  );
};
