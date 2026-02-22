import { useContentContext } from '@/components/providers/ContentProvider'
import { spacing } from '@/themes/spacing.stylex'
import type { HeadingNode } from 'nostr-editor'
import { css } from 'react-strict-dom'
import { TextContent } from '../Text'

type Props = {
  node: HeadingNode
}

export const Heading = (props: Props) => {
  const { dense } = useContentContext()
  return (
    <TextContent
      node={props.node}
      variant='headline'
      size={props.node.attrs.level !== 1 ? 'md' : 'lg'}
      sx={[styles.root, dense && styles.dense]}
    />
  )
}

const styles = css.create({
  root: {
    marginTop: spacing.margin6,
    marginBottom: spacing.margin1,
    paddingLeft: spacing.padding2,
  },
  dense: {
    padding: 0,
  },
})
