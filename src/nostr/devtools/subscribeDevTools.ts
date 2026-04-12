import {
  addSubscriptionChildAtom,
  addSubscriptionChildEventAtom,
  devtoolsSubscriptionGroupsAtom,
  setSubscriptionChildNegErrorAtom,
  updateSubscriptionChildStateAtom,
} from '@/atoms/devtools.atoms'
import { store } from '@/atoms/store'
import type { Relay } from 'core/Relay'
import { RelayToClient } from 'core/types'
import { tap } from 'rxjs'

const getChildRef = (relayUrl: string, subscriptionId: string) => {
  const groups = store.get(devtoolsSubscriptionGroupsAtom)
  for (const group of groups) {
    const child = group.children.find((entry) => entry.relay === relayUrl && entry.subscriptionId === subscriptionId)
    if (child) {
      return { groupId: group.id, childId: child.id }
    }
  }
}

const findGroupForSubscription = (relayUrl: string, subscriptionId: string) => {
  const groups = store.get(devtoolsSubscriptionGroupsAtom)
  const matches = groups.filter((group) => {
    const subId = group.ctx.subId
    if (!subId || group.state === 'closed') return false
    return subscriptionId === subId || subscriptionId.startsWith(`${subId}_`)
  })
  if (!matches.length) return undefined
  const group = [...matches].sort((a, b) => b.createdAt - a.createdAt)[0]
  const exists = group.children.some((child) => child.relay === relayUrl && child.subscriptionId === subscriptionId)
  if (exists) return group
  const childId = `${relayUrl}:${subscriptionId}`
  store.set(addSubscriptionChildAtom, {
    groupId: group.id,
    childId,
    relay: relayUrl,
    subscriptionId,
    filter: {},
  })
  return group
}

export function subscribeDevTools(relay: Relay) {
  return relay.message$
    .pipe(
      tap((msg) => {
        const verb = msg[0]?.toUpperCase()
        const subscriptionId = typeof msg[1] === 'string' ? msg[1] : ''
        if (!subscriptionId) {
          return
        }
        findGroupForSubscription(relay.url, subscriptionId)
        const ref = getChildRef(relay.url, subscriptionId)
        if (!ref) {
          return
        }

        if (verb === RelayToClient.EVENT) {
          const rawEvent = msg[2]
          const kind = typeof rawEvent === 'object' && rawEvent && 'kind' in rawEvent ? rawEvent.kind : -1
          store.set(addSubscriptionChildEventAtom, {
            groupId: ref.groupId,
            childId: ref.childId,
            kind: typeof kind === 'number' ? kind : -1,
          })
          return
        }

        if (verb === RelayToClient.EOSE || verb === RelayToClient.CLOSED || verb === RelayToClient.NEG_CLOSE) {
          store.set(updateSubscriptionChildStateAtom, {
            groupId: ref.groupId,
            childId: ref.childId,
            state: 'closed',
          })
          return
        }

        if (verb === RelayToClient.NEG_ERR) {
          const message = typeof msg[2] === 'string' ? msg[2] : 'Negentropy Error'
          store.set(setSubscriptionChildNegErrorAtom, {
            groupId: ref.groupId,
            childId: ref.childId,
            negErrorMessage: message,
          })
        }
      }),
    )
    .subscribe()
}
