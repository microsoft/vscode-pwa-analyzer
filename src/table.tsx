/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import * as React from 'react';
import { ILogItem, logLevelToWord } from './model';
import { TableMetadata } from './table-metadata';
import { TimestampSinceEpoch } from './timestamp';
import ReactDataGrid, { Column, RowRendererProps, Row } from 'react-data-grid';
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
      formatter: ({ row }) => <>{logLevelToWord[row.level]}</>,
    },
    {
      key: 'timestamp',
      name: 'Timestamp',
      resizable: true,
      width: 120,
      formatter: ({ row }) => <TimestampSinceEpoch value={row.timestamp} epoch={epoch} />,
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
type RealRowRendererProps = RowRendererProps<ILogItem> & {
  renderBaseRow: (props: RowRendererProps<ILogItem>) => React.ReactElement;
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

  const rowRenderer: React.FC<RealRowRendererProps> = React.useCallback(
    props => (
      <div
        role="button"
        className={classes(
          selectedRows.includes(props.row._index) && 'row-selected',
          highlightRows.has(props.row._index) && 'row-highlighted',
        )}
        onClick={onRowClick}
        data-index={props.row._index}
      >
        <Row {...props} />
      </div>
    ),
    [onRowClick, selectedRows, highlightRows],
  );

  const minWidth = window.innerWidth - 250;

  return (
    <ReactDataGrid<ILogItem, '_index', unknown>
      columns={columns}
      rows={rows}
      rowRenderer={rowRenderer}
      height={window.innerHeight}
      width={minWidth}
    />
  );
};
