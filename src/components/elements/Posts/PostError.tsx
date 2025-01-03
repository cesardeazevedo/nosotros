import { Paper } from '@/components/ui/Paper/Paper'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import type { Note } from '@/stores/notes/note'
import { spacing } from '@/themes/spacing.stylex'
import { IconAlertCircle } from '@tabler/icons-react'
import { css } from 'react-strict-dom'

type Props = {
  note: Note
}

export const PostError = (props: Props) => {
  const { note } = props
  return (
    <Stack sx={styles.root}>
      <Paper sx={styles.paper} surface='surfaceContainer'>
        <Stack horizontal={false} gap={1} align='center' justify='center'>
          <IconAlertCircle size={34} strokeWidth='1.6' />
          <Text size='lg'>Can't display content of kind {note.event.kind}</Text>
          {note.alt && (
            <Text size='lg' sx={styles.alt}>
              Description: {note.alt}
            </Text>
          )}
        </Stack>
      </Paper>
    </Stack>
  )
}

const styles = css.create({
  root: {
    padding: spacing.padding2,
  },
  paper: {
    paddingBlock: spacing.padding2,
    paddingInline: spacing.padding4,
    textAlign: 'center',
  },
  alt: {
    wordBreak: 'break-word',
  },
})
