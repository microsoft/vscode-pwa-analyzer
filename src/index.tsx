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


export const Root = () => {
  const [file, setFile] = React.useState<string | null>(null);

  return file ? <LogView file={file} /> : <FileUpload onChange={setFile} />;
};

const root = document.createElement('div');
root.classList.add('root');
document.body.appendChild(root);
ReactDOM.render(<Root />, root);
