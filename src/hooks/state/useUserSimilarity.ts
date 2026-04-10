import { userEmbeddingsQueryFamily } from '@/atoms/users.atoms'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { useAtomValue } from 'jotai'
import { useCurrentPubkey } from '../useAuth'

type UserEmbedding = {
  event?: NostrEventDB
  modelId: string
  vector: number[]
}

const parseEmbeddingVector = (event: NostrEventDB): UserEmbedding | undefined => {
  const modelId = event.tags.find((tag) => tag[0] === 'model_id')?.[1]
  const vectorTag = event.tags.find((tag) => tag[0] === 'vector')?.[1]
  if (!modelId || !vectorTag) {
    return
  }

  try {
    const vector = JSON.parse(vectorTag)
    if (!Array.isArray(vector) || !vector.every((value) => typeof value === 'number')) {
      return
    }
    return { event, modelId, vector }
  } catch {
    return
  }
}

const selectLatestEmbedding = (events: NostrEventDB[] | undefined) => {
  return events
    ?.map(parseEmbeddingVector)
    .filter((embedding): embedding is UserEmbedding => !!embedding)
    .sort((a, b) => (b.event?.created_at || 0) - (a.event?.created_at || 0))[0]
}

const dotProduct = (a: number[], b: number[]) => {
  let sum = 0
  for (let i = 0; i < a.length; i++) {
    sum += a[i] * b[i]
  }
  return sum
}

const vectorNorm = (vector: number[]) => {
  return Math.sqrt(dotProduct(vector, vector))
}

const cosineSimilarity = (a: number[], b: number[]) => {
  const denominator = vectorNorm(a) * vectorNorm(b)
  return denominator === 0 ? undefined : dotProduct(a, b) / denominator
}

export function useUserSimilarity(pubkey: string | undefined) {
  const currentPubkey = useCurrentPubkey()
  const currentUserEmbeddings = useAtomValue(userEmbeddingsQueryFamily(currentPubkey))
  const targetUserEmbeddings = useAtomValue(userEmbeddingsQueryFamily(pubkey))
  const currentEmbedding = selectLatestEmbedding(currentUserEmbeddings.data)
  const targetEmbedding = selectLatestEmbedding(targetUserEmbeddings.data)
  const canCompare =
    currentEmbedding &&
    targetEmbedding &&
    currentEmbedding.modelId === targetEmbedding.modelId &&
    currentEmbedding.vector.length === targetEmbedding.vector.length

  return {
    score: canCompare ? cosineSimilarity(currentEmbedding.vector, targetEmbedding.vector) : undefined,
    modelId: canCompare ? currentEmbedding.modelId : undefined,
    currentEmbedding,
    targetEmbedding,
    isLoading: currentUserEmbeddings.isLoading || targetUserEmbeddings.isLoading,
    isError: currentUserEmbeddings.isError || targetUserEmbeddings.isError,
  }
}
