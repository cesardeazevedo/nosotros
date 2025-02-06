import { outline } from '@/themes/outline.stylex'
import { palette } from '@/themes/palette.stylex'
import { scale } from '@/themes/scale.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import React, { forwardRef, useCallback, useContext, useEffect, useRef } from 'react'
import { css, html } from 'react-strict-dom'
import type { StrictClickEvent, StrictReactDOMProps } from 'react-strict-dom/dist/types/StrictReactDOMProps'
import { Elevation } from '../Elevation/Elevation'
import { FocusRing } from '../FocusRing/FocusRing'
import { focusRingTokens } from '../FocusRing/FocusRing.stylex'
import { dataProps } from '../helpers/dataProps'
import { mergeRefs } from '../helpers/mergeRefs'
import { useVisualState } from '../hooks/useVisualState'
import { Ripple } from '../Ripple/Ripple'
import { TabsContext } from '../Tabs/Tabs'
import type { SxProps } from '../types'
import { tabStateTokens, tabTokens } from './Tab.stylex'

export type TabVariant = 'primary' | 'secondary'

type Props = {
  sx?: SxProps
  anchor?: string
  active?: boolean
  label?: string
  variant?: TabVariant
  icon?: React.ReactNode
  activeIcon?: React.ReactNode
  badge?: boolean // todo
  onClick?: StrictReactDOMProps['onClick']
  disabled?: boolean
}

export const Tab = forwardRef<HTMLButtonElement, Props>((props, ref) => {
  const { sx, anchor, activeIcon, icon, label, onClick } = props

  const tabsContext = useContext(TabsContext)
  const variant = props.variant ?? tabsContext?.variant ?? 'primary'
  const disabled = props.disabled ?? tabsContext?.disabled

  const { visualState, setRef } = useVisualState(undefined, { disabled })

  const active = !disabled
    ? tabsContext
      ? tabsContext.anchor !== undefined && tabsContext.anchor === anchor
      : props.active || false
    : false

  const actionRef = useRef<HTMLButtonElement | null>(null)
  const indicatorRef = useRef<HTMLDivElement>(null)
  const refs = mergeRefs([ref, setRef, actionRef])

  const stacked = variant === 'primary'
  const fullWidthIndicator = variant === 'secondary'

  const handleClick = useCallback(
    (event: StrictClickEvent) => {
      tabsContext?.onChange(anchor)
      onClick?.(event)
    },
    [tabsContext],
  )

  useEffect(() => {
    const activeTab = actionRef.current
    const indicator = indicatorRef.current
    if (tabsContext && active && activeTab && indicator) {
      tabsContext.onTabActivated(activeTab, indicator)
    }
  }, [active, anchor, tabsContext])

  const hasIcon = active ? !!activeIcon || !!icon : !!icon

  return (
    <html.button
      style={[styles.root, variants[variant], sx]}
      role='tab'
      aria-controls={anchor}
      aria-selected={active}
      onClick={handleClick}
      ref={refs}
      {...(active ? dataProps(visualState) : {})}>
      <Elevation />
      <Ripple element={actionRef} visualState={active ? visualState : {}} />
      <FocusRing sx={styles.focusRing} element={actionRef} visualState={visualState} />
      <html.div style={[styles.content, stacked && styles.content$stacked]}>
        {hasIcon && (
          <html.div aria-hidden style={[styles.icon, active && styles.icon$active, disabled && styles.icon$disabled]}>
            {active ? activeIcon || icon : icon}
          </html.div>
        )}
        {label && (
          <html.div style={styles.labelContainer}>
            <html.div style={[styles.label, active && styles.label$active, disabled && styles.label$disabled]}>
              {tabsContext?.renderLabels && label}
            </html.div>
            {/* badge */}
          </html.div>
        )}
        {!fullWidthIndicator && (
          <html.div style={[styles.indicator, active && styles.indicator$active]} ref={indicatorRef} />
        )}
      </html.div>
      {fullWidthIndicator && (
        <html.div style={[styles.indicator, active && styles.indicator$active]} ref={indicatorRef} />
      )}
    </html.button>
  )
})

const variants = css.create({
  primary: {
    [tabTokens.activeIndicatorHeight]: outline.md,
    [tabTokens.activeIndicatorShape]: `calc(3px * ${scale.scale}) calc(3px * ${scale.scale}) 0 0`,

    [tabTokens.activeStateLayerColor$hover]: palette.primary,
    [tabTokens.activeStateLayerOpacity$hover]: tabTokens.stateLayerOpacity$hover,
    [tabTokens.activeStateLayerColor$pressed]: palette.primary,
    [tabTokens.activeStateLayerOpacity$pressed]: tabTokens.stateLayerOpacity$pressed,

    [tabTokens.containerShape]: shape.sm,
    [tabTokens.containerHeight$withIconAndLabelText]: '64px',

    [tabTokens.activeIconColor]: palette.primary,
    [tabTokens.activeIconColor$focus]: palette.primary,
    [tabTokens.activeIconColor$hover]: palette.primary,
    [tabTokens.activeIconColor$pressed]: palette.primary,

    [tabTokens.activeLabelTextColor]: palette.primary,
    [tabTokens.activeLabelTextColor$focus]: palette.primary,
    [tabTokens.activeLabelTextColor$hover]: palette.primary,
    [tabTokens.activeLabelTextColor$pressed]: palette.primary,
  },
  secondary: {
    [tabTokens.activeIndicatorHeight]: '2px',
    [tabTokens.activeIndicatorShape]: '0px',

    [tabTokens.activeLabelTextColor]: palette.onSurface,

    [tabTokens.activeIconColor]: tabTokens.iconColor,
    [tabTokens.activeIconColor$focus]: tabTokens.iconColor$focus,
    [tabTokens.activeIconColor$hover]: tabTokens.iconColor$hover,
    [tabTokens.activeIconColor$pressed]: tabTokens.iconColor$pressed,

    [tabTokens.activeLabelTextColor$focus]: tabTokens.labelTextColor$focus,
    [tabTokens.activeLabelTextColor$hover]: tabTokens.labelTextColor$hover,
    [tabTokens.activeLabelTextColor$pressed]: tabTokens.labelTextColor$pressed,

    [tabTokens.activeStateLayerColor$hover]: tabTokens.stateLayerColor$hover,
    [tabTokens.activeStateLayerOpacity$hover]: tabTokens.stateLayerOpacity$hover,
    [tabTokens.activeStateLayerColor$pressed]: tabTokens.stateLayerColor$pressed,
    [tabTokens.activeStateLayerOpacity$pressed]: tabTokens.stateLayerOpacity$pressed,
  },
})

const styles = css.create({
  root: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: '0%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    outline: 'none',
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: spacing.padding2,
    paddingRight: spacing.padding2,
    marginInline: spacing['margin0.5'],
    position: 'relative',
    WebkitTapHighlightColor: 'transparent',
    verticalAlign: 'middle',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    //cursor: 'pointer',
    // cursor: {
    //   default: 'default',
    //   ':is([data-hovered])': 'pointer',
    // },
    borderRadius: 'inherit',
    borderStyle: 'unset',
    textDecoration: 'none',
    paddingBlock: 0,
    [tabStateTokens.stateLayerColor$hover]: tabTokens.stateLayerColor$hover,
    [tabStateTokens.stateLayerOpacity$hover]: tabTokens.stateLayerOpacity$hover,
    [tabStateTokens.stateLayerColor$pressed]: tabTokens.stateLayerColor$pressed,
    [tabStateTokens.stateLayerOpacity$pressed]: tabTokens.stateLayerOpacity$pressed,
  },
  disabled: {
    cursor: 'default',
    pointerEvents: 'none',
    [tabStateTokens.elevation]: tabTokens.containerElevation$disabled,
  },
  active: {
    [tabStateTokens.stateLayerColor$hover]: tabTokens.activeStateLayerColor$hover,
    [tabStateTokens.stateLayerOpacity$hover]: tabTokens.activeStateLayerOpacity$hover,
    [tabStateTokens.stateLayerColor$pressed]: tabTokens.activeStateLayerColor$pressed,
    [tabStateTokens.stateLayerOpacity$pressed]: tabTokens.activeStateLayerOpacity$pressed,
  },
  labelContainer: {
    display: 'flex',
    gap: 4,
    alignItems: 'center',
  },
  label: {
    fontFamily: tabTokens.labelTextFont,
    fontSize: tabTokens.labelTextSize,
    fontWeight: tabTokens.labelTextWeight,
    lineHeight: tabTokens.labelTextLineHeight,
    letterSpacing: tabTokens.labelTextLetterSpacing,

    color: {
      default: tabTokens.labelTextColor,
      ':is([data-focused])': tabTokens.labelTextColor$focus,
      ':is([data-hovered])': tabTokens.labelTextColor$hover,
      ':is([data-pressed])': tabTokens.labelTextColor$pressed,
    },
  },
  label$active: {
    color: {
      default: tabTokens.activeLabelTextColor,
      ':is([data-focused])': tabTokens.activeLabelTextColor$focus,
      ':is([data-hovered])': tabTokens.activeLabelTextColor$hover,
      ':is([data-pressed])': tabTokens.activeLabelTextColor$pressed,
    },
  },
  label$disabled: {
    color: tabTokens.labelTextColor$disabled,
    opacity: tabTokens.labelTextOpacity$disabled,
  },
  content: {
    position: 'relative',
    display: 'inline-flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: tabTokens.containerHeight,
    minWidth: '64px',
    gap: 8,
  },
  content$stacked: {
    flexDirection: 'column',
    gap: spacing['padding0.5'],
  },
  content$stacked$hasIcon$hasLabel: {
    height: tabTokens.containerHeight$withIconAndLabelText,
  },
  indicator: {
    position: 'absolute',
    transformOrigin: 'left bottom',
    backgroundColor: tabTokens.activeIndicatorColor,
    borderRadius: tabTokens.activeIndicatorShape,
    height: tabTokens.activeIndicatorHeight,
    inset: 'auto 0 0 0',
    // hidden unless the tab is selected
    opacity: 0,
  },
  indicator$active: {
    opacity: 1,
  },
  icon: {
    display: 'inline-flex',
    position: 'relative',
    writingMode: 'horizontal-tb',
    //fontSize: tabTokens.iconSize,
    // width: tabTokens.iconSize,
    // height: tabTokens.iconSize,
    color: {
      default: tabTokens.iconColor,
      ':is([data-focused])': tabTokens.iconColor$focus,
      ':is([data-hovered])': tabTokens.iconColor$hover,
      ':is([data-pressed])': tabTokens.iconColor$pressed,
    },
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon$disabled: {
    color: tabTokens.iconColor$disabled,
    opacity: tabTokens.iconOpacity$disabled,
  },
  icon$active: {
    color: {
      default: tabTokens.activeIconColor,
      ':is([data-focused])': tabTokens.activeIconColor$focus,
      ':is([data-hovered])': tabTokens.activeIconColor$hover,
      ':is([data-pressed])': tabTokens.activeIconColor$pressed,
    },
  },
  focusRing: {
    [focusRingTokens.shape]: tabTokens.containerShape,
  },
})
