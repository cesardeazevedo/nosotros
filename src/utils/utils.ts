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
