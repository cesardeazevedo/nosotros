import { Box, IconButton, Typography } from '@mui/material'
import { IconBolt, IconBoltOff, IconX } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import { dialogStore } from 'stores/ui/dialogs.store'
import { Row } from '../Layouts/Flex'

const iconProps = {
  strokeWidth: '1.5',
  size: 26,
}

const Camera = observer(function CameraDialog() {
  const [flash, setFlash] = useState(false)
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
        <IconButton color='inherit' onClick={dialogStore.closeCamera}>
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
})

export default Camera
