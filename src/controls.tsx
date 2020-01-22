/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import * as React from 'react';
import { ILogItem, wordToLogLevel, LogLevel, isDap, isCdp } from './model';
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
  onHighlight: (rows: ReadonlySet<number>) => void;
}> = ({ data, onUpdate, onHighlight, selection }) => {
  const [selectedTags, updateTags] = React.useState(new Set<string>());
  const [selectedLevels, updateLevels] = React.useState(new Set<LogLevel>());
  const [customFilters, setCustomFilters] = React.useState<ReadonlyArray<IFilter>>([
    createFilter('telemetry', true),
  ]);
  const [connectionFilters, setConnectionFilters] = React.useState<
    ReadonlyArray<(row: ILogItem) => boolean>
  >([]);
  const [filteredRows, setFilteredRows] = React.useState({ length: data.length, time: '0' });
  const [highlightRows, setHighlightedRows] = React.useState<ReadonlySet<number>>(new Set());

  const toggleHighlight = React.useCallback(
    (rows: ReadonlySet<number>) => {
      const nextRows = new Set([...highlightRows]);

      if (![...rows].some(r => !highlightRows.has(r))) {
        rows.forEach(r => nextRows.delete(r));
      } else {
        rows.forEach(r => nextRows.add(r));
      }

      setHighlightedRows(nextRows);
      onHighlight(nextRows);
    },
    [highlightRows, onHighlight],
  );

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

      for (const filter of connectionFilters) {
        if (!filter(row)) {
          return false;
        }
      }

      return true;
    });
    const end = performance.now();

    setFilteredRows({ length: filtered.length, time: (end - start).toFixed(2) });
    onUpdate(filtered);
  }, [selectedTags, selectedLevels, customFilters, connectionFilters]);

  return (
    <div className="controls">
      {filteredRows.length} / {data.length} rows in {filteredRows.time}ms
      <TagSelector data={data} onUpdate={updateTags} />
      <LevelSelector onUpdate={updateLevels} />
      <ConnectionSelector data={data} onUpdate={setConnectionFilters} />
      <Filters
        selection={selection}
        filters={customFilters}
        onHighlight={toggleHighlight}
        onUpdate={setCustomFilters}
      />
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

const createFilter = (input: string, inverted: boolean): IFilter => {
  const reParts = /^\/(.+)\/([a-z]*)$/.exec(input);
  const name = `grep ${reParts ? '-e ' : ''} ${inverted ? '-v ' : ''} ${input}`;
  if (reParts) {
    const re = new RegExp(reParts[1], reParts[2]);
    // (inverted) XOR (is a match)
    return { name, test: r => inverted !== re.test(r._raw) };
  } else {
    return { name, test: r => inverted !== r._raw.includes(input) };
  }
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
      addFilter(createFilter(name, inverted));
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
  onHighlight(filters: ReadonlySet<number>): void;
  onUpdate(filters: ReadonlyArray<IFilter>): void;
}> = ({ selection, filters, onUpdate, onHighlight }) => {
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

  const highlightSelection = React.useCallback(() => {
    onHighlight(selection.entries());
  }, [onHighlight, selection]);

  return (
    <>
      <GrepFilter addFilter={addFilter} />
      <h3>Filters</h3>
      <MultiSelect values={filterValues} labels={filterNames} onUpdate={setSelectedFilters} />
      <div className="form-control-row">
        <button onClick={removeFilter} disabled={!selectedFilters.length}>
          Remove
        </button>
        <button onClick={highlightSelection} disabled={selection.empty}>
          Highlight Rows
        </button>
        <button onClick={filterToSelection} disabled={selection.empty}>
          Filter Rows
        </button>
      </div>
    </>
  );
};

/**
 * Selects which log tags are shown in the data.
 */
const ConnectionSelector: React.FC<{
  data: ILogItem[];
  onUpdate: (tags: ReadonlyArray<(item: ILogItem) => boolean>) => void;
}> = ({ data, onUpdate }) => {
  const tags = React.useMemo(() => {
    const s = new Set<string>();
    for (const row of data) {
      const connectionId = row.metadata && row.metadata.connectionId;
      if (connectionId !== undefined) {
        s.add(`${isDap(row) ? 'DAP #' : 'CDP #'}${connectionId}`);
      }
    }
    return [...s];
  }, [data]);

  const onUpdateFromArray = React.useCallback(
    (filters: ReadonlyArray<string>) =>
      onUpdate(
        filters.map(filter => {
          const id = Number(filter.slice(5));
          return filter.startsWith('DAP')
            ? row => !isDap(row) || row.metadata.connectionId === id
            : row => !isCdp(row) || row.metadata.connectionId === id;
        }),
      ),
    [onUpdate],
  );

  return (
    <>
      <h3>Connection Filter</h3>
      <MultiSelect values={tags} onUpdate={onUpdateFromArray} style={{ height: 75 }} />
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
      <MultiSelect values={words} onUpdate={onUpdateFromWords} style={{ height: 100 }} />
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
