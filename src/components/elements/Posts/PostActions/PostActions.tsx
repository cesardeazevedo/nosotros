import { Stack } from '@/components/ui/Stack/Stack'
import { Observer } from 'mobx-react-lite'
import { css } from 'react-strict-dom'
import type Note from 'stores/models/note'
import ButtonReaction from './PostButtonReaction'
import ButtonRelays from './PostButtonRelay'
import ButtonReply from './PostButtonReply'
import ButtonRepost from './PostButtonRepost'
import ButtonZap from './PostButtonZap'
import { useMobile } from '@/hooks/useMobile'

type Props = {
  note: Note
  dense?: boolean
  onReplyClick?: () => void
  renderRelays?: boolean
  renderRepost?: boolean
  renderReply?: boolean
  renderZap?: boolean
}

function PostActions(props: Props) {
  const { note, renderRepost = true, renderReply = true, renderZap = true, renderRelays = true, dense = false } = props
  const mobile = useMobile()

  return (
    <Stack horizontal sx={[styles.root, dense && styles.root$dense]} gap={dense ? 0 : mobile ? 0 : 1}>
      <ButtonReaction note={note} dense={dense} />
      {renderRepost && <ButtonRepost dense={dense} />}
      <Observer>
        {() => (
          <>{renderReply && <ButtonReply dense={dense} value={note.totalReplies} onClick={props.onReplyClick} />}</>
        )}
      </Observer>
      {renderZap && <ButtonZap dense={dense} note={note} />}
      {renderRelays && <ButtonRelays dense={dense} note={note} />}
    </Stack>
  )
}

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

export default PostActions
