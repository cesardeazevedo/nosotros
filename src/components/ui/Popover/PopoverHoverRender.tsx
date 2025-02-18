import { useMobile } from '@/hooks/useMobile'
import type { MutableRefObject } from 'react'
import React, { memo, useState } from 'react'
import { html } from 'react-strict-dom'
import type { StrictClickEvent } from 'react-strict-dom/dist/types/StrictReactDOMProps'

export type HoverRef = {
  onEnter: () => void
  onLeave: () => void
} | null

export type Props = {
  open?: boolean
  ref?: MutableRefObject<HoverRef>
  children: React.ReactNode
  content: React.ReactNode
}

// This is a floating-ui optimizer by just simply not rendering it. only on mouse enter
export const PopoverHoverRender = memo(function PopoverHoverRender(props: Props) {
  const [active, setActive] = useState(false)
  const isMobile = useMobile()

  const { children, content } = props

  const handleEnter = () => setActive(true)
  const handleClick = (e: StrictClickEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setActive(true)
  }

  const events = isMobile ? { onClick: handleClick } : { onMouseEnter: handleEnter }

  if (!active && !props.open) {
    return <html.span {...events}>{content}</html.span>
  }

  return children
})
