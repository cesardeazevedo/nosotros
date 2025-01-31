import { useContentContext } from '@/components/providers/ContentProvider'
import { useNoteContext } from '@/components/providers/NoteProvider'
import { Stack } from '@/components/ui/Stack/Stack'
import type { SxProps } from '@/components/ui/types'
import { useGlobalSettings } from '@/hooks/useRootStore'
import { mediaStore } from '@/stores/media/media.store'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconPhotoOff } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import { useCallback, useRef } from 'react'
import { css, html } from 'react-strict-dom'
import type { StrictClickEvent } from 'react-strict-dom/dist/types/StrictReactDOMProps'
import { dialogStore } from 'stores/ui/dialogs.store'
import { BlurContainer } from '../../Layouts/BlurContainer'

type Props = {
  src: string
  proxy?: boolean
  dense?: boolean
  onClick?: (event?: StrictClickEvent) => void
  sx?: SxProps
}

export const Image = observer(function Image(props: Props) {
  const { src, proxy = true, sx } = props
  const { dense: denseContext, disableLink } = useContentContext()
  const { note } = useNoteContext()
  const dense = props.dense ?? denseContext
  const globalSettings = useGlobalSettings()
  const ref = useRef<HTMLImageElement>(null)

  const hasError = mediaStore.hasError(src)

  const width = note?.metadata.imeta?.[src]?.dim?.width || 0
  const height = note?.metadata.imeta?.[src]?.dim?.width || 0
  const bounds = width !== 0 && height !== 0 ? { width, height } : {}

  const handleClick = useCallback(
    (e: StrictClickEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (!hasError) {
        return props.onClick ? props.onClick() : dialogStore.pushImage(src)
      }
    },
    [src, disableLink, hasError],
  )

  const handleError = useCallback(() => {
    mediaStore.addError(src)
  }, [])

  return (
    <BlurContainer>
      {({ blurStyles }) => (
        <html.div style={[styles.root, dense && styles.root$dense]} onClick={handleClick}>
          {hasError && (
            <Stack sx={styles.fallback} align='center' justify='center'>
              <IconPhotoOff size={44} strokeWidth='0.8' />
            </Stack>
          )}
          {!hasError && (
            <html.img
              {...bounds}
              ref={ref}
              src={proxy ? globalSettings.getImgProxyUrl('feed_img', src) : src}
              // loading='lazy'
              onError={handleError}
              style={[styles.img, dense && styles.img$dense, blurStyles, sx]}
            />
          )}
        </html.div>
      )}
    </BlurContainer>
  )
})

const MOBILE = '@media (max-width: 599.95px)'

const styles = css.create({
  root: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    position: 'relative',
    paddingInline: spacing.padding2,
    width: 'fit-content',
    height: 'fit-content',
    marginTop: spacing.margin1,
    marginBottom: spacing.margin1,
  },
  root$dense: {
    paddingInline: 0,
  },
  img: {
    objectFit: 'contain',
    width: 'auto',
    height: 'auto',
    userSelect: 'none',
    cursor: 'pointer',
    maxWidth: {
      default: 400,
      [MOBILE]: 'calc(100vw - 90px)',
    },
    maxHeight: 440,
    borderRadius: shape.lg,
  },
  img$dense: {
    maxHeight: 400,
    marginTop: 6,
    maxWidth: {
      default: 360,
      [MOBILE]: '100%',
    },
  },
  fallback: {
    width: 180,
    height: 200,
    backgroundColor: palette.surfaceContainer,
    color: palette.onSurfaceVariant,
    borderRadius: shape.lg,
  },
})
