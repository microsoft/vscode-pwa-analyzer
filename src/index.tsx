/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { FileUpload } from './file-upload';
import { LogView } from './log-view';

import 'react-data-grid/dist/react-data-grid.css';
import 'normalize.css/normalize.css';
import './index.scss';

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
ReactDOM.render(<Root />, root);
