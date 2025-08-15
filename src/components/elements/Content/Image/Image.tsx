import { openImageDialogAtom } from '@/atoms/dialog.atoms'
import { addMediaErrorAtom, mediaErrorsAtom } from '@/atoms/media.atoms'
import { useContentContext } from '@/components/providers/ContentProvider'
import { useNoteContext } from '@/components/providers/NoteProvider'
import { Stack } from '@/components/ui/Stack/Stack'
import type { SxProps } from '@/components/ui/types'
import { useMediaStore } from '@/hooks/useMediaStore'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { getImgProxyUrl } from '@/utils/imgproxy'
import { IconPhotoOff } from '@tabler/icons-react'
import { useAtomValue, useSetAtom } from 'jotai'
import { memo, useCallback } from 'react'
import { css, html } from 'react-strict-dom'
import type { StrictClickEvent } from 'react-strict-dom/dist/types/StrictReactDOMProps'
import { BlurContainer } from '../../Layouts/BlurContainer'
import { ContentLink } from '../Link/Link'

type Props = {
  src: string
  proxy?: boolean
  draggable?: boolean
  onClick?: (event?: StrictClickEvent) => void
  sx?: SxProps
}

export const Image = memo(function Image(props: Props) {
  const { src, proxy = true, sx, onClick, ...rest } = props
  const { disableLink } = useContentContext()
  const { note } = useNoteContext()
  const pushImage = useSetAtom(openImageDialogAtom)
  const hasError = useAtomValue(mediaErrorsAtom).has(src)
  const addError = useSetAtom(addMediaErrorAtom)
  const media = useMediaStore(src, note.metadata?.imeta)

  const handleClick = useCallback(
    (e: StrictClickEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (!hasError && note) {
        return onClick ? onClick() : pushImage({ eventId: note.id, src })
      }
    },
    [src, note, disableLink, hasError, pushImage],
  )

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
            <html.img
              crossOrigin='use-credentials'
              style={[styles.img, blurStyles, sx]}
              src={proxy ? getImgProxyUrl('feed_img', src) : src}
              onClick={handleClick}
              onError={() => addError(src)}
              {...rest}
              {...media}
            />
          )}
        </>
      )}
    </BlurContainer>
  )
})

const styles = css.create({
  img: {
    objectFit: 'cover',
    width: 'inherit',
    height: 'inherit',
    maxWidth: 'inherit',
    maxHeight: 'inherit',
    userSelect: 'none',
    cursor: 'pointer',
    backgroundColor: palette.surfaceContainerLow,
    borderRadius: shape.xl,
    transition: 'transform 150ms ease',
    ':active': {
      transform: 'scale(0.985)',
    },
  },
  fallback: {
    width: '100%',
    height: '100%',
    textAlign: 'center',
    wordBreak: 'break-all',
    userSelect: 'all',
    paddingInline: spacing.padding1,
    backgroundColor: palette.surfaceContainer,
    color: palette.onSurfaceVariant,
    borderRadius: shape.lg,
  },
  fallbackLink: {
    display: 'block',
    height: '100%',
  },
})
