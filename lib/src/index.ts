import {
  dlopen,
  FFIType,
  read,
  toArrayBuffer,
  type ConvertFns,
  type Pointer,
} from "bun:ffi";
import path from "path";

const ffis = {
  create_channel: {
    args: [FFIType.cstring],
    returns: FFIType.pointer,
  },
  await_message: {
    args: [FFIType.pointer],
    returns: FFIType.pointer,
  },

  test_showmap: {
    args: [FFIType.pointer],
    returns: FFIType.void,
  },
  test_async: {
    args: [FFIType.pointer, FFIType.cstring],
    returns: FFIType.void,
  },
};

const lib = path.join(
  import.meta.dirname,
  "libraries/core" + (process.platform === "win32" ? ".dll" : ".so")
);

export default class SyncRs {
  symbols;
  functions: Map<string, (tx: Pointer) => Promise<void>> = new Map();

  constructor() {
    const { symbols } = dlopen(lib, ffis);

    this.symbols = symbols;
  }

  runSync(fn: (tx: Pointer) => Promise<void>): string {
    const id = Math.random().toString(36).substring(7);

    this.functions.set(id, fn);

    const tx = this.symbols.create_channel(this.CString(id)) as Pointer;

    fn(tx);

    return this.String(this.symbols.await_message(this.CString(id)) as Pointer);
  }

  private CString(str: string) {
    return new Uint8Array([...new TextEncoder().encode(str), 0]);
  }

  private String(ptr: Pointer) {
    return new TextDecoder().decode(new Uint8Array(toArrayBuffer(ptr)));
  }
}

export function asyncTestFn(tx: Pointer, text: string) {
  const { symbols } = dlopen(lib, ffis);

  symbols.test_async(
    tx,
    new Uint8Array([...new TextEncoder().encode(text), 0])
  );
}
