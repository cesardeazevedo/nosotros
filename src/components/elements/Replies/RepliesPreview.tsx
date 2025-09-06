import { Stack } from '@/components/ui/Stack/Stack'
import type { NoteState } from '@/hooks/state/useNote'
import { spacing } from '@/themes/spacing.stylex'
import { useRouteContext } from '@tanstack/react-router'
import type { DecodeResult } from 'nostr-tools/nip19'
import { css, html } from 'react-strict-dom'
import { RepliesLoadMore } from './RepliesLoadMore'
import { RepliesTree } from './RepliesTree'

type Props = {
  note: NoteState
}

function getPubkey(decoded: DecodeResult | undefined) {
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

  const replies = note.getRepliesPreviewUser(getPubkey(context.decoded))

  if (note.state.repliesOpen !== null || replies.length === 0) {
    return null
  }

  return (
    <Stack horizontal={false} sx={styles.root} justify='flex-start'>
      <html.div style={styles.repliesWrapper}>
        {replies && <RepliesTree nested={false} replies={replies} repliesOpen={note.state.repliesOpen} level={1} />}
        <RepliesLoadMore note={note} disabled={false} />
      </html.div>
    </Stack>
  )
}

const styles = css.create({
  root: {},
  repliesWrapper: {
    width: '100%',
    paddingBlock: spacing.padding1,
  },
})
