import type { NostrEventDB } from '@/db/sqlite/sqlite.types'

export type PublishedEmbedding = {
  modelId: string
  vector: number[]
  createdAt: number
}

export function selectLatestPublishedEmbedding(events: NostrEventDB[] | undefined) {
  return events
    ?.map(parsePublishedEmbedding)
    .filter((embedding): embedding is PublishedEmbedding => !!embedding)
    .sort((a, b) => b.createdAt - a.createdAt)[0]
}

function parsePublishedEmbedding(event: NostrEventDB): PublishedEmbedding | undefined {
  const modelId = event.tags.find((tag) => tag[0] === 'model_id')?.[1]
  const vectorTag = event.tags.find((tag) => tag[0] === 'vector')?.[1]
  if (!modelId || !vectorTag) {
    return
  }

  try {
    const vector = JSON.parse(vectorTag)
    if (!Array.isArray(vector) || !vector.every((value) => typeof value === 'number' && Number.isFinite(value))) {
      return
    }

    return {
      modelId,
      vector,
      createdAt: event.created_at,
    }
  } catch {
    return
  }
}
