import { useEffect, useState } from 'react'
import type { IOrientation } from '../FloatingTransition/FloatingTransition'

export type ISize<TSize = number> = {
  width: TSize
  height: TSize
}

export type IUseElementSizeProps = {
  ref: React.RefObject<HTMLElement>
  observe?: boolean
  orientation?: IOrientation
}

const getElementSize = (element: HTMLElement, orientation: IOrientation): ISize => {
  const prevOverflow = element.style.overflow
  const prevPosition = element.style.position

  element.style.overflow = 'hidden'

  if (orientation === 'horizontal') {
    element.style.position = 'absolute'
  }

  const width = element.clientWidth
  const height = element.clientHeight

  element.style.overflow = prevOverflow
  element.style.position = prevPosition

  return { width, height }
}

export const useElementSize = (props: IUseElementSizeProps): ISize | undefined => {
  const { ref: elementRef, orientation = 'vertical', observe } = props
  const [size, setSize] = useState<ISize | undefined>(
    elementRef.current ? getElementSize(elementRef.current, orientation) : undefined,
  )

  useEffect(() => {
    const element = elementRef.current
    if (!element) {
      return
    }

    if (observe) {
      const resizeObserver = new ResizeObserver(() => {
        const size = getElementSize(element, orientation)
        setSize(size)
      })
      resizeObserver.observe(elementRef.current)

      return () => resizeObserver.disconnect()
    }
  }, [elementRef, observe, orientation])

  return size
}
