import { Fab } from '@mui/material'
import { IconPlus } from '@tabler/icons-react'
import { useMobile } from 'hooks/useMobile'
import React from 'react'

const PostFab = React.memo(function PostFab() {
  const isMobile = useMobile()
  return (
    <>
      {isMobile && (
        <Fab color='info' sx={{ position: 'fixed', right: 20, bottom: 90 }}>
          <IconPlus size={30} strokeWidth='1.5' />
        </Fab>
      )}
    </>
  )
})

export default PostFab
