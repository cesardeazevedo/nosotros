import { outline } from '@/themes/outline.stylex'
import { palette } from '@/themes/palette.stylex'
import { scale } from '@/themes/scale.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import React, { useCallback, useContext, useEffect, useRef } from 'react'
import { css, html } from 'react-strict-dom'
import type { StrictClickEvent } from 'react-strict-dom/dist/types/StrictReactDOMProps'
import { Anchored } from '../Anchored/Anchored'
import { Button } from '../Button/Button'
import { mergeRefs } from '../helpers/mergeRefs'
import { TabsContext } from '../Tabs/Tabs'
import type { SxProps } from '../types'
import { tabTokens } from './Tab.stylex'

export type TabVariant = 'primary' | 'secondary'

type Props = {
  sx?: SxProps
  anchor?: string
  active?: boolean
  label?: React.ReactNode | string
  variant?: TabVariant
  icon?: React.ReactNode
  activeIcon?: React.ReactNode
  badge?: React.ReactNode
  onClick?: (e: StrictClickEvent) => void
  disabled?: boolean
  ref?: React.Ref<HTMLButtonElement>
}

export const Tab = (props: Props) => {
  const { sx, anchor, activeIcon, icon, label, badge, onClick, ref, disabled } = props
  const tabs = useContext(TabsContext)
  const variant: TabVariant = props.variant ?? tabs?.variant ?? 'primary'
  const isDisabled = disabled ?? tabs?.disabled ?? false
  const isActive = !isDisabled
    ? tabs
      ? tabs.anchor !== undefined && tabs.anchor === anchor
      : (props.active ?? false)
    : false

  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const indicatorRef = useRef<HTMLDivElement | null>(null)
  const refs = mergeRefs([ref, buttonRef])

  const handleClick = useCallback(
    (e: StrictClickEvent) => {
      tabs?.onChange(anchor)
      onClick?.(e)
    },
    [tabs, anchor, onClick],
  )

  useEffect(() => {
    if (tabs && isActive && buttonRef.current && indicatorRef.current) {
      tabs.onTabActivated(buttonRef.current, indicatorRef.current)
    }
  }, [tabs, isActive, anchor])

  const stacked = variant === 'primary'
  const fullWidthIndicator = false
  const hasIcon = isActive ? !!activeIcon || !!icon : !!icon
  const hasAnchoredBadge = !!badge && !isDisabled && (variant === 'primary' || !label)
  const hasInlineBadge = !!badge && !isDisabled && !!label && (variant === 'secondary' || !hasIcon)

  const withBadge = (content: React.ReactNode) =>
    hasAnchoredBadge ? (
      <Anchored position='top-end' content={badge}>
        {content}
      </Anchored>
    ) : (
      content
    )

  return (
    <Button
      ref={refs}
      as='button'
      role='tab'
      aria-controls={anchor}
      aria-selected={isActive}
      disabled={isDisabled}
      variant='text'
      onClick={handleClick}
      sx={[styles.root, variants[variant], isActive && styles.active, sx]}>
      <html.div style={[styles.content, stacked && styles.content$stacked]}>
        {hasIcon &&
          withBadge(
            <html.div
              aria-hidden
              style={[styles.icon, isActive && styles.icon$active, isDisabled && styles.icon$disabled]}>
              {isActive ? activeIcon || icon : icon}
            </html.div>,
          )}
        {label && (
          <html.div style={styles.labelContainer}>
            <html.div style={[styles.label, isActive && styles.label$active, isDisabled && styles.label$disabled]}>
              {label}
            </html.div>
            {hasInlineBadge && badge}
          </html.div>
        )}
        {!fullWidthIndicator && (
          <html.div style={[styles.indicator, isActive && styles.indicator$active]} ref={indicatorRef} />
        )}
      </html.div>
      {fullWidthIndicator && (
        <html.div style={[styles.indicator, isActive && styles.indicator$active]} ref={indicatorRef} />
      )}
    </Button>
  )
}

const variants = css.create({
  primary: {
    [tabTokens.activeIndicatorHeight]: outline.md,
    [tabTokens.activeIndicatorShape]: `calc(3px * ${scale.scale}) calc(3px * ${scale.scale}) 0 0`,
    [tabTokens.containerShape]: shape.full,
    [tabTokens.containerHeight$withIconAndLabelText]: '64px',
    [tabTokens.activeIconColor]: palette.primary,
    [tabTokens.activeIconColor$hover]: palette.primary,
    [tabTokens.activeIconColor$pressed]: palette.primary,
    [tabTokens.activeLabelTextColor]: palette.primary,
    [tabTokens.activeLabelTextColor$hover]: palette.primary,
    [tabTokens.activeLabelTextColor$pressed]: palette.primary,
  },
  secondary: {
    [tabTokens.activeIndicatorHeight]: '2px',
    [tabTokens.activeIndicatorShape]: '0px',
    [tabTokens.containerShape]: shape.full,
    [tabTokens.activeLabelTextColor]: palette.onSurface,
    [tabTokens.activeIconColor]: tabTokens.iconColor,
    [tabTokens.activeIconColor$hover]: tabTokens.iconColor$hover,
    [tabTokens.activeIconColor$pressed]: tabTokens.iconColor$pressed,
    [tabTokens.activeLabelTextColor$hover]: tabTokens.labelTextColor$hover,
    [tabTokens.activeLabelTextColor$pressed]: tabTokens.labelTextColor$pressed,
  },
})

const styles = css.create({
  root: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: '0%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: spacing.padding2,
    paddingRight: spacing.padding2,
    marginInline: spacing['margin0.5'],
    position: 'relative',
    verticalAlign: 'middle',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    borderRadius: tabTokens.containerShape,
    textDecoration: 'none',
  },
  active: {},
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
    color: tabTokens.labelTextColor,
  },
  label$active: {
    color: tabTokens.activeLabelTextColor,
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
  indicator: {
    position: 'absolute',
    transformOrigin: 'left bottom',
    backgroundColor: tabTokens.activeIndicatorColor,
    borderRadius: tabTokens.activeIndicatorShape,
    height: tabTokens.activeIndicatorHeight,
    inset: 'auto 0 0 0',
    opacity: 0,
  },
  indicator$active: {
    opacity: 1,
  },
  icon: {
    display: 'inline-flex',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    color: tabTokens.iconColor,
  },
  icon$disabled: {
    color: tabTokens.iconColor$disabled,
    opacity: tabTokens.iconOpacity$disabled,
  },
  icon$active: {
    color: tabTokens.activeIconColor,
  },
})
