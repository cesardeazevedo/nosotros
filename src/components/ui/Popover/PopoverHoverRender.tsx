import { useMobile } from '@/hooks/useMobile'
import type { MutableRefObject } from 'react'
import React, { memo, useState } from 'react'
import { html } from 'react-strict-dom'

export type HoverRef = {
  onEnter: () => void
  onLeave: () => void
} | null

export type Props = {
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
  const handleClick = () => setActive(true)

  const events = isMobile ? { onClick: handleClick } : { onMouseEnter: handleEnter }

  if (!active) {
    return <html.span {...events}>{content}</html.span>
  }

  return children
})
