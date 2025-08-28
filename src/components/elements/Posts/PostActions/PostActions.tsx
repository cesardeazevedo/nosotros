import { useContentContext } from '@/components/providers/ContentProvider'
import { Stack } from '@/components/ui/Stack/Stack'
import type { SxProps } from '@/components/ui/types'
import type { NoteState } from '@/hooks/state/useNote'
import { useMobile } from '@/hooks/useMobile'
import { memo } from 'react'
import { css } from 'react-strict-dom'
import { PostOptions } from '../PostOptions'
import { ButtonReaction } from './PostButtonReaction'
import { ButtonRelays } from './PostButtonRelay'
import { ButtonReply } from './PostButtonReply'
import { ButtonRepost } from './PostButtonRepost'
import { ButtonZap } from './PostButtonZap'

type Props = {
  note: NoteState
  onReplyClick?: () => void
  renderRelays?: boolean
  renderReply?: boolean
  renderOptions?: boolean
  sx?: SxProps
}

export const PostActions = memo(function PostActions(props: Props) {
  const { note, renderReply = true, renderRelays = true, renderOptions = false, sx } = props
  const { dense } = useContentContext()
  const mobile = useMobile()

  return (
    <Stack horizontal sx={[styles.root, dense && styles.root$dense, sx]} gap={dense ? 0 : mobile ? 0 : 1}>
      <ButtonReaction note={note} />
      <ButtonRepost note={note} />
      {renderReply && (
        <ButtonReply
          value={note.repliesTotal}
          selected={(note.state.repliesOpen && note.metadata?.isRoot) || note.state.isReplying || false}
          onClick={props.onReplyClick}
        />
      )}
      <ButtonZap note={note} />
      {renderRelays && <ButtonRelays note={note} />}
      {renderOptions && <PostOptions />}
    </Stack>
  )
})

const styles = css.create({
  root: {
    padding: 16,
    justifyContent: 'space-between',
  },
  root$dense: {
    padding: 0,
    justifyContent: 'flex-start',
  },
})
