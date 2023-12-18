import { Box, Divider, Grow, IconButton, Slide, Typography, styled } from '@mui/material'
import { IconChevronLeft, IconX } from '@tabler/icons-react'
import { useMobile } from 'hooks/useMobile'
import { observer } from 'mobx-react-lite'
import { useCallback, useState } from 'react'
import { Row } from '../Layouts/Flex'
import SignInForm from './SignInForm'
import SignInIntro from './SignInIntro'

enum Steps {
  INTRO = 0,
  INPUT = 1,
  CONFIRM = 2,
}

const easings = {
  enter: 'cubic-bezier(0.33, 1, 0.68, 1)',
  exit: 'cubic-bezier(0.33, 1, 0.68, 1)',
}

const AbsoluteContainer = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 32,
  right: 32,
  bottom: 20,
  display: 'flex',
  alignContent: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  flexDirection: 'column',
})

const SignIn = observer(function AuthForm() {
  // const { auth } = useStore()
  const [prev, setPrev] = useState<Steps>(Steps.INTRO)
  const [step, setStep] = useState<Steps>(Steps.INTRO)
  const [camera, setCamera] = useState(false)
  const isMobile = useMobile()

  const handleBack = useCallback(() => {
    setPrev(step)
    setStep((prev) => Math.max(0, prev - 1))
  }, [step])

  const handleNext = useCallback(() => {
    setPrev(step)
    setStep((prev) => Math.min(2, prev + 1))
  }, [step])

  const handleCamera = useCallback(() => {
    setCamera((prev) => !prev)
  }, [])

  const handleDirection = useCallback(
    (nextStep: Steps) => {
      if (nextStep > step) {
        // If the next step is greater than the current step, move from right to left.
        return 'left'
      } else if (nextStep < step) {
        // If the next step is less than the current step, move from left to right.
        return 'right'
      } else if (nextStep === step) {
        // If the next step is the same as the current step, consider the previous step.
        if (prev < nextStep) {
          return 'left'
        } else if (prev > nextStep) {
          return 'right'
        }
      }
      return 'left'
    },
    [prev, step],
  )

  return (
    <Box sx={{ height: 'calc(100% - 70px)' }}>
      <Row sx={{ p: 2, justifyContent: 'center', height: 64 }}>
        <Box sx={{ width: 38, height: 38 }}>
          <Grow in={!camera && step > Steps.INTRO} easing={easings}>
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
      {!isMobile && <Divider />}
      <Box
        sx={{
          position: 'relative',
          p: 4,
          pt: isMobile ? 0 : 2,
          pb: isMobile ? 4 : 2,
          height: '100%',
        }}>
        <Slide appear={false} in={step === Steps.INTRO} direction={handleDirection(Steps.INTRO)} easing={easings}>
          <SignInIntro onClickManual={handleNext} />
        </Slide>
        <Slide unmountOnExit in={step === Steps.INPUT} direction={handleDirection(Steps.INPUT)} easing={easings}>
          <AbsoluteContainer>
            <SignInForm />
          </AbsoluteContainer>
        </Slide>
      </Box>
    </Box>
  )
})

export default SignIn
