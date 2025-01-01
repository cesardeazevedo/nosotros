import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { useContext, useMemo } from 'react'
import { css } from 'react-strict-dom'
import { ContentContext } from '../Content'

type Props = {
  src: string
  loop?: boolean
  muted?: boolean
  autoPlay?: boolean
  controls?: boolean
  preload?: HTMLVideoElement['preload']
}

export const Video = (props: Props) => {
  const { src, controls = true, muted = false, loop = false, autoPlay = false, preload = 'metadata' } = props
  const { dense } = useContext(ContentContext)
  const extension = useMemo(() => new URL(src).pathname.split('.').pop(), [src])

  return (
    <video
      {...css.props([styles.root, dense && styles.root$dense])}
      loop={loop}
      muted={muted}
      autoPlay={autoPlay}
      preload={preload}
      controls={controls}
      src={src}>
      <source src={src} type={`video/${extension === 'mov' ? 'mp4' : extension}`} />
    </video>
  )
}

const styles = css.create({
  root: {
    marginTop: spacing.margin1,
    marginLeft: spacing.margin2,
    marginRight: spacing.margin2,
    marginBottom: spacing.margin1,
    borderRadius: shape.lg,
    width: 'fit-content',
    maxHeight: 400,
    maxWidth: 'calc(100% - 32px)',
    backgroundColor: '#000',
  },
  root$dense: {
    marginLeft: 0,
    marginRight: 0,
  },
})
