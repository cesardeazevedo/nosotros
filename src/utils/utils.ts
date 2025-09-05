export function fallbackEmoji(reaction: string) {
  switch (reaction) {
    case '':
    case '+':
      return '🤙'
    case '-':
      return '👎'
    default:
      if (reaction && reaction.indexOf(':') > -1) {
        return '🤙'
      }
      return reaction
  }
}

// removes undefined and empty strings from last items in tags
export const compactArray = (x: Array<Array<string | undefined>>): string[][] => {
  return x
    .filter((x) => x.length > 1)
    .map((y) => {
      const filtered = y.filter((z): z is string => z !== undefined)
      const lastNonEmptyIndex = filtered.findLastIndex((z) => z !== '')
      return filtered.slice(0, lastNonEmptyIndex + 1)
    })
}

export function compactObject<T>(input: T) {
  if (input === null || typeof input !== 'object' || Array.isArray(input)) {
    return input
  }

  const result: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    if (value === undefined || value === '') {
      continue
    }
    if (Array.isArray(value) && value.length === 0) {
      continue
    }
    if (typeof value === 'object' && value !== null && !Array.isArray(value) && Object.keys(value).length === 0) {
      continue
    }
    result[key] = value
  }
  return result as T
}

export function dedupeById<T extends { id: string }>(items: T[] | undefined = []) {
  return [...new Map([...items].map((item) => [item.id, item])).values()]
}
