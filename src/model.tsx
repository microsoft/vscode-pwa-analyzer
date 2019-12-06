/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

/**
 * Copied partly from vscode-pwa
 */

export const enum LogLevel {
  Verbose = 0,
  Info,
  Warn,
  Error,
  Fatal,
  Never,
}

export const logLevelToWord = {
  [LogLevel.Verbose]: 'VERB',
  [LogLevel.Info]: 'INFO',
  [LogLevel.Warn]: 'WARN',
  [LogLevel.Error]: 'ERROR',
  [LogLevel.Fatal]: 'FATAL',
  [LogLevel.Never]: 'NEVER',
};

export const wordToLogLevel = {
  VERB: LogLevel.Verbose,
  INFO: LogLevel.Info,
  WARN: LogLevel.Warn,
  ERROR: LogLevel.Error,
  FATAL: LogLevel.Fatal,
};

export interface ILogItem<T = any> {
  _raw: string;
  _index: number;
  timestamp: number;
  message?: string;
  metadata?: T;
  tag: string;
  level: LogLevel;
}

// Known logs tags
export const enum LogTag {
  Runtime = 'runtime',
  RuntimeWelcome = 'runtime.welcome',
  RuntimeException = 'runtime.exception',
  RuntimeSourceMap = 'runtime.sourcemap',
  CdpSend = 'cdp.send',
  CdpReceive = 'cdp.receive',
  DapSend = 'dap.send',
  DapReceive = 'dap.receive',
}

export const protocolTags: string[] = [
  LogTag.CdpReceive,
  LogTag.CdpSend,
  LogTag.DapSend,
  LogTag.DapReceive,
];

export const isReceive = ({ tag }: ILogItem) =>
  tag === LogTag.CdpReceive || tag === LogTag.DapReceive;

export const isSend = ({ tag }: ILogItem) => tag === LogTag.CdpSend || tag === LogTag.DapSend;

export const isDap = ({ tag }: ILogItem) => tag === LogTag.DapSend || tag === LogTag.DapReceive;

export const isCdp = ({ tag }: ILogItem) => tag === LogTag.CdpReceive || tag === LogTag.CdpSend;

/**
 * Returns if the item is a CDP or DAP response.
 */
export const isRequest = (item: ILogItem) => {
  if (isCdp(item)) {
    return !!item.metadata.message.method;
  }

  if (isDap(item)) {
    return item.metadata.message.type === 'request';
  }

  return false;
};

/**
 * Returns if the item is a CDP or DAP response.
 */
export const isResponse = (item: ILogItem) => {
  if (isCdp(item)) {
    return !!item.metadata.message.result;
  }

  if (isDap(item)) {
    return item.metadata.message.type === 'response';
  }

  return false;
};

/**
 * Gets the request method and parameters.
 */
export const requestParams = (item: ILogItem) => {
  if (isDap(item) && item.metadata.message.type === 'event') {
    return { method: item.metadata.message.event, params: item.metadata.message.body };
  }

  if (!isRequest(item)) {
    return undefined;
  }

  if (isCdp(item)) {
    return { method: item.metadata.message.method, params: item.metadata.message.params };
  }

  if (isDap(item)) {
    return { method: item.metadata.message.command, params: item.metadata.message.arguments };
  }

  return undefined;
};

/**
 * Returns the response data for the given row
 */
export const responseData = (item: ILogItem) => {
  if (!isResponse(item)) {
    return undefined;
  }

  return isDap(item) ? item.metadata.message.body : item.metadata.message.result;
};

/**
 * Returns an ID representing a reciprocal pair for the log item.
 */
export const getReciprocalId = (item: ILogItem) => {
  if (isCdp(item)) {
    return `cdp-${item.metadata.message.id}`;
  }

  if (isDap(item)) {
    return isRequest(item)
      ? `dap-${item.metadata.message.seq}`
      : isResponse(item)
      ? `dap-${item.metadata.message.request_seq}`
      : undefined;
  }

  return undefined;
};

/**
 * Gets whether the two items are a request/response pair.
 */
export const isRecipocalPair = (a: ILogItem, b: ILogItem): boolean => {
  if (a.tag === b.tag) {
    return false;
  }

  const idA = getReciprocalId(a);
  const idB = getReciprocalId(b);
  return !!idA && idA === idB;
};
