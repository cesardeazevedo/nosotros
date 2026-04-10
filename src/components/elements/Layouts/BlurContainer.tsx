import { useContentContext } from '@/components/providers/ContentProvider'
import type { SxProps } from '@/components/ui/types'
import { shape } from '@/themes/shape.stylex'
import { useCallback, useState, type ReactNode } from 'react'
import { css, html } from 'react-strict-dom'
import type { StrictClickEvent } from 'react-strict-dom/dist/types/StrictReactDOMProps'

type Props = {
  // We need to pass blurStyles to the children because safari doesn't support applying filter blur in a parent div
  children: ({ blurStyles }: { blurStyles: SxProps }) => ReactNode
}

export const BlurContainer = (props: Props) => {
  const [blured, setBlured] = useState(true)
  const context = useContentContext()

  const handleClick = useCallback((e: StrictClickEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setBlured(false)
  }, [])

  if (!context.blured || !blured) {
    return props.children({ blurStyles: undefined })
  }

  return (
    <html.div style={styles.root} onClick={handleClick}>
      {props.children({ blurStyles: styles.blur })}
    </html.div>
  )
}

const styles = css.create({
  root: {
    position: 'relative',
    width: 'inherit',
    height: 'inherit',
    maxWidth: 'fit-content',
    maxHeight: 'inherit',
    borderRadius: shape.lg,
    overflow: 'hidden',
  },
  blur: {
    filter: 'blur(40px)',
  },
})
