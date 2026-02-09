

export function tryAction<T>(fn: () => T): [T | null, Error | null] {
  try { return [fn(), null]; }
  catch (err) { return [null, err instanceof Error ? err : new Error(String(err))]; }
};
