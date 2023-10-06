import { Box, IconButton, Typography } from '@mui/material'
import { IconBolt, IconBoltOff, IconX } from '@tabler/icons-react'
import { useState } from 'react'
import { useStore } from 'stores'
import { Row } from '../Layouts/Flex'

const iconProps = {
  strokeWidth: '1.5',
  size: 26,
}

function CameraDialog() {
  const [flash, setFlash] = useState(false)
  const store = useStore()
  return (
    <Box
      sx={{
        position: 'relative',
        backgroundColor: '#000',
        width: '100%',
        height: '100%',
        color: 'white',
      }}>
      <Row sx={{ p: 2, justifyContent: 'space-between' }}>
        <IconButton color='inherit' onClick={store.dialogs.closeCamera}>
          <IconX {...iconProps} />
        </IconButton>
        <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
          CAMERA
        </Typography>
        <IconButton color='inherit' onClick={() => setFlash(!flash)}>
          {flash ? <IconBolt {...iconProps} /> : <IconBoltOff {...iconProps} />}
        </IconButton>
      </Row>
    </Box>
  )
}

export default CameraDialog
