import { vars as easing } from '@/themes/easing.stylex'
import React, { createContext, useCallback, useId, useMemo, useRef, useState } from 'react'
import type { TabVariant } from '../Tab/Tab'

export type TabsContextValues = {
  id?: string
  anchor?: string
  renderLabels?: boolean
  onTabActivated: (activeTab: HTMLElement, indicator: HTMLElement) => void
  onChange: (anchor: string | undefined) => void
  variant?: TabVariant
  disabled?: boolean
}

// eslint-disable-next-line react-refresh/only-export-components
export const TabsContext = createContext<TabsContextValues | undefined>(undefined)

type Props = Omit<TabsContextValues, 'onChange' | 'onTabActivated'> & {
  id?: string
  onChange?: (anchor: string | undefined) => void
  children: React.ReactNode
}

export const Tabs = function Tabs(props: Props) {
  const { variant, disabled, onChange, renderLabels = true } = props
  const reactId = useId()
  const id = props.id || reactId

  const [anchor, setAnchor] = useState(props.anchor)

  const getIndicatorKeyframes = useCallback((previousTab: HTMLElement, activeTab: HTMLElement): Array<Keyframe> => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) {
      return [
        { opacity: 0 },
        // Note: including `transform: none` avoids quirky Safari behavior that can hide the
        // animation.
        { transform: 'none' },
      ]
    }

    const fromRect = previousTab.getBoundingClientRect()
    const fromPos = fromRect.left
    const fromExtent = fromRect.width

    const toRect = activeTab.getBoundingClientRect()
    const toPos = toRect.left
    const toExtent = toRect.width

    const translateX = (fromPos - toPos).toFixed(4)
    const scaleX = (fromExtent / toExtent).toFixed(4)

    return [
      { transform: `translateX(${translateX}px) scaleX(${scaleX})` },
      // Note: including `transform: none` avoids quirky Safari behavior that can hide the
      // animation.
      { transform: 'none' },
    ]
  }, [])

  const contextValue = useMemo(() => {
    return {
      id,
      anchor: props.anchor,
      variant,
      renderLabels,
      onTabActivated: (activeTab, indicator) => {
        if (!previousTabRef.current) {
          previousTabRef.current = activeTab

          return
        }

        indicator?.getAnimations().forEach((animation) => animation.cancel())

        if (activeTab) {
          const previousTab = previousTabRef.current
          if (previousTab && indicator) {
            indicatorAnimationRef.current = indicator.animate(getIndicatorKeyframes(previousTab, activeTab), {
              duration: 150,
              easing: easing.emphasized,
            })
          }

          previousTabRef.current = activeTab
        }
      },
      onChange(anchor) {
        setAnchor(anchor)
        onChange?.(anchor)
      },
      disabled,
    } as TabsContextValues
  }, [id, variant, anchor, props.anchor, renderLabels, getIndicatorKeyframes, setAnchor, onChange, disabled])

  const previousTabRef = useRef<HTMLElement | null>(null)
  const indicatorAnimationRef = useRef<Animation>()

  return <TabsContext.Provider value={contextValue}>{props.children}</TabsContext.Provider>
}
