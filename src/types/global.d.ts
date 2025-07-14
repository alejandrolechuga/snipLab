interface SnipLabMainWorldAPI {
  [key: string]: any;
  setGlobal: (varName: string, value: unknown) => void;
  getGlobal: (varName: string) => unknown;
  executeFunction: (funcString: string, argsArray: unknown[]) => void;
}

interface Window {
  __snipLabMainWorldAPI?: SnipLabMainWorldAPI;
}
