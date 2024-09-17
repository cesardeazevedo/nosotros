import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { TextField } from '@/components/ui/TextField/TextField'
import { spacing } from '@/themes/spacing.stylex'
import type { TablerIconsProps } from '@tabler/icons-react'
import { IconBell, IconHome, IconSearch, IconUser } from '@tabler/icons-react'
import React, { useCallback, useState } from 'react'
import { css } from 'react-strict-dom'
import { authStore } from 'stores/ui/auth.store'
import { deckStore } from 'stores/ui/deck.store'

type Props = {
  title: string
  disabled?: boolean
  icon: (props: TablerIconsProps) => React.ReactElement
  onClick?: () => void
}

function Item(props: Props) {
  const Icon = props.icon
  return (
    <Stack horizontal={false} align='center'>
      <IconButton
        size='md'
        onClick={props.onClick}
        disabled={props.disabled}
        icon={<Icon size={28} strokeWidth='1.2' />}
      />
      <Text variant='title' size='sm'>
        {props.title}
      </Text>
    </Stack>
  )
}

function DeckNew() {
  const [author, setAuthor] = useState('')

  const handleAddProfile = useCallback(() => {
    if (author) {
      deckStore.addProfileColumn({ pubkey: author })
    }
  }, [author])

  return (
    <Stack horizontal={false} align='center' justify='center' sx={styles.root} gap={4}>
      <Text variant='headline' size='sm'>
        Choose a column type to add
      </Text>
      <Stack horizontal={false} align='center' gap={4}>
        <Stack wrap align='center' justify='center' gap={4}>
          <Item title='Home' icon={IconHome} onClick={() => deckStore.addHomeColumn()} disabled={!authStore.isLogged} />
          <Item title='User' icon={IconUser} onClick={handleAddProfile} />
          <Item title='Notifications' icon={IconBell} />
          <Item title='Search' icon={IconSearch} />
        </Stack>
        <TextField
          label='Author'
          placeholder='pubkey'
          fullWidth
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />
      </Stack>
    </Stack>
  )
}

const styles = css.create({
  root: {
    padding: spacing.padding6,
    minWidth: 500,
  },
})

export default DeckNew
