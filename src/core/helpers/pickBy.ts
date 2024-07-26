export function pickBy<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result: Partial<T> = {}
  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key]
    }
  })
  return result as Pick<T, K>
}
