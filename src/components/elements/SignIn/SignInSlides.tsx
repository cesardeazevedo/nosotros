import { Box, Slide, styled } from '@mui/material'
import { useMobile } from 'hooks/useMobile'
import { useCallback, useEffect, useRef } from 'react'
import { OnboardMachineContext } from './SignInContext'
import SignInForm from './SignInForm'
import SignInIntro from './SignInIntro'

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

function SignInSlides() {
  const isMobile = useMobile()
  const state = OnboardMachineContext.useSelector((x) => x)
  const machine = OnboardMachineContext.useActorRef()

  const stepRef = useRef(0)
  const prevStepRef = useRef(0)

  // There might be a better way to do this with xstate
  useEffect(() => {
    const subscription = machine.subscribe((snapshot) => {
      const [, next] = Object.entries(snapshot.getMeta()).flat() as [string, { index: number }]
      prevStepRef.current = stepRef.current
      stepRef.current = next.index
    })
    return subscription.unsubscribe
  }, [machine])

  const handleDirection = useCallback((nextStep: number) => {
    const step = stepRef.current
    const prev = prevStepRef.current

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
      return 'left'
    }
    return 'left'
  }, [])

  const handleNext = useCallback(() => {
    machine.send({ type: 'next' })
  }, [machine])

  return (
    <Box
      sx={{
        position: 'relative',
        p: 4,
        pt: isMobile ? 0 : 2,
        pb: isMobile ? 4 : 2,
        height: '100%',
      }}>
      <Slide appear={false} in={state.matches('intro')} direction={handleDirection(0)} easing={easings}>
        <div>
          <SignInIntro onClickManual={handleNext} />
        </div>
      </Slide>
      <Slide unmountOnExit in={state.matches('withPubkey')} direction={handleDirection(1)} easing={easings}>
        <AbsoluteContainer>
          <SignInForm />
        </AbsoluteContainer>
      </Slide>
    </Box>
  )
}

export default SignInSlides
