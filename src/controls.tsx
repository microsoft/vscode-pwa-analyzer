/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import * as React from 'react';
import { ILogItem, wordToLogLevel, LogLevel } from './model';
import { Timestamp } from './timestamp';
import { MultiSelect } from './multi-select';
import { useDebouncedCallback } from 'use-debounce';

/**
 * Bottom controls for the data.
 */
export const Controls: React.FC<{
  data: ILogItem<any>[];
  onUpdate: (filtered: ILogItem<any>[]) => void;
}> = ({ data, onUpdate }) => {
  const [selectedTags, updateTags] = React.useState(new Set<string>());
  const [selectedLevels, updateLevels] = React.useState(new Set<LogLevel>());
  const [selectedPatterns, updatePatterns] = React.useState<string | RegExp>('');
  const [filteredRows, setFilteredRows] = React.useState({ length: data.length, time: '0' });

  React.useEffect(() => {
    const start = performance.now();
    const filtered = data.filter(
      d =>
        selectedTags.has(d.tag) &&
        selectedLevels.has(d.level) &&
        (typeof selectedPatterns === 'string'
          ? d._raw.includes(selectedPatterns)
          : selectedPatterns.test(d._raw)),
    );
    const end = performance.now();

    setFilteredRows({ length: filtered.length, time: (end - start).toFixed(2) });
    onUpdate(filtered);
  }, [selectedTags, selectedLevels, selectedPatterns]);

  return (
    <div className="controls">
      {filteredRows.length} / {data.length} rows in {filteredRows.time}ms
      <TagSelector data={data} onUpdate={updateTags} />
      <LevelSelector onUpdate={updateLevels} />
      <GrepFilter onUpdate={updatePatterns} />
      <SystemInfo data={data} />
    </div>
  );
};

const SystemInfo: React.FC<{ data: ILogItem<any>[] }> = ({ data }) => {
  const welcome = React.useMemo(() => data.find(d => d.tag === 'runtime.welcome'), [data]);

  if (!welcome) {
    return (
      <div className="welcome welcome-no-data">
        <h3>System Information</h3>
        No system information found
      </div>
    );
  }

  return (
    <div className="welcome">
      <h2>System Information</h2>
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
const GrepFilter: React.FC<{
  onUpdate: (filter: string | RegExp) => void;
}> = ({ onUpdate }) => {
  const [debouncedInputChange] = useDebouncedCallback(
    (filter: string | RegExp) => onUpdate(filter),
    500,
  );

  const onInputChange = React.useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      const reParts = /^\/(.+)\/([a-z]*)$/.exec(evt.target.value);
      if (reParts) {
        debouncedInputChange(new RegExp(reParts[1], reParts[2]));
      } else {
        debouncedInputChange(evt.target.value);
      }
    },
    [debouncedInputChange],
  );

  return (
    <>
      <h3>Grep Filter</h3>
      <input
        placeholder="A substring or /regex/i"
        onChange={onInputChange}
        className="grep-filter"
      />
    </>
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
    (newWords: Set<string>) =>
      onUpdate(new Set([...newWords].map(w => wordToLogLevel[w as keyof typeof wordToLogLevel]))),
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
