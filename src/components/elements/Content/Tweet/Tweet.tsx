import { useNoteContext } from '@/components/providers/NoteProvider'
import { spacing } from '@/themes/spacing.stylex'
import { css, html } from 'react-strict-dom'
import { Tweet as ReactTweet } from 'react-tweet'

export type Props = {
  src: string
}

export const Tweet = (props: Props) => {
  const { src } = props
  const { dense } = useNoteContext()
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
