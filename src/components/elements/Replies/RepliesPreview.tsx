import { Stack } from '@/components/ui/Stack/Stack'
import { useEventReplies } from '@/hooks/query/useReplies'
import type { NoteState } from '@/hooks/state/useNote'
import { spacing } from '@/themes/spacing.stylex'
import { useRouteContext } from '@tanstack/react-router'
import type { DecodedResult } from 'nostr-tools/nip19'
import { css } from 'react-strict-dom'
import { RepliesLoadMore } from './RepliesLoadMore'
import { RepliesTree } from './RepliesTree'

type Props = {
  note: NoteState
}

function getPubkey(decoded: DecodedResult | undefined) {
  switch (decoded?.type) {
    case 'npub': {
      return decoded.data
    }
    case 'nprofile': {
      return decoded.data.pubkey
    }
    default: {
      return undefined
    }
  }
}

export const RepliesPreview = function RepliesPreview(props: Props) {
  const { note } = props
  const context = useRouteContext({ strict: false })
  const replies = useEventReplies(note.event).previewByUser(getPubkey(context.decoded))

  if (note.state.repliesOpen !== null || replies.length === 0) {
    return null
  }

  return (
    <Stack horizontal={false} justify='flex-start' sx={styles.root}>
      {replies && <RepliesTree nested={false} replies={replies} repliesOpen={note.state.repliesOpen} level={1} />}
      <RepliesLoadMore note={note} disabled={false} />
    </Stack>
  )
}

const styles = css.create({
  root: {
    width: '100%',
    paddingBlock: spacing.padding1,
  },
})
