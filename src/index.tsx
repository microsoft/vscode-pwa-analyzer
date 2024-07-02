/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { FileUpload } from './file-upload';
import { LogView } from './log-view';

import 'normalize.css/normalize.css';
import 'react-data-grid/lib/styles.css';
import './index.css';

const Root = () => {
  const [file, setFile] = React.useState<string | null>(null);
  if (file) {
    return <LogView file={file} />;
  }
  return (
    <div className="file">
      <h1>vscode-pwa-analyzer</h1>
      <p>
        Collect a log file by setting <code>trace: true</code> in your <code>launch.json</code>,
        then upload it here.
      </p>
      <FileUpload onChange={setFile} />
    </div>
  );
};

const root = document.createElement('div');
root.classList.add('root');
document.body.appendChild(root);
createRoot(root).render(<Root />);
