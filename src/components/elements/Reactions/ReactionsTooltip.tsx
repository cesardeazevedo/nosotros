import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { Observer } from 'mobx-react-lite'
import React from 'react'
import { reactionStore } from 'stores/nostr/reactions.store'

type Props = {
  noteId: string
  children: React.ReactElement
}

function ReactionsTooltip(props: Props) {
  const { children } = props
  const list = reactionStore.getTopReactions(props.noteId)
  return (
    <Tooltip
      cursor='arrow'
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
                      <Text variant='title' size='md'>
                        {emoji}
                      </Text>
                      <Text variant='title' size='md'>
                        {pubkeys.length}
                      </Text>
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
}

export default ReactionsTooltip
