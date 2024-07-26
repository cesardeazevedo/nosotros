import { Fab } from '@mui/material'
import { IconEditCircle } from '@tabler/icons-react'
import { useMobile } from 'hooks/useMobile'
import React from 'react'

const PostFab = React.memo(function PostFab() {
  const isMobile = useMobile()
  return (
    <>
      {isMobile && (
        <Fab color='info' sx={{ position: 'fixed', right: 20, bottom: 90 }}>
          <IconEditCircle size={30} strokeWidth='1.2' />
        </Fab>
      )}
    </>
  )
})

export default PostFab
