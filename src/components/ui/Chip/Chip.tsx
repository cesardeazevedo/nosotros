import { elevation } from '@/themes/elevation.stylex'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { state } from '@/themes/state.stylex'
import { IconCheck, IconX } from '@tabler/icons-react'
import React, { forwardRef } from 'react'
import { css, html } from 'react-strict-dom'
import type { StrictReactDOMProps } from 'react-strict-dom/dist/types/StrictReactDOMProps'
import { Avatar } from '../Avatar/Avatar'
import { avatarTokens } from '../Avatar/Avatar.stylex'
import { buttonTokens } from '../Button/Button.stylex'
import { ButtonBase } from '../ButtonBase/ButtonBase'
import { Elevation } from '../Elevation/Elevation'
import { elevationTokens } from '../Elevation/Elevation.stylex'
import { FocusRing } from '../FocusRing/FocusRing'
import { focusRingTokens } from '../FocusRing/FocusRing.stylex'
import { dataProps } from '../helpers/dataProps'
import { mergeRefs } from '../helpers/mergeRefs'
import { useVisualState } from '../hooks/useVisualState'
import { CircularProgress } from '../Progress/CircularProgress'
import { Ripple } from '../Ripple/Ripple'
import type { SxProps } from '../types'
import { chipTokens } from './Chip.stylex'

type ChipVariants = 'assist' | 'filter' | 'input' | 'suggestion'

export type Props = {
  sx?: SxProps
  variant?: ChipVariants
  avatarUrl?: string
  href?: string
  icon?: React.ReactNode
  trailingIcon?: React.ReactNode
  label: string | React.ReactNode
  selected?: boolean
  elevated?: boolean
  disabled?: boolean
  loading?: boolean
  onClick?: StrictReactDOMProps['onClick']
  onDelete?: StrictReactDOMProps['onClick']
  onTrailingClick?: StrictReactDOMProps['onClick']
}

export const Chip = forwardRef<HTMLButtonElement, Props>(function Chip(props, ref) {
  const {
    sx,
    variant = 'assist',
    label,
    icon,
    trailingIcon,
    selected,
    disabled = false,
    loading = false,
    avatarUrl,
    onClick,
    onDelete,
    onTrailingClick,
  } = props
  const hasIcon = !!avatarUrl || !!icon
  const elevated = variant !== 'input' && !!props.elevated
  const isInput = variant === 'input'
  const isFilter = variant === 'filter'
  const isDeletable = (isFilter || isInput) && onDelete
  const hasLeading = loading || selected || hasIcon
  const hasTrailing = !!trailingIcon || onDelete
  const { visualState, setRef } = useVisualState(undefined, { disabled })
  const refs = mergeRefs([setRef, ref])

  const containerStyle = (
    selected
      ? elevated
        ? 'elevatedContainerSelected'
        : 'flatContainerSelected'
      : elevated
        ? 'elevatedContainer'
        : 'flatContainer'
  ) as keyof Pick<
    typeof styles,
    'elevatedContainerSelected' | 'flatContainerSelected' | 'flatContainer' | 'elevatedContainer'
  >

  return (
    <html.div style={[styles.root, sx]}>
      <html.div
        {...dataProps(visualState)}
        style={[styles.container, styles[containerStyle], disabled && styles.disabled]}>
        {!!elevated && <Elevation sx={styles.elevation} />}
        {!elevated && !selected && <html.div style={styles.outline} />}
        <FocusRing visualState={visualState} />
        {!disabled && <Ripple visualState={visualState} />}
        <html.button
          disabled={disabled}
          ref={refs}
          onClick={onClick}
          style={[styles.action, disabled && styles.action$disabled]}>
          {hasLeading ? (
            <html.div style={styles.leading}>
              {loading ? (
                <CircularProgress size='xs' disabled={disabled} />
              ) : selected ? (
                <IconCheck size={16} strokeWidth='2.5' />
              ) : avatarUrl ? (
                <Avatar size='sm' src={avatarUrl} sx={styles.avatar} />
              ) : icon ? (
                icon
              ) : null}
            </html.div>
          ) : (
            <html.div style={styles.leading} />
          )}
          {label && <html.div style={styles.label}>{label}</html.div>}
        </html.button>
        {hasTrailing ? (
          <>
            {!!onDelete || !!onTrailingClick ? (
              <ButtonBase
                tabIndex={-1}
                disabled={disabled}
                sx={[styles.action$trailing, disabled && styles.action$disabled]}
                onClick={onDelete || onTrailingClick}>
                {isDeletable ? <IconX size={16} /> : trailingIcon}
              </ButtonBase>
            ) : (
              <html.span style={[styles.action$trailing, styles.label]}>{trailingIcon}</html.span>
            )}
          </>
        ) : null}
      </html.div>
    </html.div>
  )
})

const styles = css.create({
  root: {
    borderRadius: chipTokens.containerShape,
    display: 'inline-flex',
    height: chipTokens.containerHeight,
    minHeight: chipTokens.containerHeight,
    minWidth: 32,
    cursor: 'pointer',
    [focusRingTokens.shape]: chipTokens.containerShape,
    [chipTokens.flatContainerColor]: palette.surfaceContainerLow,
    [chipTokens.selectedFlatContainerColor]: palette.secondaryContainer,
  },
  elevation: {
    [elevationTokens.boxShadow]: chipTokens.elevation,
  },
  outline: {
    inset: 0,
    borderRadius: 'inherit',
    position: 'absolute',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: buttonTokens.outlineColor,
    [buttonTokens.outlineColor]: palette.outlineVariant,
  },
  container: {
    borderRadius: 'inherit',
    display: 'flex',
    alignItems: 'center',
    height: '100%',
    position: 'relative',
    width: '100%',
    paddingInlineStart: chipTokens.leadingSpace,
    paddingInlineEnd: chipTokens.trailingSpace,
    '::before': {
      borderRadius: 'inherit',
      content: '',
      inset: 0,
      position: 'absolute',
      backgroundColor: chipTokens.flatContainerColor,
    },
  },
  disabled: {
    cursor: 'default',
    [chipTokens.elevation]: elevation.shadows0,
    '::before': {
      backgroundColor: palette.onSurface,
      opacity: state.containerOpacity$disabled,
    },
  },
  flatContainer: {},
  elevatedContainer: {
    [chipTokens.elevation]: {
      default: chipTokens.elevatedContainerElevation,
      ':is([data-focused])': chipTokens.elevatedContainerElevation$focus,
      ':is([data-hovered])': chipTokens.elevatedContainerElevation$hover,
      ':is([data-pressed])': chipTokens.elevatedContainerElevation$pressed,
    },
  },
  elevatedContainerSelected: {
    [chipTokens.elevation]: chipTokens.selectedElevatedContainerElevation,
    '::before': {
      backgroundColor: chipTokens.selectedFlatContainerColor,
    },
  },
  flatContainerSelected: {
    '::before': {
      backgroundColor: palette.secondaryContainer,
    },
  },
  flatContainerSelected$interactive: {},
  action: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    appearance: 'none',
    backgroundColor: 'unset',
    borderStyle: 'unset',
    borderRadius: 'inherit',
    outline: 'none',
    padding: 0,
    position: 'relative',
    textDecoration: 'none',
    cursor: 'inherit',
    height: '100%',
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
    gap: spacing.padding1,
    // paddingInlineStart: chipTokens.leadingSpace,
    // paddingInlineEnd: chipTokens.trailingSpace,
  },
  action$interactive: {},
  action$leading: {},
  action$trailing: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: chipTokens.iconColor,
    userSelect: 'none',
    zIndex: 1,
    //color: chipTokens.trailingIcon,
    textAlign: 'center',
    flexGrow: 0,
    flexShrink: 0,
    borderRadius: shape.full,
    width: 24,
    height: 24,
  },
  action$disabled: {
    color: palette.onSurface,
    opacity: state.opacity$disabled,
  },
  leading: {
    position: 'relative',
    color: chipTokens.iconColor,
  },
  avatar: {
    [avatarTokens.containerSize]: '20px',
  },
  label: {
    fontFamily: chipTokens.labelTextFont,
    fontSize: chipTokens.labelTextSize,
    lineHeight: chipTokens.labelTextLineHeight,
    letterSpacing: chipTokens.labelTextLetterSpacing,
    fontWeight: chipTokens.labelTextWeight,
    color: chipTokens.labelTextColor,
    paddingInlineEnd: spacing.padding1,
    // paddingInlineStart: chipTokens.leadingSpace,
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    flex: 1,
    whiteSpace: 'nowrap',
    maxWidth: 210,
    overflow: 'clip',
    textOverflow: 'ellipsis',
  },
})
