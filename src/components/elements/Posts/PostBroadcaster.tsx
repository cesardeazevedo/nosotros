import { Divider } from '@/components/ui/Divider/Divider'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import type { Note } from '@/stores/notes/note'
import { spacing } from '@/themes/spacing.stylex'
import { IconCheck } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import { css } from 'react-strict-dom'
import { RelayChip } from '../Relays/RelayChip'
import { RelaySelectPopover } from '../Relays/RelaySelectPopover'

type Props = {
  note: Note
}

export const PostBroadcaster = observer(function PostBroadcaster(props: Props) {
  const { note } = props
  const seens = note.seenOn

  return (
    <Stack horizontal={false}>
      <Divider />
      <Stack horizontal={false}>
        <Stack justify='flex-start' align='flex-start' sx={styles.panel} wrap={false} gap={2}>
          <Text sx={styles.subheader} variant='title' size='md'>
            Seen on relays
          </Text>
          <Stack horizontal wrap gap={0.5}>
            {seens?.map((url) => <RelayChip key={url} url={url} icon={<IconCheck size={18} />} />)}
            <RelaySelectPopover onSubmit={() => {}} />
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
