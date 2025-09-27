import { Button } from '@/components/ui/Button/Button'
import { Chip } from '@/components/ui/Chip/Chip'
import { Paper } from '@/components/ui/Paper/Paper'
import { PopoverBase } from '@/components/ui/Popover/PopoverBase'
import { SearchField } from '@/components/ui/Search/Search'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { normalizeRelayUrl } from '@/core/helpers/formatRelayUrl'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconPlus } from '@tabler/icons-react'
import React, { useActionState, useState } from 'react'
import { css } from 'react-strict-dom'

type Props = {
  label?: string
  icon?: React.ReactNode
  onSubmit: (relay: string) => void
}

export const RelaySelectPopover = (props: Props) => {
  const { label = 'Add Relay', icon, onSubmit } = props
  const [open, setOpen] = useState(false)
  const [error, submit] = useActionState((_: string | null, formData: FormData) => {
    const value = formData.get('relay')?.toString().trim() || ''
    const normalized = normalizeRelayUrl(value)
    try {
      const url = new URL(normalized)
      onSubmit(url.href)
      setOpen(false)
    } catch {
      return 'Enter a valid ws:// or wss:// URL'
    }

    return null
  }, null)

  return (
    <PopoverBase
      opened={open}
      onClose={() => setOpen(false)}
      placement='bottom-start'
      contentRenderer={() => (
        <Paper elevation={2} surface='surfaceContainerLow' sx={styles.paper}>
          <form action={submit}>
            <Stack gap={0.5}>
              <SearchField autoFocus={false} sx={styles.search} leading={false} placeholder='wss://' name='relay' />
              <Button variant='filled' type='submit'>
                Add
              </Button>
            </Stack>
            {error && <Text sx={styles.error}>{error}</Text>}
          </form>
        </Paper>
      )}>
      {({ setRef, getProps }) => (
        <Chip
          ref={setRef}
          {...getProps()}
          onClick={() => setOpen(true)}
          variant='input'
          label={label}
          icon={icon || <IconPlus strokeWidth='1.5' size={18} />}
        />
      )}
    </PopoverBase>
  )
}

const styles = css.create({
  paper: {
    width: 300,
    padding: spacing.padding1,
  },
  error: {
    marginLeft: spacing.margin1,
    paddingBottom: spacing.margin1,
    color: palette.error,
  },
  search: {
    height: 40,
  },
})
