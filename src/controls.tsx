/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import * as React from 'react';
import { ILogItem, wordToLogLevel, LogLevel } from './model';
import { Timestamp } from './timestamp';
import { MultiSelect } from './multi-select';

/**
 * Bottom controls for the data.
 */
export const Controls: React.FC<{
  data: ILogItem<any>[];
  onUpdate: (filtered: ILogItem<any>[]) => void;
}> = ({ data, onUpdate }) => {
  const [selectedTags, updateTags] = React.useState(new Set<string>());
  const [selectedLevels, updateLevels] = React.useState(new Set<LogLevel>());

  React.useEffect(() => {
    onUpdate(data.filter(d => selectedTags.has(d.tag) && selectedLevels.has(d.level)));
  }, [selectedTags, selectedLevels]);

  return (
    <div className="controls">
      <TagSelector data={data} onUpdate={updateTags} />
      <LevelSelector onUpdate={updateLevels} />
      <SystemInfo data={data} />
    </div>
  );
};

const SystemInfo: React.FC<{ data: ILogItem<any>[] }> = ({ data }) => {
  const welcome = React.useMemo(() => data.find(d => d.tag === 'runtime.welcome'), [data]);

  if (!welcome) {
    return <div className="welcome welcome-no-data">No system information found</div>;
  }

  return (
    <div className="welcome">
      <dl>
        <dt>Operating System</dt>
        <dd>{welcome.metadata.os}</dd>
        <dt>Node Version</dt>
        <dd>{welcome.metadata.nodeVersion}</dd>
        <dt>Adapter Version</dt>
        <dd>{welcome.metadata.adapterVersion}</dd>
        <dt>Recorded At</dt>
        <dd>
          <Timestamp value={welcome.timestamp} />
        </dd>
      </dl>
    </div>
  );
};

/**
 * Selects which log tags are shown in the data.
 */
const LevelSelector: React.FC<{
  onUpdate: (tags: Set<LogLevel>) => void;
}> = ({ onUpdate }) => {
  const words = React.useMemo(() => new Set(Object.keys(wordToLogLevel)), []);
  const onUpdateFromWords = React.useCallback(
    (w: Set<string>) =>
      onUpdate(new Set([...w].map(w => wordToLogLevel[w as keyof typeof wordToLogLevel]))),
    [onUpdate],
  );

  return (
    <>
      <h3>Level Filter</h3>
      <MultiSelect values={words} onUpdate={onUpdateFromWords} />
    </>
  );
};

/**
 * Selects which log tags are shown in the data.
 */
const TagSelector: React.FC<{
  data: ILogItem<any>[];
  onUpdate: (tags: Set<string>) => void;
}> = ({ data, onUpdate }) => {
  const tags = React.useMemo(() => {
    const s = new Set<string>();
    for (const row of data) {
      s.add(row.tag);
    }
    return s;
  }, [data]);

  return (
    <>
      <h3>Tag Filter</h3>
      <MultiSelect values={tags} onUpdate={onUpdate} />
    </>
  );
};
