import { Box, IconButton, InputBase } from '@mui/material'
import { IconCaretDown, IconSearch } from '@tabler/icons-react'
import ComingSoon from '../Layouts/ComingSoon'

function Search() {
  return (
    <Box sx={{ position: 'relative', backgroundColor: 'divider', borderRadius: 1 }}>
      <ComingSoon />
      <InputBase
        fullWidth
        placeholder='Search on Nostr'
        sx={{ height: 44, p: 1 }}
        startAdornment={
          <IconButton size='small' sx={{ mr: 1 }}>
            <IconSearch size={20} />
          </IconButton>
        }
        endAdornment={
          <IconButton size='small' sx={{ opacity: 0.6, color: 'text.primary' }}>
            <IconCaretDown color='inherit' fill='currentColor' size={18} />
          </IconButton>
        }
      />
    </Box>
  )
}

export default Search
