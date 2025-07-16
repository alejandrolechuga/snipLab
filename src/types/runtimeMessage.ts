export enum ExtensionMessageType {
  STATE_UPDATE = 'STATE_UPDATE',
  RECEIVER_READY = 'RECEIVER_READY',
  RULE_MATCHED = 'RULE_MATCHED',
  RUN_SCRIPT = 'RUN_SCRIPT',
}

export enum ExtensionMessageOrigin {
  DEVTOOLS = 'devtools',
  RECEIVER = 'receiver',
  CONTENT_SCRIPT = 'content-script',
  BACKGROUND = 'background',
}
