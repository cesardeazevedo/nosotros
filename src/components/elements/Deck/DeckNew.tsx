import { Box, IconButton, TextField, Typography } from '@mui/material'
import type { TablerIconsProps } from '@tabler/icons-react'
import { IconBell, IconHome, IconSearch, IconUser } from '@tabler/icons-react'
import React, { useState } from 'react'
import { authStore } from 'stores/ui/auth.store'
import { deckStore } from 'stores/ui/deck.store'
import { Row } from '../Layouts/Flex'

type Props = {
  title: string
  disabled?: boolean
  icon: (props: TablerIconsProps) => React.ReactElement
  onClick?: () => void
}

function Item(props: Props) {
  const Icon = props.icon
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mx: 2 }}>
      <IconButton color='info' onClick={props.onClick} disabled={props.disabled}>
        <Icon size={40} strokeWidth='1.2' />
      </IconButton>
      <Typography variant='subtitle2' sx={{ mt: -1 }}>
        {props.title}
      </Typography>
    </Box>
  )
}

function DeckNew() {
  const [author, setAuthor] = useState('')

  return (
    <>
      <Box sx={{ py: 4, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <Typography variant='h6' sx={{ py: 4 }}>
          Choose a column type to add
        </Typography>
        <Box sx={{ py: 2 }}>
          <Row sx={{ justifyContent: 'space-between' }}>
            <Item
              title='Home'
              icon={IconHome}
              onClick={() => deckStore.addHomeColumn()}
              disabled={!authStore.isLogged}
            />
            <Item title='User' icon={IconUser} onClick={() => deckStore.addProfileColumn({ pubkey: author })} />
            <Item title='Notifications' icon={IconBell} />
            <Item title='Search' icon={IconSearch} />
          </Row>
          <TextField
            variant='outlined'
            label='Author'
            placeholder='pubkey'
            fullWidth
            sx={{ mt: 4 }}
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
        </Box>
      </Box>
    </>
  )
}

export default DeckNew
