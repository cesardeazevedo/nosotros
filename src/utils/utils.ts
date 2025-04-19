export function fallbackEmoji(reaction?: string) {
  switch (reaction) {
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
