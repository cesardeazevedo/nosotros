import { Stack } from '@/components/ui/Stack/Stack'
import type { SxProps } from '@/components/ui/types'
import { useMobile } from '@/hooks/useMobile'
import type { Note } from '@/stores/notes/note'
import { observer } from 'mobx-react-lite'
import { css } from 'react-strict-dom'
import { PostOptions } from '../PostOptions'
import { ButtonReaction } from './PostButtonReaction'
import { ButtonRelays } from './PostButtonRelay'
import { ButtonReply } from './PostButtonReply'
import { ButtonRepost } from './PostButtonRepost'
import { ButtonZap } from './PostButtonZap'

type Props = {
  note: Note
  dense?: boolean
  onReplyClick?: () => void
  renderRelays?: boolean
  renderRepost?: boolean
  renderReply?: boolean
  renderZap?: boolean
  renderOptions?: boolean
  sx?: SxProps
}

export const PostActions = observer(function PostActions(props: Props) {
  const {
    note,
    renderRepost = true,
    renderReply = true,
    renderZap = true,
    renderRelays = true,
    renderOptions = false,
    dense = false,
    sx,
  } = props
  const mobile = useMobile()

  return (
    <Stack horizontal sx={[styles.root, dense && styles.root$dense, sx]} gap={dense ? 0 : mobile ? 0 : 1}>
      <ButtonReaction note={note} dense={dense} />
      {renderRepost && <ButtonRepost dense={dense} note={note} />}
      {renderReply && (
        <ButtonReply
          dense={dense}
          value={note.repliesTotal}
          selected={note.repliesOpen || note.isReplying || false}
          onClick={props.onReplyClick}
        />
      )}
      {renderZap && <ButtonZap dense={dense} note={note} />}
      {renderRelays && <ButtonRelays dense={dense} note={note} />}
      {renderOptions && <PostOptions dense={dense} note={note} />}
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
