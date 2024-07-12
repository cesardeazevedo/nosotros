export function removeEmptyKeys<T extends object>(obj: T) {
  const result: T = {} as T
  for (const [key, value] of Object.entries(obj)) {
    if (Object.keys(value).length > 0) {
      result[key as keyof T] = value
    }
  }
  return result
}
