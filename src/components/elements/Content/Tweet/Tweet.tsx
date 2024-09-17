import { spacing } from '@/themes/spacing.stylex'
import { useContext } from 'react'
import { css, html } from 'react-strict-dom'
import { Tweet as ReactTweet } from 'react-tweet'
import { ContentContext } from '../Content'

export type Props = {
  src: string
}

export function Tweet(props: Props) {
  const { src } = props
  const { dense } = useContext(ContentContext)
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
