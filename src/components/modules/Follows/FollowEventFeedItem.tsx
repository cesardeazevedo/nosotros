import { Paper } from '@/components/ui/Paper/Paper'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { useCurrentPubkey } from '@/hooks/useAuth'
import { spacing } from '@/themes/spacing.stylex'
import { useMemo } from 'react'
import { css } from 'react-strict-dom'
import { FollowBulkButton } from './FollowBulkButton'

type Props = {
  event: NostrEventDB
}

export const FollowEventFeedItem = (props: Props) => {
  const { event } = props
  const { tags } = event
  const pubkey = useCurrentPubkey()
  const values = useMemo(() => tags.map(([, pubkey]) => pubkey), [tags])
  const isOwnFollowList = event.pubkey === pubkey
  return (
    <Paper outlined sx={styles.root}>
      <Stack sx={styles.header} justify='space-between'>
        <Text variant='headline' size='sm'>
          Follow List
        </Text>
        {!isOwnFollowList && <FollowBulkButton values={values} />}
      </Stack>
    </Paper>
  )
}

const styles = css.create({
  root: {
    marginTop: spacing.margin2,
  },
  header: {
    paddingInline: spacing.padding3,
    paddingBlock: spacing.padding2,
    flexWrap: 'wrap',
    rowGap: spacing.padding1,
  },
})
