/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import * as React from 'react';
import { ILogItem, logLevelToWord } from './model';
import { TableMetadata } from './table-metadata';
import { TimestampSinceEpoch } from './timestamp';
import ReactDataGrid, { Column, RenderRowProps, Row } from 'react-data-grid';
import { classes } from './helpers';
import { RowSelection } from './row-selection';

const createColumns = (
  epoch: number,
  onLogEntryClick: (item: ILogItem) => void,
): Column<ILogItem<any>>[] => {
  return [
    {
      key: 'level',
      name: 'Level',
      resizable: false,
      width: 50,
      renderCell: ({ row }) => <>{logLevelToWord[row.level]}</>,
    },
    {
      key: 'timestamp',
      name: 'Timestamp',
      resizable: true,
      width: 120,
      renderCell: ({ row }) => <TimestampSinceEpoch value={row.timestamp} epoch={epoch} />,
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
      renderCell: ({ row }) => <TableMetadata item={row} onClick={onLogEntryClick} />,
    },
  ];
};

export const Table: React.FC<{
  epoch: number;
  rows: ILogItem<any>[];
  highlightRows: ReadonlySet<number>;
  selectedRows: RowSelection;
  setSelectedRows(rows: RowSelection): void;
  inspect(row: ILogItem<any>): void;
}> = ({ epoch, rows, inspect, highlightRows, selectedRows, setSelectedRows }) => {
  const columns = React.useMemo(() => createColumns(epoch, inspect), [rows, inspect]);

  const onRowClick = React.useCallback(
    (evt: React.MouseEvent) => {
      let row: number | undefined;
      for (let target = evt.target as HTMLElement | null; target; target = target.parentElement) {
        if (target.dataset.index) {
          // loop upwards from any possible child of the cell
          row = Number(target.dataset.index);
          break;
        }
      }

      if (row === undefined) {
        return;
      }

      if (evt.ctrlKey || evt.metaKey) {
        setSelectedRows(selectedRows.toggle(row));
      } else if (evt.shiftKey) {
        setSelectedRows(selectedRows.range(row));
      } else {
        setSelectedRows(selectedRows.single(row));
      }
    },
    [selectedRows, setSelectedRows],
  );

  const rowRenderer = React.useCallback(
    (key: React.Key, props: RenderRowProps<ILogItem>) => (
        <Row {...props}
        key={key}
        onClick={onRowClick}
        data-index={props.row._index}
        className={classes(
          selectedRows.includes(props.row._index) && 'row-selected',
          highlightRows.has(props.row._index) && 'row-highlighted',
          props.className,
        )} />
    ),
    [onRowClick, selectedRows, highlightRows],
  );


  return (
    <ReactDataGrid
      columns={columns}
      rows={rows}
      renderers={{ renderRow: rowRenderer }}
      className="grid"
    />
  );
};
