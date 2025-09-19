import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { useEventHeadImage, useNevent } from '@/hooks/useEventUtils'
import { shape } from '@/themes/shape.stylex'
import { memo } from 'react'
import { css, html } from 'react-strict-dom'
import { LinkNEvent } from '../../elements/Links/LinkNEvent'

type Props = {
  event: NostrEventDB
}

export const NotificationMedia = memo(function NotificationMedia(props: Props) {
  const { event } = props

  const nevent = useNevent(event)
  const headImage = useEventHeadImage(event)

  if (!headImage) {
    return
  }

  return (
    <LinkNEvent nevent={nevent}>
      <html.div style={styles.root}>
        <html.img style={styles.img} src={headImage} />
      </html.div>
    </LinkNEvent>
  )
})

const styles = css.create({
  root: {
    position: 'relative',
  },
  img: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 50,
    height: 50,
    objectFit: 'cover',
    borderRadius: shape.md,
  },
})
