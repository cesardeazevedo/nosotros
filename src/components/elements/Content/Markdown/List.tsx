import { Box } from '@mui/material'
import React from 'react'
import type { Note } from 'stores/modules/note.store'
import { Paragraph } from '../Paragraph'
import type { BulletListNode, OrderedListNode } from '../types'
import CodeBlock from './CodeBlock'

type Props = {
  note: Note
  type: 'ol' | 'ul'
  node: OrderedListNode | BulletListNode
  dense?: boolean
}

function List(props: Props) {
  const { type, node, dense } = props
  return (
    <Box component={type}>
      {node.content.map((item, index) => (
        <Box component='li' key={item.type + index}>
          {item.content.map((node, index) => (
            <React.Fragment key={node.type + index}>
              {node.type === 'paragraph' && <Paragraph dense={dense} node={node} />}
              {node.type === 'codeBlock' && <CodeBlock node={node} />}
            </React.Fragment>
          ))}
        </Box>
      ))}
    </Box>
  )
}

export default List
