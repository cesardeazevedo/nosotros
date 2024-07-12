import { Typography } from '@mui/material'
import { Observer } from 'mobx-react-lite'
import React from 'react'
import { reactionStore } from 'stores/nostr/reactions.store'
import { Row } from '../Layouts/Flex'
import Tooltip from '../Layouts/Tooltip'

type Props = {
  noteId: string
  children: React.ReactElement
}

function ReactionsTooltip(props: Props) {
  const { children } = props
  const list = reactionStore.getTopReactions(props.noteId)
  return (
    <Tooltip
      arrow
      title={
        <>
          <Typography variant='subtitle2'>Reactions</Typography>
          <Observer>
            {() => (
              <>
                {list
                  .filter(([emoji]) => !emoji.includes(':'))
                  .map(([emoji, pubkeys]) => (
                    <Row
                      key={emoji}
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'flex-start',
                        fontSize: '1.2rem',
                        '>span': { flex: 1 },
                      }}>
                      <span>{emoji}</span>
                      <span>{pubkeys.length}</span>
                    </Row>
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
