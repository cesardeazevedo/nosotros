import { Kind } from '@/constants/kinds'
import { WRITE } from '../types'
import { subscribe } from './subscribe'

export function subscribeBlossomServers(pubkey: string) {
  return subscribe({ kinds: [Kind.BlossomServerList], authors: [pubkey] }, { pubkey, permission: WRITE })
}
