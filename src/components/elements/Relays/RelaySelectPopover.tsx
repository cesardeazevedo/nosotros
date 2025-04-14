import { Button } from '@/components/ui/Button/Button'
import { Chip } from '@/components/ui/Chip/Chip'
import { Paper } from '@/components/ui/Paper/Paper'
import { PopoverBase } from '@/components/ui/Popover/PopoverBase'
import { SearchField } from '@/components/ui/Search/Search'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconPlus } from '@tabler/icons-react'
import type { BaseSyntheticEvent } from 'react'
import React, { useCallback, useState } from 'react'
import { css } from 'react-strict-dom'

type Props = {
  label?: string
  icon?: React.ReactNode
  onSubmit: (relay: string) => void
}

export const RelaySelectPopover = (props: Props) => {
  const { label = 'Add Relay', icon, onSubmit } = props
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')

  const handleChange = useCallback((e: BaseSyntheticEvent) => {
    setError('')
    setQuery(e.target.value)
  }, [])

  const handleSubmit = useCallback(() => {
    try {
      const url = new URL(query)
      onSubmit(url.href)
      setOpen(false)
    } catch (error) {
      console.log('error', error)
      setError('Invalid url')
    }
  }, [query])

  return (
    <>
      <PopoverBase
        opened={open}
        onClose={() => setOpen(false)}
        placement='bottom-start'
        contentRenderer={() => (
          <Paper elevation={2} surface='surfaceContainerLow' sx={styles.paper}>
            <Stack gap={0.5}>
              <SearchField
                sx={styles.search}
                leading={false}
                placeholder='wss://'
                onChange={handleChange}
                onCancel={() => setQuery('')}
              />
              <Button variant='filled' onClick={handleSubmit}>
                Add
              </Button>
            </Stack>
            {error && <Text sx={styles.error}>{error}</Text>}
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
    </>
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
