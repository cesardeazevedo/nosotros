import { useContentContext } from '@/components/providers/ContentProvider'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { useMemo } from 'react'
import { css } from 'react-strict-dom'
import { BlurContainer } from '../../Layouts/BlurContainer'

type Props = {
  src: string
  loop?: boolean
  muted?: boolean
  autoPlay?: boolean
  controls?: boolean
}

export const Video = (props: Props) => {
  const { src, controls = true, muted = false, loop = false, autoPlay = false } = props
  const { dense } = useContentContext()
  const extension = useMemo(() => new URL(src).pathname.split('.').pop(), [src])
  return (
    <BlurContainer>
      {({ blurStyles }) => (
        <video
          {...css.props([styles.root, dense && styles.root$dense, blurStyles])}
          loop={loop}
          muted={muted}
          autoPlay={autoPlay}
          preload='none'
          controls={controls}
          src={src}>
          <source src={src} type={`video/${extension === 'mov' ? 'mp4' : extension}`} />
        </video>
      )}
    </BlurContainer>
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
