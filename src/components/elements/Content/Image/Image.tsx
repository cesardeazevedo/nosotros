import type { SxProps } from '@/components/ui/types'
import { useGlobalSettings } from '@/hooks/useRootStore'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { memo, useCallback, useContext, useRef } from 'react'
import { css, html } from 'react-strict-dom'
import type { StrictClickEvent } from 'react-strict-dom/dist/types/StrictReactDOMProps'
import { dialogStore } from 'stores/ui/dialogs.store'
import { ContentContext } from '../Content'

type Props = {
  src: string
  proxy?: boolean
  dense?: boolean
  onClick?: (event?: StrictClickEvent) => void
  sx?: SxProps
}

export const Image = memo((props: Props) => {
  const { src, proxy = true, sx } = props
  const { dense: denseContext, disableLink } = useContext(ContentContext)
  const dense = props.dense ?? denseContext
  const globalSettings = useGlobalSettings()
  const ref = useRef<HTMLImageElement>(null)

  const handleClick = useCallback(
    (e: StrictClickEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (!disableLink) {
        return props.onClick ? props.onClick() : dialogStore.pushImage(src)
      }
    },
    [src, disableLink],
  )
  return (
    <html.div style={[styles.root, dense && styles.root$dense]} onClick={handleClick}>
      <html.img
        ref={ref}
        src={proxy ? globalSettings.getImgProxyUrl('feed_img', src) : src}
        loading='lazy'
        style={[styles.img, dense && styles.img$dense, sx]}
      />
    </html.div>
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
})
