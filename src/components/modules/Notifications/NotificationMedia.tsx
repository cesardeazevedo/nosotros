import type { Note } from '@/stores/notes/note'
import { shape } from '@/themes/shape.stylex'
import { observer } from 'mobx-react-lite'
import { css, html } from 'react-strict-dom'
import { LinkNEvent } from '../../elements/Links/LinkNEvent'

type Props = {
  note: Note
}

export const NotificationMedia = observer(function NotificationMedia(props: Props) {
  const { note } = props

  if (!note || !note.headImage) {
    return
  }

  return (
    <LinkNEvent nevent={note.event.nevent}>
      <html.div style={styles.root}>
        <html.img style={styles.img} src={note.headImage} />
      </html.div>
    </LinkNEvent>
  )
})

const styles = css.create({
  root: {
    position: 'relative',
    width: 60,
    height: 60,
  },
  img: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 60,
    height: 60,
    objectFit: 'cover',
    borderRadius: shape.md,
  },
})
