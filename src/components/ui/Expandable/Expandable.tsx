import { duration } from '@/themes/duration.stylex'
import { easing } from '@/themes/easing.stylex'
import React, { useEffect, useRef, useState } from 'react'
import { css, html } from 'react-strict-dom'

export interface ExpandableTriggerRenderProps {
  expanded: boolean
  toggle: () => void
}

export type Props = {
  children: React.ReactNode
  expanded?: boolean
  trigger?: React.ReactNode | ((renderProps: ExpandableTriggerRenderProps) => React.ReactNode)
  onChange?: (expanded: boolean) => void
  initiallyExpanded?: boolean
}

export const Expandable = (props: Props) => {
  const { children, expanded: controlledExpanded, trigger, onChange, initiallyExpanded = false } = props
  const [internalExpanded, setInternalExpanded] = useState(initiallyExpanded)
  const [shouldRenderContent, setShouldRenderContent] = useState(initiallyExpanded)
  const animationTimeoutRef = useRef<NodeJS.Timeout>(null)

  const isControlled = controlledExpanded !== undefined
  const expanded = isControlled ? controlledExpanded : internalExpanded

  useEffect(() => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current)
    }

    if (expanded) {
      setShouldRenderContent(true)
    } else {
      animationTimeoutRef.current = setTimeout(() => {
        setShouldRenderContent(false)
      }, 300)
    }

    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current)
      }
    }
  }, [expanded])

  const toggle = () => {
    const newExpanded = !expanded
    if (!isControlled) {
      setInternalExpanded(newExpanded)
    }
    onChange?.(newExpanded)
  }

  const renderProps: ExpandableTriggerRenderProps = {
    expanded,
    toggle,
  }

  const triggerElement = typeof trigger === 'function' ? trigger(renderProps) : trigger

  return (
    <html.div style={styles.container}>
      {triggerElement && <html.div onClick={toggle}>{triggerElement}</html.div>}
      <html.div style={[styles.content, expanded && styles.contentExpanded]}>
        <html.div style={styles.contentInner}>{shouldRenderContent && children}</html.div>
      </html.div>
    </html.div>
  )
}

const styles = css.create({
  container: {
    overflow: 'hidden',
  },
  content: {
    display: 'grid',
    gridTemplateRows: '0fr',
    transitionProperty: 'grid-template-rows',
    transitionDuration: duration.short4,
    transitionTimingFunction: easing.emphasizedDecelerate,
  },
  contentExpanded: {
    gridTemplateRows: '1fr',
  },
  contentInner: {
    minHeight: 0,
  },
})
