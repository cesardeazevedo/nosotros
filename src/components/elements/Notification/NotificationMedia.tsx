import { noteStore } from '@/stores/notes/notes.store'
import { shape } from '@/themes/shape.stylex'
import { observer } from 'mobx-react-lite'
import { css, html } from 'react-strict-dom'
import { LinkNEvent } from '../Links/LinkNEvent'

type Props = {
  id: string | undefined
}

export const NotificationMedia = observer(function NotificationMedia(props: Props) {
  const note = noteStore.get(props.id)

  if (!note || !note.headImage) {
    return
  }

  return (
    <LinkNEvent nevent={note.nevent}>
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
