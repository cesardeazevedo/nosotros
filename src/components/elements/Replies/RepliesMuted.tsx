import { useNoteContext } from '@/components/providers/NoteProvider'
import { Button } from '@/components/ui/Button/Button'
import { Stack } from '@/components/ui/Stack/Stack'
import { spacing } from '@/themes/spacing.stylex'
import { colors } from '@stylexjs/open-props/lib/colors.stylex'
import { IconVolumeOff } from '@tabler/icons-react'
import { useState } from 'react'
import { css } from 'react-strict-dom'

type Props = {
  level: number
}

export const RepliesMuted = function RepliesMuted(props: Props) {
  const { level } = props
  const { note } = useNoteContext()
  const [openMuted, setOpenMuted] = useState(false)
  const replies = note.repliesMuted
  return (
    <>
      {replies?.length !== 0 && !openMuted && (
        <Button sx={styles.expandButtonMuted} variant='filledTonal' onClick={() => setOpenMuted(true)}>
          <Stack gap={1}>
            <IconVolumeOff color={colors.red5} size={16} strokeWidth='1.5' />
            See muted replies
          </Stack>
        </Button>
      )}
      {/* {openMuted && ( */}
      {/*   <RepliesTree */}
      {/*     replies={replies} */}
      {/*     repliesOpen //={repliesOpen} */}
      {/*     level={level + 1} */}
      {/*     nested={false} */}
      {/*   /> */}
      {/* )} */}
    </>
  )
}

const styles = css.create({
  expandButtonMuted: {
    marginLeft: spacing.margin6,
    marginBottom: spacing.margin2,
  },
})
