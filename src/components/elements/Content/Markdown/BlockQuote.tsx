import { styled } from '@mui/material'
import type { BlockQuoteNode } from 'content/types'
import React from 'react'
import Paragraph from '../Layout/Paragraph'

type Props = {
  node: BlockQuoteNode
}

const Container = styled('div')(({ theme }) =>
  theme.unstable_sx({
    ml: 2,
    my: 4,
    px: 2,
    py: 1,
    borderLeft: '6px solid',
    borderColor: 'divider',
    fontStyle: 'italic',
    color: 'text.secondary',
  }),
)

export default function BlockQuote(props: Props) {
  return (
    <Container>
      {props.node.content?.map((node, index) => (
        <React.Fragment key={node.type + index}>
          {node.type === 'paragraph' && <Paragraph node={node} />}
        </React.Fragment>
      ))}
    </Container>
  )
}
