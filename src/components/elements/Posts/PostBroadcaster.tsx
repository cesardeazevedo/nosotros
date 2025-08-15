import { useNoteContext } from '@/components/providers/NoteProvider'
import { Divider } from '@/components/ui/Divider/Divider'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { spacing } from '@/themes/spacing.stylex'
import { memo } from 'react'
import { css } from 'react-strict-dom'
import { RelayChip } from '../Relays/RelayChip'

export const PostBroadcaster = memo(function PostBroadcaster() {
  const { note } = useNoteContext()

  return (
    <Stack horizontal={false}>
      <Divider />
      <Stack horizontal={false}>
        <Stack justify='flex-start' align='flex-start' sx={styles.panel} wrap={false} gap={2}>
          <Text sx={styles.subheader} variant='title' size='md'>
            Seen on relays
          </Text>
          <Stack horizontal wrap gap={0.5}>
            {note.seenOn?.map((url) => <RelayChip selected key={url} url={url} />)}
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  )
})

const styles = css.create({
  header: {
    paddingBlock: spacing.padding1,
    paddingInline: spacing.padding2,
  },
  panel: {
    paddingInline: spacing.padding2,
    paddingBlock: spacing.padding2,
  },
  subheader: {
    flex: 1,
    whiteSpace: 'nowrap',
  },
})
