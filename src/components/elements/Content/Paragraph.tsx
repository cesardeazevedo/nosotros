import { styled } from '@mui/material'
import type { ParagraphNode } from 'components/elements/Content/types'
import { TextContent } from './Text'

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
  dense?: boolean
}

export function Paragraph(props: Props) {
  const { dense = false } = props
  return (
    <Container dense={dense}>
      <TextContent node={props.node} />
    </Container>
  )
}
