/**
 * SSR-safe localStorage shim.
 *
 * Demo repositories persist to localStorage, but the app is server-rendered and
 * `localStorage` does not exist in the server runtime — touching it there throws
 * `ReferenceError: localStorage is not defined` and turns every page into a 500.
 *
 * Importing this module installs an in-memory, non-persistent stand-in on the
 * server. In the browser the real localStorage is untouched.
 */

const memory = new Map<string, string>();

const memoryStorage: Storage = {
  get length() {
    return memory.size;
  },
  key: (index: number) => Array.from(memory.keys())[index] ?? null,
  getItem: (key: string) => memory.get(key) ?? null,
  setItem: (key: string, value: string) => {
    memory.set(key, String(value));
  },
  removeItem: (key: string) => {
    memory.delete(key);
  },
  clear: () => {
    memory.clear();
  },
};

if (typeof globalThis.localStorage === "undefined") {
  Object.defineProperty(globalThis, "localStorage", {
    value: memoryStorage,
    configurable: true,
    writable: true,
  });
}

export {};
