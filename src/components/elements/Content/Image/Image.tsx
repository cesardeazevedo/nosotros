import { addMediaDimAtom, mediaErrorsAtom } from '@/atoms/media.atoms'
import { useContentContext } from '@/components/providers/ContentProvider'
import { useNoteContext } from '@/components/providers/NoteProvider'
import { Stack } from '@/components/ui/Stack/Stack'
import type { SxProps } from '@/components/ui/types'
import { useNevent } from '@/hooks/useEventUtils'
import { useMediaStore } from '@/hooks/useMediaStore'
import { useMobile } from '@/hooks/useMobile'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { getImgProxyUrl } from '@/utils/imgproxy'
import { IconPhotoOff } from '@tabler/icons-react'
import { useAtomValue, useSetAtom } from 'jotai'
import { memo } from 'react'
import { css, html } from 'react-strict-dom'
import { BlurContainer } from '../../Layouts/BlurContainer'
import { LinkNEvent } from '../../Links/LinkNEvent'
import { ContentLink } from '../Link/Link'

type Props = {
  src: string
  proxy?: boolean
  index?: number
  draggable?: boolean
  cover?: boolean
  sx?: SxProps
}

export const Image = memo(function Image(props: Props) {
  const { src, proxy = true, index = 0, cover = false, sx, ...rest } = props
  const { event } = useNoteContext()
  const { dense } = useContentContext()
  const media = useMediaStore(src, event.metadata?.imeta)
  const addMediaDim = useSetAtom(addMediaDimAtom)
  const hasError = useAtomValue(mediaErrorsAtom).has(src)
  const nevent = useNevent(event)
  const isMobile = useMobile()

  return (
    <BlurContainer>
      {({ blurStyles }) => (
        <>
          {hasError && (
            <ContentLink href={src} underline={false} sx={styles.fallbackLink}>
              <Stack gap={1} horizontal={false} sx={styles.fallback} align='center' justify='center'>
                <IconPhotoOff size={40} strokeWidth='1.0' />
                {src}
              </Stack>
            </ContentLink>
          )}
          {!hasError && (
            <LinkNEvent media block nevent={nevent} search={{ media: index }}>
              <html.img
                role='button'
                style={[styles.img, cover && styles.cover, (dense || isMobile) && styles.img$dense, blurStyles, sx]}
                src={proxy ? getImgProxyUrl('feed_img', src) : src}
                onLoad={(e: { target: HTMLImageElement }) => {
                  addMediaDim({ src, dim: [e.target.naturalWidth, e.target.naturalHeight] })
                }}
                {...media}
                {...rest}
              />
            </LinkNEvent>
          )}
        </>
      )}
    </BlurContainer>
  )
})

const styles = css.create({
  img: {
    display: 'block',
    blockSize: 'auto',
    width: 'auto',
    height: 'auto',
    maxHeight: 'inherit',
    cursor: 'pointer',
    border: '1px solid',
    borderColor: palette.outlineVariant,
    borderRadius: shape.xl,
    transition: 'transform 150ms ease',
    ':active': { transform: 'scale(0.985)' },
  },
  img$dense: {
    maxHeight: 340,
  },
  cover: {
    objectFit: 'cover',
  },
  fallback: {
    width: '100%',
    height: '100%',
    textAlign: 'center',
    wordBreak: 'break-all',
    userSelect: 'all',
    paddingInline: spacing.padding8,
    paddingBlock: spacing.padding4,
    backgroundColor: palette.surfaceContainerLow,
    color: palette.onSurfaceVariant,
    borderRadius: shape.lg,
  },
  fallbackLink: {
    display: 'block',
    height: '100%',
  },
})
