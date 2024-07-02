/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import * as React from 'react';
import {
  ILogItem,
  protocolTags,
  requestParams,
  responseData,
  getReciprocalId,
  isReceive,
} from './model';
import { classes } from './helpers';

const stringifyMetadata = (metadata: any) => {
  return metadata === undefined ? 'undefined' : JSON.stringify(metadata).slice(0, 200);
};

const onReciprocalHover = (evt: React.MouseEvent) => {
  const ownId = (evt.target as HTMLElement).dataset.reciprocalId;
  const matched = document.querySelectorAll(`[data-reciprocal-id=${ownId}]`);
  if (matched.length) {
    Array.from(matched).map(m => m.classList.add('inline-message-matched'));
  }
};

const offReciprocalHover = () => {
  Array.from(document.querySelectorAll('.inline-message-matched')).forEach(m =>
    m.classList.remove('inline-message-matched'),
  );
};

const getPrefix = (item: ILogItem) => {
  if (!item.message) {
    return '';
  }

  if (item.metadata) {
    return `${item.message}: `;
  }

  return item.message;
};

// tslint:disable-next-line: react-unused-props-and-state
export const TableMetadata: React.FC<{ item: ILogItem; onClick: (item: ILogItem) => void }> = ({
  item,
  onClick: onClickRaw,
}) => {
  const onClick = React.useCallback((evt: React.MouseEvent) => {
    onClickRaw(item);
    evt.stopPropagation();
  }, [item, onClickRaw]);

  if (!protocolTags.includes(item.tag)) {
    return (
      <span className="inline-message" onClick={onClick} role="button">
        {getPrefix(item)}
        {stringifyMetadata(item.metadata)}
      </span>
    );
  }

  const directionClass = isReceive(item) ? 'inline-message-receive' : 'inline-message-send';

  const request = requestParams(item)!;
  if (request) {
    return (
      <span
        className={classes('inline-message', 'inline-message-request', directionClass)}
        data-reciprocal-id={getReciprocalId(item)}
        onMouseEnter={onReciprocalHover}
        onMouseLeave={offReciprocalHover}
        onClick={onClick}
        role="button"
      >
        {getPrefix(item)}
        {request.method}({stringifyMetadata(request.params)})
      </span>
    );
  }

  return (
    <span
      className={classes('inline-message', 'inline-message-response', directionClass)}
      data-reciprocal-id={getReciprocalId(item)}
      onMouseEnter={onReciprocalHover}
      onMouseLeave={offReciprocalHover}
      onClick={onClick}
      role="button"
    >
      {getPrefix(item)}
      {stringifyMetadata(responseData(item))}
    </span>
  );
};
