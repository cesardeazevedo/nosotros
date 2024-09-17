import { Text } from '@/components/ui/Text/Text'
import { spacing } from '@/themes/spacing.stylex'
import type { HeadingNode } from 'nostr-editor'
import { css } from 'react-strict-dom'
import { TextContent } from '../Text'

type Props = {
  node: HeadingNode
}

export function Heading(props: Props) {
  return (
    <Text sx={styles.root} variant='headline' size={props.node.attrs.level === 1 ? 'md' : 'lg'}>
      <TextContent node={props.node} />
    </Text>
  )
}

const styles = css.create({
  root: {
    marginTop: spacing.margin2,
    marginBottom: spacing.margin1,
    marginLeft: spacing.margin2,
  },
})
