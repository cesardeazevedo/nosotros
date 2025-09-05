import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { typeScale } from '@/themes/typeScale.stylex'
import React from 'react'
import { css, html } from 'react-strict-dom'
import type { StrictClickEvent } from 'react-strict-dom/dist/types/StrictReactDOMProps'
import { Button } from '../Button/Button'
import type { SxProps } from '../types'

type Size = 'sm' | 'md'
type Variant = 'standard' | 'danger'

export type Props = {
  sx?: SxProps
  variant?: Variant
  disabled?: boolean
  selected?: boolean
  interactive?: boolean
  tabIndex?: -1 | 0
  leading?: React.ReactNode
  leadingIcon?: React.ReactNode
  trailing?: React.ReactNode
  trailingIcon?: React.ReactNode
  onClick?: (e: StrictClickEvent) => void
  onMouseDown?: (e: StrictClickEvent) => void
  onMouseOver?: React.MouseEventHandler<HTMLElement>
  children?: React.ReactNode
  overline?: React.ReactNode
  supportingText?: React.ReactNode
  size?: Size
  noFocusRing?: boolean
  ref?: React.Ref<HTMLButtonElement & HTMLDivElement>
}

export const ListItem = (props: Props) => {
  const {
    sx,
    variant = 'standard',
    disabled,
    selected,
    onClick,
    onMouseDown,
    onMouseOver,
    size = 'md',
    leading,
    leadingIcon,
    trailing,
    trailingIcon,
    interactive,
    children,
    overline,
    supportingText,
    tabIndex,
    ref,
    ...rest
  } = props

  const hasLeading = !!leading || !!leadingIcon
  const hasTrailing = !!trailing || !!trailingIcon
  const isInteractive = interactive || typeof onClick === 'function'

  const itemStyles = [
    styles.root,
    sizes[size],
    variants[variant],
    selected && (variant === 'danger' ? styles.selected$danger : styles.selected),
    disabled && styles.disabled,
    !isInteractive && styles.nonInteractive,
    sx,
  ]

  const content = (
    <>
      {hasLeading && <html.span style={styles.leadingIcon}>{leading ?? leadingIcon}</html.span>}
      <html.span style={styles.content}>
        {overline && <html.span style={styles.overline}>{overline}</html.span>}
        <html.span style={styles.label}>{children}</html.span>
        {supportingText && <html.span style={styles.supporting}>{supportingText}</html.span>}
      </html.span>
      {hasTrailing && (
        <html.span style={styles.trailing}>
          {trailingIcon ? <html.span style={styles.trailingIcon}>{trailingIcon}</html.span> : trailing}
        </html.span>
      )}
    </>
  )

  if (isInteractive) {
    return (
      <Button
        ref={ref}
        as='button'
        role='listitem'
        type='button'
        tabIndex={tabIndex ?? (disabled ? -1 : 0)}
        disabled={disabled}
        variant='text'
        onClick={onClick}
        onMouseDown={onMouseDown}
        onMouseOver={onMouseOver}
        sx={[...itemStyles, styles.interactive]}
        {...rest}>
        {content}
      </Button>
    )
  }

  return (
    <html.div ref={ref as React.Ref<HTMLDivElement>} role='listitem' style={itemStyles} {...rest}>
      {content}
    </html.div>
  )
}

const variants = css.create({
  standard: {
    color: palette.onSurface,
  },
  danger: {
    color: palette.error,
    ':hover': {
      color: palette.onErrorContainer,
    },
    ':active': {
      color: palette.onError,
    },
  },
})

const sizes = css.create({
  sm: {
    minHeight: 40,
    paddingInlineStart: spacing.padding2,
    paddingInlineEnd: spacing.padding2,
  },
  md: {
    minHeight: 48,
    paddingInlineStart: spacing.padding3,
    paddingInlineEnd: spacing.padding3,
  },
})

const styles = css.create({
  root: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.padding2,
    height: 'unset',
    width: '100%',
    textAlign: 'left',
  },
  interactive: {
    transform: {
      default: 'scale(1)',
      ':active': 'scale(0.97)',
    },
  },
  nonInteractive: {
    cursor: 'inherit',
  },
  selected: {
    backgroundColor: palette.surfaceContainer,
    ':hover': {
      backgroundColor: palette.surfaceContainerHigh,
    },
    ':active': {
      backgroundColor: palette.surfaceContainerHighest,
    },
  },
  selected$danger: {
    backgroundColor: palette.errorContainer,
    ':hover': {
      backgroundColor: palette.error,
    },
    ':active': {
      backgroundColor: palette.onError,
    },
  },
  disabled: {
    opacity: 0.38,
    cursor: 'default',
    pointerEvents: 'none',
  },
  leadingIcon: {
    display: 'inline-flex',
    flexShrink: 0,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'hidden',
  },
  label: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: typeScale.bodySize$lg,
    lineHeight: typeScale.titleLineHeight$md,
    fontWeight: typeScale.titleWeight$md,
  },
  supporting: {
    textAlign: 'left',
    maxWidth: 290,
    whiteSpace: 'pre-wrap',
    fontFamily: typeScale.bodyFont$md,
    fontSize: typeScale.bodySize$md,
    fontWeight: typeScale.bodyWeight$md,
    lineHeight: typeScale.bodyLineHeight$md,
    letterSpacing: typeScale.bodyLetterSpacing$md,
  },
  overline: {
    color: palette.onSurfaceVariant,
    fontFamily: typeScale.labelFont$sm,
    fontSize: typeScale.labelSize$sm,
    fontWeight: typeScale.labelWeight$sm,
    lineHeight: typeScale.labelLineHeight$sm,
    letterSpacing: typeScale.labelLetterSpacing$sm,
  },
  trailing: {
    display: 'inline-flex',
    alignItems: 'center',
    marginInlineStart: 'auto',
    flexShrink: 0,
  },
  trailingIcon: {
    display: 'inline-flex',
  },
})
