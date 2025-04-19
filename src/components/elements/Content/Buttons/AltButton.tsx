import { Chip } from '@/components/ui/Chip/Chip'
import { chipTokens } from '@/components/ui/Chip/Chip.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { useState } from 'react'
import { css, html } from 'react-strict-dom'
import type { StrictReactDOMInputProps } from 'react-strict-dom/dist/types/StrictReactDOMInputProps'

type Props = {
  value: string
  onChange: (text: string) => void
}

export const AltButton = (props: Props) => {
  const [open, setOpen] = useState(false)
  return (
    <>
      <html.div style={[styles.root, open && styles.root$open]}>
        {open && (
          <html.textarea
            autoFocus
            rows={5}
            style={styles.input}
            value={props.value}
            placeholder='Alt description'
            onChange={(e: StrictReactDOMInputProps['onChange']) => {
              props.onChange(e.currentTarget.value)
            }}
          />
        )}
      </html.div>
      <html.div style={styles.floating}>
        <Chip label='Alt' elevated variant='assist' onClick={() => setOpen((prev) => !prev)} sx={styles.chip} />
      </html.div>
    </>
  )
}

const styles = css.create({
  root: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    top: 6,
    right: 0,
    paddingInline: spacing.padding4,
    backgroundColor: 'transparent',
    zIndex: 10,
    borderRadius: shape.lg,
    transition: 'all ease 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 'auto',
    pointerEvents: 'none',
  },
  root$open: {
    pointerEvents: 'initial',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  input: {
    outline: 'none',
    resize: 'none',
    marginTop: spacing.margin4,
    pointerEvents: 'all',
    position: 'relative',
    width: '100%',
    border: 'none',
    backgroundColor: 'transparent',
    color: 'white',
  },
  floating: {
    position: 'absolute',
    left: 6,
    bottom: 6,
    zIndex: 10,
  },
  chip: {
    [chipTokens.flatContainerColor]: 'rgba(0, 0, 0, 0.8)',
    [chipTokens.labelTextColor]: 'white',
    [chipTokens.containerShape]: shape.full,
  },
})
