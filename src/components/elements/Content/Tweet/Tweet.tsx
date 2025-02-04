import { useContentContext } from '@/components/providers/ContentProvider'
import { spacing } from '@/themes/spacing.stylex'
import { css, html } from 'react-strict-dom'
import { Tweet as ReactTweet } from 'react-tweet'

export type Props = {
  src: string
}

export const Tweet = (props: Props) => {
  const { src } = props
  const { dense } = useContentContext()
  const id = src.slice(src.lastIndexOf('/') + 1)

  return <html.div style={[styles.root, dense && styles.root$dense]}>{<ReactTweet id={id} />}</html.div>
}

const styles = css.create({
  root: {
    paddingInline: spacing.padding2,
  },
  root$dense: {
    paddingInline: 0,
  },
})
