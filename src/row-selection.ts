/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import { sortedIndex } from 'lodash-es';

export class RowSelection {
  /**
   * An empty selection
   */
  public static readonly empty = new RowSelection([]);

  /**
   * Returns whether the selection is empty.
   */
  public readonly empty = this.rows.length === 0;

  protected constructor(private readonly rows: ReadonlyArray<number>, private lastRow?: number) {}

  /**
   * Toggles whether the given row is selected or now.
   */
  public toggle(row: number) {
    const index = sortedIndex(this.rows, row);
    if (this.rows[index] === row) {
      return new RowSelection([...this.rows.slice(0, index), ...this.rows.slice(index + 1)], row);
    }

    return new RowSelection([...this.rows.slice(0, index), row, ...this.rows.slice(index)], row);
  }

  /**
   * Gets a set containing the rows of this selection.
   */
  public entries() {
    return new Set(this.rows);
  }

  /**
   * Gets whether the given row is in this selection.
   */
  public includes(row: number) {
    return this.rows[sortedIndex(this.rows, row)] === row;
  }

  /**
   * Selects from the last row to the given one.
   */
  public range(toRow: number) {
    let fromRow = this.lastRow;
    const originalToRow = toRow;
    if (fromRow === undefined || fromRow === toRow) {
      return this;
    }

    if (fromRow > toRow) {
      [fromRow, toRow] = [toRow, fromRow];
    }

    const max = this.rows.length ? Math.max(this.rows[this.rows.length - 1], toRow) : toRow;
    const min = this.rows.length ? Math.min(this.rows[0], fromRow) : fromRow;

    const next: number[] = [];
    let rowIndex = 0;
    for (let row = min; row <= max; row++) {
      if (this.rows[rowIndex] === row) {
        rowIndex++;
        next.push(row);
      } else if (row >= fromRow && row <= toRow) {
        next.push(row);
      } else {
        row = (this.rows[rowIndex] || fromRow) - 1;
        continue;
      }
    }

    return new RowSelection(next, originalToRow);
  }

  /**
   * Selects or deselects a single row.
   */
  public single(row: number) {
    return this.rows.length === 1 && this.rows[0] === row
      ? RowSelection.empty
      : new RowSelection([row], row);
  }
}
