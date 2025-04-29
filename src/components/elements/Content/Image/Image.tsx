import { useContentContext } from '@/components/providers/ContentProvider'
import { useNoteContext } from '@/components/providers/NoteProvider'
import { Stack } from '@/components/ui/Stack/Stack'
import type { SxProps } from '@/components/ui/types'
import { useMediaStore } from '@/hooks/useMediaStore'
import { useGlobalSettings } from '@/hooks/useRootStore'
import { mediaStore } from '@/stores/media/media.store'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconPhotoOff } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import { useCallback } from 'react'
import { css, html } from 'react-strict-dom'
import type { StrictClickEvent } from 'react-strict-dom/dist/types/StrictReactDOMProps'
import { dialogStore } from 'stores/ui/dialogs.store'
import { BlurContainer } from '../../Layouts/BlurContainer'

type Props = {
  src: string
  proxy?: boolean
  draggable?: boolean
  onClick?: (event?: StrictClickEvent) => void
  sx?: SxProps
}

export const Image = observer(function Image(props: Props) {
  const { src, proxy = true, sx, onClick, ...rest } = props
  const { disableLink } = useContentContext()
  const { note } = useNoteContext()
  const globalSettings = useGlobalSettings()
  const hasError = mediaStore.hasError(src)
  const media = useMediaStore(src, note.metadata.imeta)

  const handleClick = useCallback(
    (e: StrictClickEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (!hasError) {
        return onClick ? onClick() : dialogStore.pushImage(src)
      }
    },
    [src, disableLink, hasError],
  )

  return (
    <BlurContainer>
      {({ blurStyles }) => (
        <>
          {hasError && (
            <Stack gap={1} horizontal={false} sx={styles.fallback} align='center' justify='center'>
              <IconPhotoOff size={40} strokeWidth='1.0' />
              {src}
            </Stack>
          )}
          {!hasError && (
            <html.img
              style={[styles.img, blurStyles, sx]}
              src={proxy ? globalSettings.getImgProxyUrl('feed_img', src) : src}
              onClick={handleClick}
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
  fallback: {
    width: 180,
    height: 200,
    textAlign: 'center',
    wordBreak: 'break-all',
    paddingInline: spacing.padding1,
    backgroundColor: palette.surfaceContainer,
    color: palette.onSurfaceVariant,
    borderRadius: shape.lg,
  },
})
