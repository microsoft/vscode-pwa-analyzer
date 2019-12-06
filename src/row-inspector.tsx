/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import * as React from 'react';
import { ILogItem, isRecipocalPair } from './model';

// @ts-ignore
import ReactJson from 'react-json-view';

export const RowInspector: React.FC<{
  row: ILogItem<any>;
  rows: ILogItem<any>[];
  close: () => void;
}> = ({ row, rows, close }) => {
  const complement = rows.find(r => isRecipocalPair(r, row));

  const backdropClick = React.useCallback(
    (evt: React.MouseEvent) => {
      if (evt.target instanceof HTMLElement && evt.target.classList.contains('inspector')) {
        close();
      }
    },
    [close],
  );

  React.useEffect(() => {
    const listener = (evt: KeyboardEvent) => (evt.key === 'Escape' ? close() : null);
    document.body.addEventListener('keydown', listener);
    return () => document.body.removeEventListener('keydown', listener);
  }, [close]);

  return (
    // tslint:disable-next-line:react-a11y-event-has-role
    <div className="inspector" onClick={backdropClick}>
      <div>
        <Row value={row} />
        {complement && <Row value={complement} />}
      </div>
    </div>
  );
};

const Row: React.FC<{ value: ILogItem<any> }> = ({ value }) => {
  const sanitized = React.useMemo(() => {
    const { _raw, _index, ...rest } = value;
    return rest;
  }, [value]);

  return (
    <>
      <h1>{value.tag}</h1>
      <ReactJson src={sanitized} displayDataTypes={false} />
    </>
  );
};
