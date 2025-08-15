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
