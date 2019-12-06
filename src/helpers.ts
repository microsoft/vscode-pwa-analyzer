/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

// tslint:disable-next-line: export-name
export const classes = (...cls: (string | undefined | null | false)[]) =>
  cls.filter(Boolean).join(' ');
