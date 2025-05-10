import { useNoteContext } from '@/components/providers/NoteProvider'
import { Paper } from '@/components/ui/Paper/Paper'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { TooltipRich } from '@/components/ui/TooltipRich/TooltipRich'
import { subscribeUsers } from '@/nostr/subscriptions/subscribeUser'
import type { Note } from '@/stores/notes/note'
import { spacing } from '@/themes/spacing.stylex'
import { fallbackEmoji } from '@/utils/utils'
import { observer } from 'mobx-react-lite'
import { useObservable, useSubscription } from 'observable-hooks'
import React from 'react'
import { css } from 'react-strict-dom'
import { UserAvatar } from '../User/UserAvatar'

type Props = {
  noteId: string
  children: React.ReactElement
}

const ReactionsList = observer(function ReactionsList(props: { note: Note }) {
  const { note } = props
  const pubkeys = note.reactions.map((x) => x.pubkey)
  const sub = useObservable(() => subscribeUsers(pubkeys, {}))
  useSubscription(sub)
  return (
    <Stack horizontal={false}>
      {note.reactionsGrouped
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

export const ReactionsTooltip = observer(function ReactionsTooltip(props: Props) {
  const { children } = props
  const { note } = useNoteContext()
  return (
    <TooltipRich
      cursor='dot'
      placement='bottom-start'
      content={() => (
        <Paper surface='surfaceContainer' shape='md' sx={styles.root} elevation={2}>
          <ReactionsList note={note} />
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
