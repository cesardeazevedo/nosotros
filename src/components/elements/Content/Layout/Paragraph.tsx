import { styled } from '@mui/material'
import type { ParagraphNode } from 'content/types'
import { useContext } from 'react'
import { ContentContext } from '../Content'
import { TextContent } from '../Text'

const shouldForwardProp = (prop: string) => prop !== 'dense'

export const Container = styled('div', { shouldForwardProp })<{ dense: boolean }>(({ dense, theme }) =>
  theme.unstable_sx({
    px: dense ? 0 : 2,
    py: dense ? 0 : 0,
    lineHeight: dense ? 1.5 : 1.7,
    wordBreak: 'break-word',
    height: 'auto',
  }),
)

type Props = {
  node: ParagraphNode
}

export default function Paragraph(props: Props) {
  const { node } = props
  const { dense } = useContext(ContentContext)
  return (
    <Container dense={dense}>
      <TextContent node={node} />
    </Container>
  )
}
