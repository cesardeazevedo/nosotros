import { computed, observe } from 'mobx'
import { Observable } from 'rxjs'

/**
 * Dedupe and concat all arguments
 */
export const QUOTE = 'q'
export const EVENT = 'e'
export const PUBKEY = 'p'

export const isEventTag = (tag: string[]) => tag[0] === EVENT
export const isQuoteTag = (tag: string[]) => tag[0] === QUOTE
export const isAuthorTag = (tag: string[]) => tag[0] === PUBKEY

export const isRoot = (tag: string[]) => tag[3] === 'root'
export const isReply = (tag: string[]) => tag[3] === 'reply'
export const isMention = (tag: string[]) => tag[3] === 'mention'

export type ObjectValues<T> = T[keyof T]

export function dedupe<T>(...arrays: Array<T[] | undefined>) {
  return [...new Set(arrays.map((x) => x?.flat() || []).flat())].flat()
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

export function groupKeysToArray(data: Record<string, unknown>[]) {
  return data.reduce<Record<string, unknown[]>>(
    (acc, current) => {
      for (const [key, value] of Object.entries(current)) {
        acc[key] = dedupe(acc[key], [value].flat())
      }
      return acc
    },
    {} as Record<string, unknown[]>,
  )
}

export function groupByKey<T>(data: T[], key: keyof T) {
  return data.reduce<Record<string, T[]>>((acc, current) => {
    acc[current[key] as string] ??= []
    acc[current[key] as string].push(current)
    return acc
  }, {})
}

export function toMap<T>(data: Record<string, unknown>) {
  return new Map<string, T>(Object.entries(data as Record<string, T>) as [string, T][])
}

export function toStream<T>(expression: () => T, fireImmediately = false): Observable<T> {
  const computedValue = computed(expression)
  return new Observable<T>((subscriber) => {
    observe<T>(
      computedValue,
      (props) => {
        subscriber.next(props.newValue)
      },
      fireImmediately,
    )
  })
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

  function replaceRegex(input: string, regex: RegExp) {
    const result = input.split(regex) as (string | T)[]
    for (let i = 1, length = result.length; i < length; i += 2) {
      result[i] = fn(result[i] as string)
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
  return [text].flat().map(replace).flat() as (string | T)[]
}
