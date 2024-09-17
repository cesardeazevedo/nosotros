import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { typeScale } from '@/themes/typeScale.stylex'
import { useMergeRefs } from '@floating-ui/react'
import type { AriaRole } from 'react'
import React, { forwardRef, useRef } from 'react'
import { css, html } from 'react-strict-dom'
import { dataProps } from '../helpers/dataProps'
import type { IVisualState } from '../hooks/useRipple'
import { useVisualState } from '../hooks/useVisualState'
import { Ripple } from '../Ripple/Ripple'
import type { SxProps } from '../types'
import { listItemTokens } from './ListItem.stylex'

export type Props = {
  sx?: SxProps
  variant?: 'standard' | 'danger'
  disabled?: boolean
  selected?: boolean
  role?: AriaRole
  href?: string
  tabIndex?: -1 | 0
  interactive?: boolean
  visualState?: IVisualState
  leading?: React.ReactNode
  leadingIcon?: React.ReactNode
  leadingImage?: string
  trailing?: React.ReactNode
  trailingIcon?: React.ReactNode
  onClick?: React.MouseEventHandler<HTMLElement>
  children?: React.ReactNode
  overline?: React.ReactNode
  supportingText?: React.ReactNode
  size?: 'sm' | 'md'
  noFocusRing?: boolean
}

export const ListItem = forwardRef<HTMLButtonElement, Props>((props, ref) => {
  const {
    sx,
    variant = 'standard',
    disabled,
    //leading,
    leadingIcon,
    leadingImage,
    trailing,
    trailingIcon,
    interactive,
    onClick,
    size: sizeProp = 'sm',
    children,
    supportingText,
    overline,
  } = props

  //const isInteractive = !!onClick
  const selected = !disabled && props.selected
  const adaptedSize = sizeProp // === 'md' && !!supportingText ? 'lg' : sizeProp

  const actionRef = useRef<HTMLButtonElement>(null)
  const { visualState, setRef } = useVisualState(props.visualState, { disabled })

  const refs = useMergeRefs([ref, setRef, actionRef])

  const hasLeading = !!leadingIcon || leadingImage
  const hasTrailing = !!trailingIcon || trailing

  return (
    <button
      onClick={onClick}
      {...css.props([
        styles.root,
        variants[variant],
        sizes[adaptedSize],
        interactive && styles.root$interactive,
        selected && styles.root$selected,
        disabled && styles.root$disabled,
        sx,
      ])}
      {...dataProps(visualState)}
      ref={refs}>
      <html.div style={styles.container}>
        {/* <html.div */}
        {/*   style={[styles.background, selected && styles.background$selected, disabled && styles.background$disabled]} */}
        {/* /> */}
        {interactive && (
          <Ripple
            visualState={visualState}
            sx={[styles.ripple, selected && styles.ripple$selected, disabled && styles.ripple$disabled]}
            element={actionRef}
          />
        )}
      </html.div>
      {hasLeading && (
        <html.div style={styles.leading}>
          {leadingIcon && <html.span style={styles.leadingIcon}>{leadingIcon}</html.span>}
        </html.div>
      )}
      <html.div style={styles.content}>
        {overline && <html.span style={styles.overline}>{overline}</html.span>}
        <html.span style={styles.text}>{children}</html.span>
        {supportingText && <html.span style={styles.supportingText}>{supportingText}</html.span>}
      </html.div>
      {hasTrailing && (
        <html.div style={styles.trailing}>
          {trailingIcon ? <html.span style={styles.trailing$icon}>{trailingIcon}</html.span> : trailing}
        </html.div>
      )}
    </button>
  )
})

const variants = css.create({
  standard: {
    [listItemTokens.containerColor]: 'transparent',
    [listItemTokens.selectedContainerColor]: palette.primaryContainer,
    [listItemTokens.selectedContainerOpacity]: '1',
    [listItemTokens.textColor]: palette.onSurface,
  },
  danger: {
    [listItemTokens.containerColor]: 'transparent',
    [listItemTokens.selectedContainerColor]: palette.errorContainer,
    [listItemTokens.selectedContainerOpacity]: '1',
    [listItemTokens.textColor]: palette.error,
    [listItemTokens.textColor$disabled]: palette.error,
  },
})

const sizes = css.create({
  sm: {
    [listItemTokens.containerMinHeight]: listItemTokens.containerMinHeight$sm,
    [listItemTokens.topSpace]: listItemTokens.topSpace$sm,
    [listItemTokens.bottomSpace]: listItemTokens.bottomSpace$sm,
  },
  md: {
    [listItemTokens.containerMinHeight]: listItemTokens.containerMinHeight$md,
    [listItemTokens.topSpace]: listItemTokens.topSpace$md,
    [listItemTokens.bottomSpace]: listItemTokens.bottomSpace$md,
  },
})

const styles = css.create({
  root: {
    display: 'flex',
    position: 'relative',
    alignItems: 'center',
    height: '100%',
    gap: spacing.padding2,
    borderRadius: 'inherit',
    minHeight: listItemTokens.containerMinHeight,
    WebkitTapHighlightColor: 'transparent',
    paddingInlineStart: listItemTokens.leadingSpace,
    paddingInlineEnd: listItemTokens.trailingSpace,
    paddingTop: listItemTokens.topSpace,
    paddingBottom: listItemTokens.bottomSpace,
  },
  root$interactive: {
    cursor: 'pointer',
  },
  root$selected: {},
  root$disabled: {
    cursor: 'default',
    pointerEvents: 'none',
    [listItemTokens.textColor]: listItemTokens.textColor$disabled,
    [listItemTokens.textOpacity]: listItemTokens.textOpacity$disabled,
  },
  leading: {
    position: 'relative',
    color: listItemTokens.textColor,
    opacity: listItemTokens.textOpacity,
  },
  leadingIcon: {},
  trailing: {
    position: 'relative',
    color: listItemTokens.textColor,
    opacity: listItemTokens.textOpacity,
  },
  trailing$icon: {},
  container: {
    inset: 0,
    position: 'absolute',
    borderRadius: 'inherit',
  },
  content: {
    position: 'relative',
    display: 'flex',
    flexGrow: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
    color: listItemTokens.textColor,
    opacity: listItemTokens.textOpacity,
  },
  text: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontFamily: typeScale.bodyFont$lg,
    fontSize: typeScale.bodySize$lg,
    fontWeight: typeScale.bodyWeight$lg,
    lineHeight: typeScale.bodyLineHeight$lg,
    letterSpacing: typeScale.bodyLetterSpacing$lg,
  },
  supportingText: {
    textAlign: 'left',
    color: palette.onSurfaceVariant,
    fontFamily: typeScale.bodyFont$sm,
    fontSize: typeScale.bodySize$sm,
    fontWeight: typeScale.bodyWeight$sm,
    lineHeight: typeScale.bodyLineHeight$sm,
    letterSpacing: typeScale.bodyLetterSpacing$sm,
  },
  overline: {
    color: palette.onSurfaceVariant,
    fontFamily: typeScale.labelFont$sm,
    fontSize: typeScale.labelSize$sm,
    fontWeight: typeScale.labelWeight$sm,
    lineHeight: typeScale.labelLineHeight$sm,
    letterSpacing: typeScale.labelLetterSpacing$sm,
  },
  ripple: {
    borderRadius: shape.sm,
    marginInlineStart: spacing.padding1,
    marginInlineEnd: spacing.padding1,
  },
  ripple$selected: {
    backgroundColor: listItemTokens.selectedContainerColor,
  },
  ripple$disabled: {},
})
