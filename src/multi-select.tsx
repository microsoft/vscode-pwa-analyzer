/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import * as React from 'react';

/**
 * Selects which log tags are shown in the data.
 */
export const MultiSelect: React.FC<{
  values: ReadonlyArray<string>;
  labels?: ReadonlyArray<string>;
  onUpdate: (tags: ReadonlyArray<string>) => void;
}> = ({ values, onUpdate, labels }) => {
  const [selectedTags, updateTags] = React.useState<ReadonlyArray<string>>(values);
  const updateTagsCallback = React.useCallback(
    (evt: React.ChangeEvent<HTMLSelectElement>) => {
      const options = evt.target.options;
      const result: string[] = [];

      // Not actually iterable, yea it's silly:
      // tslint:disable-next-line
      for (let i = 0; i < options.length; i++) {
        if (options[i].selected) {
          result.push(options[i].value);
        }
      }

      updateTags(result);
    },
    [updateTags],
  );

  React.useEffect(() => onUpdate(selectedTags), [selectedTags]);

  return (
    <select
      multiple
      value={[...selectedTags]}
      // tslint:disable-next-line:react-a11y-no-onchange
      onChange={updateTagsCallback}
      className="tag-selector"
    >
      {[...values].sort().map((t, i) => (
        <option key={t} value={t} aria-selected={selectedTags.includes(t)}>
          {labels ? labels[i] : t}
        </option>
      ))}
    </select>
  );
};
