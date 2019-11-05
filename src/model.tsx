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

export interface ILogItem<T> {
  _raw: string;
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

export const isRecipocalPair = (a: ILogItem<any>, b: ILogItem<any>) => {
  if (a.tag === LogTag.DapReceive || a.tag === LogTag.CdpReceive) {
    [a, b] = [b, a];
  }

  const messageA = a.metadata && a.metadata.message;
  const messageB = b.metadata && b.metadata.message;

  if (a.tag === LogTag.DapSend) {
    return b.tag === LogTag.DapReceive && messageA.seq === messageB.request_seq;
  }

  if (a.tag === LogTag.CdpSend) {
    return b.tag === LogTag.CdpReceive && messageB.id === messageA.id;
  }

  return false;
};
