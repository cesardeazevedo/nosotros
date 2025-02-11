import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { typeScale } from '@/themes/typeScale.stylex'
import { IconSearch, IconX } from '@tabler/icons-react'
import type { BaseSyntheticEvent } from 'react'
import { useRef, type ReactNode } from 'react'
import { css, html } from 'react-strict-dom'
import { IconButton } from '../IconButton/IconButton'
import { Stack } from '../Stack/Stack'
import type { SxProps } from '../types'

type Props = {
  sx?: SxProps
  label: string
  leading?: ReactNode | false
  trailing?: ReactNode
  defaultValue?: string
  onBlur?: () => void
  onCancel?: () => void
  onChange?: (e: BaseSyntheticEvent) => void
  onKeyDown?: (e: { key: string; type: null | undefined | string }) => void
}

export const Search = (props: Props) => {
  const { sx, leading, trailing, label, defaultValue, onChange, onKeyDown, onBlur, onCancel } = props
  const ref = useRef<HTMLInputElement>(null)
  return (
    <>
      <Stack sx={[styles.root, sx]} gap={1}>
        {leading !== false ? <IconSearch size={20} {...css.props(styles.icon)} /> : null}
        <html.input
          ref={ref}
          autoFocus
          type='text'
          style={styles.input}
          placeholder={label}
          defaultValue={defaultValue}
          onBlur={onBlur}
          onChange={onChange}
          onKeyDown={onKeyDown}
        />
        {trailing || (
          <IconButton
            size='sm'
            onClick={() => {
              if (ref.current) {
                ref.current.value = ''
              }
              onCancel?.()
            }}>
            <IconX size={20} strokeWidth='1.8' />
          </IconButton>
        )}
      </Stack>
    </>
  )
}

const styles = css.create({
  root: {
    paddingInline: spacing.padding2,
    paddingRight: spacing.padding1,
    backgroundColor: palette.surfaceContainerHigh,
    borderRadius: shape.lg,
    fontSize: typeScale.bodySize$lg,
    width: '100%',
    height: '100%',
  },
  input: {
    flex: 1,
    border: 'none',
    paddingBlock: spacing.padding2,
    width: '100%',
    height: '100%',
  },
  icon: {
    opacity: 0.5,
  },
})
