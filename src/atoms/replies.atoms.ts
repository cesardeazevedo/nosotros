import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'

export const childrenAtomFamily = atomFamily(() => atom<ReadonlySet<string>>(new Set<string>([])))

export const replyCountAtomFamily = atomFamily((id: string) =>
  atom((get): number => {
    const childrenIds = [...get(childrenAtomFamily(id))]
    return childrenIds.reduce((sum, childId) => sum + 1 + get(replyCountAtomFamily(childId)), 0)
  }),
)

export const addReplyAtom = atom(null, (get, set, note: NostrEventDB) => {
  const parentId = note.metadata?.parentId
  if (!parentId) {
    return
  } else {
    const prev = get(childrenAtomFamily(parentId))
    if (prev.has(note.id)) {
      return
    } else {
      const next = new Set(prev)
      next.add(note.id)
      set(childrenAtomFamily(parentId), next)
    }
  }
})

export const repliesLeftAtomFamily = atomFamily(
  ({ id, limit }: { id: string; limit: number }) =>
    atom((get) => {
      const children = [...get(childrenAtomFamily(id))]
      return children.slice(limit).reduce((sum, childId) => sum + 1 + get(replyCountAtomFamily(childId)), 0)
    }),
  (a, b) => a.id === b.id && a.limit === b.limit,
)
