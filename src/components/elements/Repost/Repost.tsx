import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { useRepostedEvent } from '@/hooks/query/useQueryBase'
import { memo } from 'react'
import { PostRoot } from '../Posts/Post'
import { RepostHeader } from './RepostHeader'

type Props = {
  event: NostrEventDB
}

export const RepostRoot = memo(function RepostRoot(props: Props) {
  const { event } = props
  const { data } = useRepostedEvent(event)
  return data && <PostRoot event={data} header={<RepostHeader event={event} />} />
})
