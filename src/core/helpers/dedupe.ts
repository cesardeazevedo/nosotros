export function dedupe<T>(...arrays: Array<Array<T | T[] | undefined | null> | undefined | null>) {
  const flattened = arrays.flat(Infinity).filter((item): item is T => item != null)
  return Array.from(new Set(flattened))
}
