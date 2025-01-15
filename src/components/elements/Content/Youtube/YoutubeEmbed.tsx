import { useNoteContext } from '@/components/providers/NoteProvider'
import { Button } from '@/components/ui/Button/Button'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconPlayerPlayFilled } from '@tabler/icons-react'
import { useMemo, useState } from 'react'
import { css, html } from 'react-strict-dom'
import { Image } from '../Image/Image'

const REGEX_VIDEO_ID = /.*(?:youtu.be\/|v\/|u\/\w\/|shorts|embed\/|watch\?v=)([^#&?]*).*/

type Props = {
  src: string
}

export const YoutubeEmbed = (props: Props) => {
  const { src } = props
  const [open, setOpen] = useState(false)
  const { dense } = useNoteContext()

  const embedId = useMemo(() => src.match(REGEX_VIDEO_ID)?.[1].replace('/', ''), [src])

  const iframeSrc = `https://youtube.com/embed/${embedId}?autoplay=1&state=1`
  const posterUrl = `https://i.ytimg.com/vi/${embedId}/hqdefault.jpg`

  return (
    <html.div style={[styles.root, dense && styles.root$dense]}>
      {embedId && (
        <html.div style={styles.content}>
          {!open && <Image dense proxy={false} src={posterUrl} onClick={() => setOpen(true)} sx={styles.image} />}
          {open && (
            <html.div style={styles.iframe}>
              <iframe src={iframeSrc} width={400} height={280} />
            </html.div>
          )}
          {!open && (
            <Button sx={styles.button} onClick={() => setOpen(true)}>
              <IconPlayerPlayFilled fill='red' />
            </Button>
          )}
        </html.div>
      )}
    </html.div>
  )
}

const styles = css.create({
  root: {
    paddingInline: spacing.padding2,
  },
  root$dense: {
    padding: 0,
  },
  content: {
    position: 'relative',
    borderRadius: 1,
    overflow: 'hidden',
    width: 'fit-content',
  },
  image: {
    minWidth: 400,
    minHeight: 280,
  },
  iframe: {
    marginInline: spacing.padding2,
    border: 'none',
    marginTop: 24,
    borderRadius: shape.lg,
    overflow: 'hidden',
  },
  button: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    margin: 'auto',
    zIndex: 1000,
    width: 64,
    height: 44,
    color: 'white',
    borderRadius: shape.xl,
    backgroundColor: 'red',
    ':hover': {
      backgroundColor: 'red',
    },
  },
})
