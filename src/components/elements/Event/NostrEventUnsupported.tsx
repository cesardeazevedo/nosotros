import { Paper } from '@/components/ui/Paper/Paper'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { spacing } from '@/themes/spacing.stylex'
import { IconAlertCircleFilled } from '@tabler/icons-react'
import type { NostrEvent } from 'nostr-tools'
import { css } from 'react-strict-dom'

type Props = {
  event?: NostrEvent
}

export const NostrEventUnsupported = (props: Props) => {
  const { event } = props
  const alt = event?.tags.filter((x) => x[0] === 'alt')?.[1] || ''
  return (
    <Stack sx={styles.root}>
      <Paper sx={styles.paper} surface='surfaceContainer'>
        <Stack horizontal={false} gap={1} align='center' justify='center'>
          <IconAlertCircleFilled size={28} strokeWidth='1.0' />
          <Text size='lg'>Can't display event (kind:{event?.kind})</Text>
          {alt && (
            <Text size='lg' sx={styles.alt}>
              Description: {alt}
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
    textAlign: 'center',
    paddingBlock: spacing.padding2,
    paddingInline: spacing.padding4,
  },
  alt: {
    wordBreak: 'break-word',
  },
})
