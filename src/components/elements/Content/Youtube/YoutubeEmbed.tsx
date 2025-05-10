import { Button } from '@/components/ui/Button/Button'
import { Text } from '@/components/ui/Text/Text'
import { useGlobalSettings } from '@/hooks/useRootStore'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconPlayerPlayFilled } from '@tabler/icons-react'
import { useMemo, useState } from 'react'
import { css, html } from 'react-strict-dom'
import { ContentLink } from '../Link/Link'

const REGEX_VIDEO_ID = /.*(?:youtu.be\/|v\/|u\/\w\/|shorts|embed\/|watch\?v=)([^#&?]*).*/

type Props = {
  src: string
}

export const YoutubeEmbed = (props: Props) => {
  const { src } = props
  const [open, setOpen] = useState(false)
  const globalSettings = useGlobalSettings()

  const embedId = useMemo(() => src.match(REGEX_VIDEO_ID)?.[1].replace('/', ''), [src])

  const iframeSrc = `https://youtube.com/embed/${embedId}?autoplay=1&state=1`
  const posterUrl = `https://i.ytimg.com/vi/${embedId}/hqdefault.jpg`

  return (
    <html.div>
      {embedId ? (
        <html.div style={styles.content}>
          {!open && (
            <html.img
              style={[styles.img]}
              src={globalSettings.getImgProxyUrl('feed_img', posterUrl)}
              onClick={() => setOpen(true)}
            />
          )}
          {open && <iframe {...css.props(styles.iframe)} src={iframeSrc} width={400} height={280} />}
          {!open && (
            <Button sx={styles.button} onClick={() => setOpen(true)}>
              <IconPlayerPlayFilled fill='white' />
            </Button>
          )}
        </html.div>
      ) : (
        // likely a playlist or some other youtube link
        <Text size='lg'>
          <ContentLink underline href={src} shrink={false}>
            {src}
          </ContentLink>
        </Text>
      )}
    </html.div>
  )
}

const styles = css.create({
  img: {
    objectFit: 'cover',
    width: '100%',
    height: '100%',
    maxWidth: '100%',
    maxHeight: '100%',
    userSelect: 'none',
    cursor: 'pointer',
    backgroundColor: palette.surfaceContainerLow,
    borderRadius: shape.xl,
    transition: 'transform 150ms ease',
    ':active': {
      transform: 'scale(0.985)',
    },
  },
  content: {
    position: 'relative',
    borderRadius: 1,
    overflow: 'hidden',
    width: 'fit-content',
  },
  iframe: {
    border: 'none',
    marginTop: spacing.margin2,
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
    zIndex: 10,
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
