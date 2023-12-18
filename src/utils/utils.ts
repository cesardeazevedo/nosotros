/**
 * Dedupe and concat all arguments
 */
const QUOTE = 'q'
const EVENT = 'e'
const PUBKEY = 'p'

export const isEventTag = (tag: string[]) => tag[0] === EVENT
export const isQuoteTag = (tag: string[]) => tag[0] === QUOTE
export const isAuthorTag = (tag: string[]) => tag[0] === PUBKEY

export const isMention = (tag: string[]) => tag[3] === 'mention'

export type ObjectValues<T> = T[keyof T]

export function dedupe<T>(...arrays: Array<Array<T | T[] | undefined | null> | undefined | null>) {
  const flattened = arrays.flat(Infinity).filter((item): item is T => item != null)
  return Array.from(new Set(flattened))
}

export function pickBy<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result: Partial<T> = {}
  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key]
    }
  })
  return result as Pick<T, K>
}

type Flat<T> = T extends Array<Array<infer U>> ? U[] : T
/**
 * [{ a: 1 }, { a: 2 }] => { a: [1, 2] }
 */
export function groupKeysToArray<T>(data: Array<Record<string, T> | undefined>) {
  return data.reduce<Record<string, Flat<T>>>((acc, current) => {
    for (const [key, value] of Object.entries(current || {})) {
      acc[key] = dedupe(acc[key] as unknown[], [value]) as Flat<T>
    }
    return acc
  }, {})
}

export function removeEmptyKeys<T extends object>(obj: T) {
  const result: T = {} as T
  for (const [key, value] of Object.entries(obj)) {
    if (value && Object.keys(value).length > 0) {
      result[key as keyof T] = value
    }
  }
  return result
}

export function toMap<T>(data: Record<string, unknown>) {
  return new Map<string, T>(Object.entries(data as Record<string, T>) as [string, T][])
}

export function replaceToArray<T>(
  text: string | (string | T)[],
  pattern: string | RegExp,
  fn: (match: string) => string | T,
): (string | T)[] {
  function replaceString(input: string, patternStr: string) {
    const index = input.indexOf(patternStr)
    if (index !== -1) {
      return [
        input.substring(0, index),
        fn(input.substring(index, index + patternStr.length)),
        input.substring(index + patternStr.length, input.length),
      ]
    }
    return [input]
  }

  function replaceRegex<T>(input: string, regex: RegExp) {
    const result: (string | T)[] = []
    let lastIndex = 0
    input.replace(regex, (match, ...args) => {
      const index = args[args.length - 2]
      result.push(input.substring(lastIndex, index))
      result.push(fn(match) as T)
      lastIndex = index + match.length
      return match
    })
    if (lastIndex < input.length) {
      result.push(input.substring(lastIndex))
    }

    return result
  }

  function replace(input: string | T) {
    if (typeof input === 'string') {
      const result = typeof pattern === 'string' ? replaceString(input, pattern) : replaceRegex(input, pattern)
      return result.filter((x: unknown) => x !== '')
    }
    return input
  }
  return [text].flat().flatMap(replace) as (string | T)[]
}
