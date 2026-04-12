import { Kind } from '@/constants/kinds'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { queryClient } from '@/hooks/query/queryClient'
import { queryKeys } from '@/hooks/query/queryKeys'

const shortId = (id: string) => {
  if (id.length <= 10) {
    return id
  }
  return `${id.slice(0, 4)}...${id.slice(-4)}`
}

const shortContent = (content: string | undefined) => {
  const text = (content || '').trim().replace(/\s+/g, ' ')
  return text.slice(0, 10)
}

const getCachedEvent = (id: string, repliesById: Map<string, NostrEventDB>) => {
  const inGroup = repliesById.get(id)
  if (inGroup) {
    return inGroup
  }

  const cached = queryClient.getQueryData<NostrEventDB[] | NostrEventDB>(queryKeys.event(id))
  if (Array.isArray(cached)) {
    return cached[0]
  }
  return cached
}

export const printThreadGroupRendered = (rootId: string) => {
  const container = document.querySelector<HTMLElement>(`[data-threadgroup-root-id="${rootId}"]`)
  if (!container) {
    console.warn(`ThreadGroup root not found: ${rootId}`)
    return []
  }

  const replies = queryClient.getQueryData<NostrEventDB[]>(queryKeys.tag('e', [rootId], Kind.Text)) || []
  const repliesById = new Map(replies.map((reply) => [reply.id, reply]))
  const rows: string[] = []
  const rowNodes = [...container.querySelectorAll<HTMLElement>('[data-thread-row]')]
  const getEventById = (id: string) => {
    return getCachedEvent(id, repliesById)
  }

  for (const rowNode of rowNodes) {
    const row = rowNode.dataset.threadRow
    const role = rowNode.dataset.threadRole
    const mode = rowNode.dataset.threadMode
    const eventId = rowNode.dataset.eventId
    const count = rowNode.dataset.count

    if (row === 'divider') {
      rows.push('~ wave-divider ~')
      continue
    }

    if (row === 'summary') {
      rows.push(
        `${mode === 'parents' ? 'See full thread' : 'See replies'} (${count || 0}) [summary:${mode || 'unknown'}]`,
      )
      continue
    }

    if (!eventId) {
      rows.push(`[${row}] (missing event id)`)
      continue
    }

    const event = getEventById(eventId)
    const label = `${row || 'unknown'}:${role || 'unknown'}`
    if (event) {
      rows.push(`${shortId(event.id)} "${shortContent(event.content)}" [${label}]`)
      continue
    }

    rows.push(`${shortId(eventId)} "(missing in cache)" [${label}]`)
  }

  console.log(`ThreadGroup rendered for ${shortId(rootId)} (${rows.length} rows)`)
  console.log(rows.join('\n'))
  return rows
}

declare global {
  interface Window {
    printThreadGroupRendered?: (rootId: string) => string[]
  }
}

if (typeof window !== 'undefined') {
  window.printThreadGroupRendered = printThreadGroupRendered
}
