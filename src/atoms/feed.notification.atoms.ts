import type { NotificationFeedModule } from '@/hooks/modules/createNotificationFeedModule'
import { atom } from 'jotai'
import { focusAtom } from 'jotai-optics'
import { createFeedAtoms } from './feed.atoms'
import { selectedLastSeenAtom } from './lastSeen.atoms'
import { settingsAtom } from './settings.atoms'

export function createNotificationFeedAtoms(options: NotificationFeedModule) {
  const feedAtoms = createFeedAtoms(options)
  const includeMentions = focusAtom(feedAtoms.atom, (optic) => optic.prop('includeMentions'))
  const compact = atom(
    (get) => get(settingsAtom).notificationsCompact,
    (get, set, compact: boolean) => {
      const settings = get(settingsAtom)
      set(settingsAtom, {
        ...settings,
        notificationsCompact: compact,
      })
    },
  )
  const data = atom((get) => {
    const queryResult = get(feedAtoms.query)
    const queryData = queryResult.data
    if (!queryData?.pages) {
      return {
        pages: [],
        pageParams: [],
      }
    }

    const includeMentionsEnabled = get(includeMentions)

    const pages = queryData.pages.map((page) =>
      page.filter((event) => {
        if (includeMentionsEnabled) return true
        return !event.metadata?.isRoot
      }),
    )

    return {
      pages,
      pageParams: queryData.pageParams,
    }
  })
  const unseenCount = atom((get) => {
    const queryData = get(feedAtoms.query).data
    const lastSeen = get(selectedLastSeenAtom)?.notifications || Infinity
    return queryData?.pages.flat().filter((event) => event.created_at >= lastSeen).length || 0
  })
  return {
    ...feedAtoms,
    compact,
    includeMentions,
    data,
    unseenCount,
  }
}
