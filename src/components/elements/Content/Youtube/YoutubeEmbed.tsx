import { Button } from '@/components/ui/Button/Button'
import { spacing } from '@/themes/spacing.stylex'
import { IconPlayerPlayFilled } from '@tabler/icons-react'
import { useContext, useMemo, useState } from 'react'
import { css, html } from 'react-strict-dom'
import { ContentContext } from '../Content'
import Image from '../Image/Image'
import { shape } from '@/themes/shape.stylex'

const REGEX_VIDEO_ID = /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#&?]*).*/

type Props = {
  src: string
}

export function YoutubeEmbed(props: Props) {
  const { src } = props
  const [open, setOpen] = useState(false)
  const { dense } = useContext(ContentContext)

  const embedId = useMemo(() => {
    return src.match(REGEX_VIDEO_ID)?.[1]
  }, [src])

  const iframeSrc = `https://youtube.com/embed/${embedId}?autoplay=1&state=1`
  const posterUrl = `https://i.ytimg.com/vi/${embedId}/hqdefault.jpg`

  return (
    <html.div style={[styles.root, dense && styles.root$dense]}>
      {embedId && (
        <html.div style={styles.content}>
          {!open && <Image proxy={false} src={posterUrl} onClick={() => setOpen(true)} />}
          {open && (
            <iframe
              src={iframeSrc}
              width={380}
              height={220}
              style={{ border: 'none', marginTop: 24, borderRadius: 4, overflow: 'hidden' }}
            />
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
    marginTop: spacing.margin1,
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
