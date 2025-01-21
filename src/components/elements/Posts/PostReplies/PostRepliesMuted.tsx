import { Button } from '@/components/ui/Button/Button'
import { Stack } from '@/components/ui/Stack/Stack'
import { useCurrentUser } from '@/hooks/useRootStore'
import type { Comment } from '@/stores/comment/comment'
import type { Note } from '@/stores/notes/note'
import { spacing } from '@/themes/spacing.stylex'
import { colors } from '@stylexjs/open-props/lib/colors.stylex'
import { IconVolumeOff } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import { css } from 'react-strict-dom'
import { PostRepliesTree } from './PostReply'

type Props = {
  level: number
  note: Note | Comment
}

export const PostRepliesMuted = observer(function PostRepliesMuted(props: Props) {
  const { note, level } = props
  const user = useCurrentUser()
  const [openMuted, setOpenMuted] = useState(false)
  const replies = note.repliesMuted(user)
  return (
    <>
      {replies.length > 0 && !openMuted && (
        <Button sx={styles.expandButtonMuted} variant='filledTonal' onClick={() => setOpenMuted(true)}>
          <Stack gap={1}>
            <IconVolumeOff color={colors.red5} size={16} strokeWidth='1.5' />
            See muted replies
          </Stack>
        </Button>
      )}
      {openMuted && (
        <PostRepliesTree
          replies={replies}
          repliesOpen //={repliesOpen}
          level={level + 1}
          nested={false}
        />
      )}
    </>
  )
})

const styles = css.create({
  expandButtonMuted: {
    marginLeft: spacing.margin6,
    marginBottom: spacing.margin2,
  },
})
