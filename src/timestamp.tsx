/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import * as React from 'react';

export const Timestamp: React.FC<{ value: string | number }> = ({ value }) => (
  <span>{formatTimestamp(value)}</span>
);

export const TimestampSinceEpoch: React.FC<{ value: string | number; epoch: string | number }> = ({
  value,
  epoch,
}) => {
  const [showInterval, setShowInterval] = React.useState(true);
  const swap = React.useCallback(() => setShowInterval(!showInterval), [
    showInterval,
    setShowInterval,
  ]);

  const delta = new Date(value).getTime() - new Date(epoch).getTime();
  return (
    <span onClick={swap} role="button">
      {showInterval ? formatInterval(delta) : formatTimestamp(value)}
    </span>
  );
};

const formatTimestamp = (timestamp: string | number) => {
  return new Date(timestamp).toISOString();
};

const formatInterval = (totalMilliseconds: number): string => {
  let sign = '+';
  if (totalMilliseconds < 0) {
    totalMilliseconds = -totalMilliseconds;
    sign = '-';
  }

  const milliseconds = (totalMilliseconds % 1000).toString().padStart(3, '0');
  const totalSeconds = Math.floor(totalMilliseconds / 1000);
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  const totalMinutes = Math.floor(totalSeconds / 60);

  return `${sign}${totalMinutes}:${seconds}.${milliseconds}`;
};
