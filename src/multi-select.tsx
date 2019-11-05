/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import * as React from 'react';

/**
 * Selects which log tags are shown in the data.
 */
export const MultiSelect: React.FC<{
  values: Set<string>;
  onUpdate: (tags: Set<string>) => void;
}> = ({ values, onUpdate }) => {
  const [selectedTags, updateTags] = React.useState<Set<string>>(values);
  const updateTagsCallback = React.useCallback(
    (evt: React.ChangeEvent<HTMLSelectElement>) => {
      const options = evt.target.options;
      const result = new Set<string>();

      // Not actually iterable, yea it's silly:
      // tslint:disable-next-line
      for (let i = 0; i < options.length; i++) {
        if (options[i].selected) {
          result.add(options[i].value);
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
      {[...values].map(t => (
        <option key={t} value={t} aria-selected={selectedTags.has(t)}>
          {t}
        </option>
      ))}
    </select>
  );
};
