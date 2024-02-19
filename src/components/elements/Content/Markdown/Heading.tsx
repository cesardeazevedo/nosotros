import { Typography, styled } from '@mui/material'
import { TextContent } from '../Text'
import type { HeadingNode } from '../types'

const Container = styled(Typography)(({ theme }) =>
  theme.unstable_sx({
    mt: 2,
    ml: 2,
    fontWeight: 900,
  }),
)

type Props = {
  node: HeadingNode
}

export function Heading(props: Props) {
  return (
    <Container variant={props.node.attrs.level === 1 ? 'h5' : 'h6'}>
      <TextContent node={props.node} />
    </Container>
  )
}
