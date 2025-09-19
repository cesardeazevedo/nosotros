import { useNoteContext } from '@/components/providers/NoteProvider'
import { Paper } from '@/components/ui/Paper/Paper'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { TooltipRich } from '@/components/ui/TooltipRich/TooltipRich'
import { useReactionsGrouped } from '@/hooks/query/useReactions'
import { spacing } from '@/themes/spacing.stylex'
import { fallbackEmoji } from '@/utils/utils'
import React, { memo } from 'react'
import { css } from 'react-strict-dom'
import { UserAvatar } from '../User/UserAvatar'

type Props = {
  children: React.ReactElement
}

const ReactionsList = memo(function ReactionsList() {
  const { event } = useNoteContext()
  const grouped = useReactionsGrouped(event)
  return (
    <Stack horizontal={false}>
      {grouped.data &&
        grouped.data
          .filter(([emoji]) => !emoji.includes(':'))
          .map(([emoji, pubkeys]) => (
            <Stack key={emoji} gap={1} align='flex-start'>
              <Text variant='title' size='md'>
                {fallbackEmoji(emoji)}
              </Text>
              <Stack wrap>
                {pubkeys.map((pubkey) => (
                  <UserAvatar size='xs' key={pubkey} pubkey={pubkey} />
                ))}
              </Stack>
            </Stack>
          ))}
    </Stack>
  )
})

export const ReactionsTooltip = memo(function ReactionsTooltip(props: Props) {
  const { children } = props
  return (
    <TooltipRich
      cursor='dot'
      placement='bottom-start'
      content={() => (
        <Paper surface='surfaceContainer' shape='md' sx={styles.root} elevation={2}>
          <ReactionsList />
        </Paper>
      )}>
      {children}
    </TooltipRich>
  )
})

const styles = css.create({
  root: {
    maxWidth: 355,
    padding: spacing.padding1,
  },
})
