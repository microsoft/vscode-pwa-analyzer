/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import * as React from 'react';
import { ILogItem } from './model';

// @ts-ignore
import ReactJson from 'react-json-view';

export const RowInspector: React.FC<{
  row: ILogItem<any>;
  rows: ILogItem<any>[];
  close: () => void;
}> = ({ row }) => {
  return (
    <div className="inspector">
      <div>
        <h1>{row.tag}</h1>
        <ReactJson src={row.metadata} />
      </div>
    </div>
  );
};
