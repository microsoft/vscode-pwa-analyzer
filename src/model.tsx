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
  const messageA = a.metadata && a.metadata.message;
  const messageB = b.metadata && b.metadata.message;

  switch (a.tag) {
    case LogTag.DapSend:
      if (b.tag !== LogTag.DapReceive || messageA.seq !== messageB.seq) {
        return false;
      }

      return messageA.type !== messageB.type; // it's a send/recv pair

    case LogTag.DapReceive:
      if (b.tag !== LogTag.DapSend || messageA.seq !== messageB.seq) {
        return false;
      }

      return messageA.type !== messageB.type; // it's a send/recv pair

    case LogTag.CdpReceive:
      if (b.tag !== LogTag.CdpSend || messageA.id !== messageB.id) {
        return false;
      }

      return !!messageA.method === !!messageB.method; // exactly one is a method call

    case LogTag.CdpSend:
      if (b.tag !== LogTag.CdpReceive || messageA.id !== messageB.id) {
        return false;
      }

      return !!messageA.method === !!messageB.method; // exactly one is a method call

    default:
      return false;
  }
};
