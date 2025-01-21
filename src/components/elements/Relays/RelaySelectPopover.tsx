import { Button } from '@/components/ui/Button/Button'
import { Chip } from '@/components/ui/Chip/Chip'
import { Divider } from '@/components/ui/Divider/Divider'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Paper } from '@/components/ui/Paper/Paper'
import { PopoverBase } from '@/components/ui/Popover/PopoverBase'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { TextField } from '@/components/ui/TextField/TextField'
import { spacing } from '@/themes/spacing.stylex'
import { IconBroadcast, IconX } from '@tabler/icons-react'
import React, { useCallback, useState } from 'react'
import { css, html } from 'react-strict-dom'
import { SearchRelays } from '../Search/SearchRelays'

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

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setError('')
    setQuery(e.target.value)
  }, [])

  const handleSelect = useCallback((relay: string) => {
    setQuery(relay)
    setError('')
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
            <Stack justify='space-between' sx={styles.header}>
              <Text variant='label' size='lg'>
                Relays
              </Text>
              <IconButton size='sm' onClick={() => setOpen(false)} icon={<IconX size={18} />} />
            </Stack>
            <html.div style={styles.content}>
              <TextField
                size='sm'
                shrink
                fullWidth
                error={!!error}
                label='Search or add a relay'
                placeholder='wss://'
                value={query}
                onChange={handleChange}
                trailing={
                  <IconButton size='sm' onClick={() => setQuery('')}>
                    <IconX size={18} />
                  </IconButton>
                }
              />
              {error && <Text>{error}</Text>}
            </html.div>
            <Divider />
            <Stack gap={0.5} horizontal={false} sx={styles.content} align='flex-start'>
              <SearchRelays query={query} onSelect={handleSelect} />
            </Stack>
            <Divider />
            <Stack horizontal={false} sx={styles.actions} align='flex-end'>
              <Button onClick={handleSubmit}>Add</Button>
            </Stack>
          </Paper>
        )}>
        {({ setRef, getProps }) => (
          <Chip
            ref={setRef}
            {...getProps()}
            onClick={() => setOpen(true)}
            variant='input'
            label={label}
            icon={icon || <IconBroadcast strokeWidth='1.5' size={18} />}
          />
        )}
      </PopoverBase>
    </>
  )
}

const styles = css.create({
  paper: {
    width: 280,
  },
  header: {
    paddingBlock: spacing.padding1,
    paddingInline: spacing.padding2,
  },
  input: {
    padding: spacing.padding1,
  },
  content: {
    padding: spacing.padding1,
    maxHeight: 250,
    overflowY: 'auto',
  },
  actions: {
    padding: spacing.padding1,
  },
})
