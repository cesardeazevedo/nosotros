const QUOTE = 'q'
const EVENT = 'e'
const PUBKEY = 'p'
const MENTION = 'mention'

export const isEventTag = (tag: string[]) => tag[0] === EVENT
export const isQuoteTag = (tag: string[]) => tag[0] === QUOTE
export const isAuthorTag = (tag: string[]) => tag[0] === PUBKEY
export const isMention = (tag: string[]) => tag[3] === MENTION
