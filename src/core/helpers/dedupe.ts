export function dedupe<T>(...arrays: Array<Array<T | T[] | undefined | null> | undefined | null>) {
  const set = new Set()
  const data = [].concat(...(arrays as never[]))
  for (const item of data) {
    if (item !== '' && item != null) {
      if (Array.isArray(item)) {
        for (const item2 of item as never[]) {
          if (item2 !== '' && item2 != null) {
            set.add(item2)
          }
        }
      } else if (item !== '' && item != null) {
        set.add(item)
      }
    }
  }
  return [...set] as T[]
}
