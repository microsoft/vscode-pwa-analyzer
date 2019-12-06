/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import * as React from 'react';
import { ILogItem, wordToLogLevel, LogLevel } from './model';
import { Timestamp } from './timestamp';
import { MultiSelect } from './multi-select';
import { RowSelection } from './row-selection';

export interface IFilter {
  name: string;
  test(row: ILogItem, index: number): boolean;
}

/**
 * Bottom controls for the data.
 */
export const Controls: React.FC<{
  data: ILogItem<any>[];
  selection: RowSelection;
  onUpdate: (filtered: ILogItem<any>[]) => void;
}> = ({ data, onUpdate, selection }) => {
  const [selectedTags, updateTags] = React.useState(new Set<string>());
  const [selectedLevels, updateLevels] = React.useState(new Set<LogLevel>());
  const [customFilters, setCustomFilters] = React.useState<ReadonlyArray<IFilter>>([]);
  const [filteredRows, setFilteredRows] = React.useState({ length: data.length, time: '0' });

  React.useEffect(() => {
    const start = performance.now();
    const filtered = data.filter((row, i) => {
      if (!selectedTags.has(row.tag)) {
        return false;
      }
      if (!selectedLevels.has(row.level)) {
        return false;
      }

      for (const filter of customFilters) {
        if (!filter.test(row, i)) {
          return false;
        }
      }

      return true;
    });
    const end = performance.now();

    setFilteredRows({ length: filtered.length, time: (end - start).toFixed(2) });
    onUpdate(filtered);
  }, [selectedTags, selectedLevels, customFilters]);

  return (
    <div className="controls">
      {filteredRows.length} / {data.length} rows in {filteredRows.time}ms
      <TagSelector data={data} onUpdate={updateTags} />
      <LevelSelector onUpdate={updateLevels} />
      <Filters selection={selection} filters={customFilters} onUpdate={setCustomFilters} />
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
  addFilter(filter: IFilter): void;
}> = ({ addFilter }) => {
  const [input, setInput] = React.useState('');
  const [inverted, setInverted] = React.useState(false);
  const onInvertedChange = React.useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => setInverted(evt.target.checked),
    [setInverted],
  );

  const onInputChange = React.useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => setInput(evt.target.value),
    [setInput],
  );

  const add = React.useCallback(
    (evt: React.FormEvent) => {
      evt.preventDefault();

      const reParts = /^\/(.+)\/([a-z]*)$/.exec(input);
      const name = `grep ${reParts ? '-e ' : ''} ${inverted ? '-v ' : ''} ${input}`;
      if (reParts) {
        const re = new RegExp(reParts[1], reParts[2]);
        // (inverted) XOR (is a match)
        addFilter({ name, test: r => inverted !== re.test(r._raw) });
      } else {
        addFilter({ name, test: r => inverted !== r._raw.includes(input) });
      }

      setInput('');
    },
    [addFilter, setInput, inverted, input],
  );

  return (
    <>
      <h3>Grep</h3>
      <form onSubmit={add}>
        <input
          placeholder="A substring or /regex/i"
          onChange={onInputChange}
          value={input}
          className="grep-filter"
        />
        <div className="form-control-row">
          <input
            type="checkbox"
            checked={inverted}
            onChange={onInvertedChange}
            aria-checked={inverted}
            value="Invert"
          />{' '}
          Invert
          <span style={{ flex: 1 }} />
          <input type="submit" aria-label="Add Filter" onClick={add} value="Add" />
        </div>
      </form>
    </>
  );
};

const Filters: React.FC<{
  selection: RowSelection;
  filters: ReadonlyArray<IFilter>;
  onUpdate(filters: ReadonlyArray<IFilter>): void;
}> = ({ selection, filters, onUpdate }) => {
  const filterValues = React.useMemo(() => filters.map((_, i) => String(i)), [filters]);
  const filterNames = React.useMemo(() => filters.map(f => f.name), [filters]);
  const [selectedFilters, setSelectedFilters] = React.useState<ReadonlyArray<string>>([]);

  const removeFilter = React.useCallback(() => {
    const indices = new Set(selectedFilters.map(f => Number(f)));
    onUpdate(filters.filter((_, i) => !indices.has(i)));
  }, [selectedFilters, filters, onUpdate]);

  const addFilter = React.useCallback((filter: IFilter) => onUpdate([...filters, filter]), [
    filters,
    onUpdate,
  ]);

  const filterToSelection = React.useCallback(() => {
    const rows = selection.entries();
    addFilter({ name: `Filter to ${rows.size} rows`, test: (_, i) => rows.has(i) });
  }, [addFilter, selection]);

  return (
    <>
      <GrepFilter addFilter={addFilter} />
      <h3>Filters</h3>
      <MultiSelect values={filterValues} labels={filterNames} onUpdate={setSelectedFilters} />
      <div className="form-control-row">
        <button onClick={removeFilter} disabled={!selectedFilters.length}>
          Remove
        </button>
        <button onClick={filterToSelection} disabled={selection.empty}>
          Filter Selected Rows
        </button>
      </div>
    </>
  );
};

/**
 * Selects which log tags are shown in the data.
 */
const LevelSelector: React.FC<{
  onUpdate: (tags: Set<LogLevel>) => void;
}> = ({ onUpdate }) => {
  const words = React.useMemo(() => Object.keys(wordToLogLevel), []);
  const onUpdateFromWords = React.useCallback(
    (newWords: ReadonlyArray<string>) =>
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
    return [...s];
  }, [data]);

  const onUpdateFromArray = React.useCallback((t: ReadonlyArray<string>) => onUpdate(new Set(t)), [
    onUpdate,
  ]);

  return (
    <>
      <h3>Tag Filter</h3>
      <MultiSelect values={tags} onUpdate={onUpdateFromArray} />
    </>
  );
};
