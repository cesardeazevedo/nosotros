import { Typography, styled } from '@mui/material'
import type { HeadingNode } from 'content/types'
import { TextContent } from '../Text'

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

export default function Heading(props: Props) {
  return (
    <Container variant={props.node.attrs.level === 1 ? 'h5' : 'h6'}>
      <TextContent node={props.node} />
    </Container>
  )
}
