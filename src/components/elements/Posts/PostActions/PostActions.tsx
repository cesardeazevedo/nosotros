import { useNoteContext } from '@/components/providers/NoteProvider'
import { Stack } from '@/components/ui/Stack/Stack'
import type { SxProps } from '@/components/ui/types'
import { useMobile } from '@/hooks/useMobile'
import type { Comment } from '@/stores/comment/comment'
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
  note: Note | Comment
  onReplyClick?: () => void
  renderOptions?: boolean
  sx?: SxProps
}

export const PostActions = observer(function PostActions(props: Props) {
  const { note, renderOptions = false, sx } = props
  const { dense } = useNoteContext()
  const mobile = useMobile()

  return (
    <Stack horizontal sx={[styles.root, dense && styles.root$dense, sx]} gap={dense ? 0 : mobile ? 0 : 1}>
      <ButtonReaction note={note} />
      <ButtonRepost note={note} />
      <ButtonReply
        value={note.repliesTotal}
        selected={note.repliesOpen || note.isReplying || false}
        onClick={props.onReplyClick}
      />
      <ButtonZap note={note} />
      <ButtonRelays note={note} />
      {renderOptions && <PostOptions note={note} />}
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
