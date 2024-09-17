import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { memo, useCallback, useContext, useRef } from 'react'
import { css, html } from 'react-strict-dom'
import type { StrictClickEvent } from 'react-strict-dom/dist/types/StrictReactDOMProps'
import { dialogStore } from 'stores/ui/dialogs.store'
import { settingsStore } from 'stores/ui/settings.store'
import { ContentContext } from '../Content'

type Props = {
  src: string
  proxy?: boolean
  onClick?: (event?: StrictClickEvent) => void
}

export const Image = memo((props: Props) => {
  const { src, proxy = true } = props
  const { dense, disableLink } = useContext(ContentContext)
  const ref = useRef<HTMLImageElement>(null)

  const handleClick = useCallback(
    (e: StrictClickEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (!disableLink) {
        return props.onClick ? props.onClick() : dialogStore.pushImage(src)
      }
    },
    [src, disableLink, props.onClick],
  )
  return (
    <html.div style={[styles.root, dense && styles.root$dense]} onClick={handleClick}>
      <html.img
        ref={ref}
        src={proxy ? settingsStore.getImgProxyUrl('feed_img', src) : src}
        loading='lazy'
        style={[styles.img, dense && styles.img$dense]}
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
  },
  root$dense: {
    paddingInline: 0,
  },
  img: {
    objectFit: 'cover',
    width: 'fit-content',
    height: 'fit-content',
    userSelect: 'none',
    maxWidth: {
      default: 400,
      [MOBILE]: 'calc(100vw - 90px)',
    },
    maxHeight: 440,
    marginTop: spacing.margin1,
    marginBottom: spacing.margin1,
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

export default Image
