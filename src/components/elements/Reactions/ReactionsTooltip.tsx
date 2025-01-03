import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { reactionStore } from '@/stores/reactions/reactions.store'
import { observer, Observer } from 'mobx-react-lite'
import React from 'react'
import { UserAvatar } from '../User/UserAvatar'

type Props = {
  noteId: string
  children: React.ReactElement
}

const maxUsers = 5

export const ReactionsTooltip = observer(function ReactionsTooltip(props: Props) {
  const { children } = props
  const list = reactionStore.sorted(props.noteId)
  return (
    <Tooltip
      cursor='dot'
      placement='bottom-start'
      text={
        <>
          <Text variant='label'>Reactions</Text>
          <Observer>
            {() => (
              <>
                {list
                  .filter(([emoji]) => !emoji.includes(':'))
                  .map(([emoji, pubkeys]) => (
                    <Stack key={emoji} gap={1}>
                      <Text variant='title' size='sm'>
                        {emoji}
                      </Text>
                      <Stack>
                        {pubkeys.slice(0, maxUsers).map((pubkey) => (
                          <UserAvatar size='xs' key={pubkey} pubkey={pubkey} />
                        ))}
                      </Stack>
                      {pubkeys.length > maxUsers && (
                        <Text variant='title' size='sm'>
                          +{pubkeys.length - maxUsers}
                        </Text>
                      )}
                    </Stack>
                  ))}
              </>
            )}
          </Observer>
        </>
      }>
      {children}
    </Tooltip>
  )
})
