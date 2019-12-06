/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import * as React from 'react';
import { ILogItem, logLevelToWord } from './model';
import { TableMetadata } from './table-metadata';
import { TimestampSinceEpoch } from './timestamp';
import ReactDataGrid, { Column, IRowRendererProps } from 'react-data-grid';
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
      formatter: ({ row }) => <TableMetadata item={row} onClick={onLogEntryClick} />,
    },
  ];
};

/**
 * The default provided props are missing `renderBaseRow`, but it actually
 * exists. Fix that!
 */
type RowRendererProps = IRowRendererProps<ILogItem> & {
  renderBaseRow: (props: IRowRendererProps<ILogItem>) => React.ReactElement;
};

export const Table: React.FC<{
  epoch: number;
  rows: ILogItem<any>[];
  selectedRows: RowSelection;
  setSelectedRows(rows: RowSelection): void;
  inspect(row: ILogItem<any>): void;
}> = ({ epoch, rows, inspect, selectedRows, setSelectedRows }) => {
  const columns = React.useMemo(() => createColumns(epoch, inspect), [rows, inspect]);
  const rowGetter = React.useCallback((i: number) => rows[i], [rows]);

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

  const rowRenderer: React.FC<RowRendererProps> = React.useCallback(
    ({ renderBaseRow, ...props }) => (
      <div
        role="button"
        className={classes(selectedRows.includes(props.idx) && 'row-selected')}
        onClick={onRowClick}
        data-index={props.idx}
      >
        {renderBaseRow(props)}
      </div>
    ),
    [onRowClick, selectedRows],
  );

  const minWidth = window.innerWidth - 250;

  return (
    <ReactDataGrid
      columns={columns}
      rowGetter={rowGetter}
      rowsCount={rows.length}
      rowRenderer={rowRenderer}
      minHeight={window.innerHeight}
      minWidth={minWidth}
    />
  );
};
