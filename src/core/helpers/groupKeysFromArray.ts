import { dedupe } from './dedupe'

/**
 * [{ a: 1 }, { a: 2 }] => { a: [1, 2] }
 */
export function groupKeysFromArray<T>(data: Array<T>): T {
  return data?.reduce((acc, current) => {
    const accum = acc as Record<string, unknown[]>
    for (const [key, value] of Object.entries(current || {})) {
      accum[key] = dedupe([accum[key]], [value])
    }
    return acc
  }, {} as T)
}
