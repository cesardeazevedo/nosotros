import { Kind } from '@/constants/kinds'
import type { QueryClient } from '@tanstack/react-query'
import { queryKeys } from './queryKeys'

type Options = {
  pubkey: string
  kind?: number
  dTag?: string
  includeBookmarkOptions?: boolean
}

const isListFeedQuery = (queryKey: readonly unknown[]) => {
  const [scope, name] = queryKey as [unknown, unknown]
  if (scope !== 'feed' || typeof name !== 'string') {
    return false
  }
  return name.startsWith('lists_') || name.startsWith('list_') || name.startsWith('bookmarks_')
}

export async function invalidateNip51Queries(queryClient: QueryClient, options: Options) {
  const { pubkey, kind, dTag, includeBookmarkOptions } = options
  const tasks: Promise<unknown>[] = []

  if (kind !== undefined) {
    if (kind < 30000) {
      tasks.push(queryClient.invalidateQueries({ queryKey: queryKeys.replaceable(kind, pubkey) }))
    } else if (dTag) {
      tasks.push(queryClient.invalidateQueries({ queryKey: queryKeys.addressable(kind, pubkey, dTag) }))
    }
  }

  tasks.push(
    queryClient.invalidateQueries({
      predicate: (query) => isListFeedQuery(query.queryKey),
    }),
  )

  tasks.push(queryClient.invalidateQueries({ queryKey: queryKeys.replaceable(Kind.BookmarkList, pubkey) }))

  if (includeBookmarkOptions) {
    tasks.push(queryClient.invalidateQueries({ queryKey: ['bookmark-options', pubkey] }))
  }

  await Promise.all(tasks)
}

