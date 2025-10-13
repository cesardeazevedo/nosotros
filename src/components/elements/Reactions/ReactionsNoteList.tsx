import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { useReactionsGrouped } from '@/hooks/query/useReactions'
import { spacing } from '@/themes/spacing.stylex'
import { fallbackEmoji } from '@/utils/utils'
import { memo } from 'react'
import { css } from 'react-strict-dom'
import { UserAvatar } from '../User/UserAvatar'

type Props = {
  event: NostrEventDB
}

export const ReactionsNoteList = memo(function ReactionsNoteList(props: Props) {
  const { event } = props
  const grouped = useReactionsGrouped(event)
  if (!grouped.data || grouped.data.length === 0) {
    return
  }
  return (
    <Stack horizontal={false} sx={styles.root}>
      {grouped.data &&
        grouped.data
          .filter(([emoji]) => !emoji.includes(':'))
          .map(([emoji, pubkeys]) => (
            <Stack key={emoji} gap={2} align='flex-start'>
              <Text variant='title' size='md' sx={styles.emoji}>
                {fallbackEmoji(emoji)}
              </Text>
              <Stack wrap>
                {pubkeys.map((pubkey, index) => (
                  <UserAvatar size='xs' key={pubkey + index} pubkey={pubkey} />
                ))}
              </Stack>
            </Stack>
          ))}
    </Stack>
  )
})

const styles = css.create({
  root: {
    paddingTop: spacing.padding1,
    paddingInline: spacing.padding2,
  },
  emoji: {
    fontSize: 20,
  },
})
