import { Kind } from '@/constants/kinds'
import type { NostrContext } from '../context'
import { subscribe } from './subscribe'

export function subscribeBlossomServers(pubkey: string, ctx: NostrContext) {
  return subscribe({ kinds: [Kind.BlossomServerList], authors: [pubkey] }, ctx)
}
