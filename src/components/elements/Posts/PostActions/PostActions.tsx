import { useContentContext } from '@/components/providers/ContentProvider'
import { useNoteContext } from '@/components/providers/NoteProvider'
import { Stack } from '@/components/ui/Stack/Stack'
import type { SxProps } from '@/components/ui/types'
import { useMobile } from '@/hooks/useMobile'
import { observer } from 'mobx-react-lite'
import { css } from 'react-strict-dom'
import { PostOptions } from '../PostOptions'
import { ButtonReaction } from './PostButtonReaction'
import { ButtonRelays } from './PostButtonRelay'
import { ButtonReply } from './PostButtonReply'
import { ButtonRepost } from './PostButtonRepost'
import { ButtonZap } from './PostButtonZap'

type Props = {
  onReplyClick?: () => void
  renderRelays?: boolean
  renderOptions?: boolean
  sx?: SxProps
}

export const PostActions = observer(function PostActions(props: Props) {
  const { renderRelays = true, renderOptions = false, sx } = props
  const { dense } = useContentContext()
  const { note } = useNoteContext()
  const mobile = useMobile()

  return (
    <Stack horizontal sx={[styles.root, dense && styles.root$dense, sx]} gap={dense ? 0 : mobile ? 0 : 1}>
      <ButtonReaction />
      <ButtonRepost />
      <ButtonReply
        value={note.repliesTotal}
        selected={note.repliesOpen || note.isReplying || false}
        onClick={props.onReplyClick}
      />
      <ButtonZap />
      {renderRelays && <ButtonRelays />}
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
