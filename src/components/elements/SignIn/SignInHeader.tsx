import { Box, Grow, IconButton, Typography } from '@mui/material'
import { IconChevronLeft, IconX } from '@tabler/icons-react'
import { useMobile } from 'hooks/useMobile'
import { useCallback } from 'react'
import { Row } from '../Layouts/Flex'
import { OnboardMachineContext } from './SignInContext'

const easings = {
  enter: 'cubic-bezier(0.33, 1, 0.68, 1)',
  exit: 'cubic-bezier(0.33, 1, 0.68, 1)',
}

function SignInHeader() {
  const machine = OnboardMachineContext.useActorRef()
  const state = OnboardMachineContext.useSelector((x) => x)
  const camera = OnboardMachineContext.useSelector((x) => x.context.camera)

  const isMobile = useMobile()

  const handleBack = useCallback(() => {
    machine.send({ type: 'back' })
  }, [machine])

  const handleCamera = useCallback(() => {
    //
  }, [])

  return (
    <Row sx={{ p: 2, justifyContent: 'center', height: 64 }}>
      <Box sx={{ width: 38, height: 38 }}>
        <Grow in={!camera && !state.matches('intro')} easing={easings}>
          <IconButton
            size='small'
            onClick={handleBack}
            sx={{ position: 'absolute', left: 16, color: 'text.primary', transitionDuration: '250ms!important' }}>
            <IconChevronLeft size={28} strokeWidth='2.5' />
          </IconButton>
        </Grow>
        <Grow in={camera} easing={easings}>
          <IconButton
            size='small'
            onClick={handleCamera}
            sx={{ position: 'absolute', left: 16, color: 'text.primary', transitionDuration: '250ms!important' }}>
            <IconX size={28} strokeWidth='2.0' />
          </IconButton>
        </Grow>
      </Box>
      <Typography variant='h6' sx={{ flex: 1, textAlign: 'center', mr: 6 }}>
        {!isMobile ? 'Sign In' : camera ? 'Camera' : ''}
      </Typography>
    </Row>
  )
}

export default SignInHeader
