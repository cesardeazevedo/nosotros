import { useNoteContext } from '@/components/providers/NoteProvider'
import { Button } from '@/components/ui/Button/Button'
import { Stack } from '@/components/ui/Stack/Stack'
import { useCurrentUser } from '@/hooks/useRootStore'
import { spacing } from '@/themes/spacing.stylex'
import { colors } from '@stylexjs/open-props/lib/colors.stylex'
import { IconVolumeOff } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import { css } from 'react-strict-dom'
import { RepliesTree } from './RepliesTree'

type Props = {
  level: number
}

export const RepliesMuted = observer(function RepliesMuted(props: Props) {
  const { level } = props
  const { note } = useNoteContext()
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
        <RepliesTree
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
