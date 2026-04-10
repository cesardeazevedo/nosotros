import { Paper } from '@/components/ui/Paper/Paper'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import type { SxProps } from '@/components/ui/types'
import { Kind } from '@/constants/kinds'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { spacing } from '@/themes/spacing.stylex'
import { IconAlertCircleFilled } from '@tabler/icons-react'
import { css } from 'react-strict-dom'
import { PostUserHeader } from '../Posts/PostUserHeader'

type Props = {
  event?: NostrEventDB
  sx?: SxProps
}

export const NostrEventUnsupportedContent = (props: Props) => {
  const { event, sx } = props
  const alt = event?.tags.filter((x) => x[0] === 'alt')?.[1] || ''
  return (
    <Stack sx={[styles.root, sx]}>
      <Stack grow horizontal={false}>
        <Paper sx={styles.paper} outlined>
          {event && <PostUserHeader userAvatarProps={{ size: 'sm' }} event={event} />}
          <Stack gap={1} align='center' justify='center' sx={styles.content}>
            <IconAlertCircleFilled size={28} strokeWidth='1.0' />
            <Text size='lg'>
              Can't display {(event && Kind[event?.kind]?.toString()) || ''} event (kind:{event?.kind})
            </Text>
            {alt && (
              <Text size='lg' sx={styles.alt}>
                Description: {alt}
              </Text>
            )}
          </Stack>
        </Paper>
      </Stack>
    </Stack>
  )
}

const styles = css.create({
  root: {},
  paper: {
    paddingBlock: spacing.padding1,
    paddingInline: spacing.padding1,
  },
  content: {
    paddingBlock: spacing.padding2,
  },
  alt: {
    wordBreak: 'break-word',
  },
})
