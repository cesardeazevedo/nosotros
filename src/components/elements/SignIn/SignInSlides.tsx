import Slide from '@/components/ui/Slide/Slide'
import { Stack } from '@/components/ui/Stack/Stack'
import { spacing } from '@/themes/spacing.stylex'
import { useCallback, useEffect, useRef } from 'react'
import { css, html } from 'react-strict-dom'
import { OnboardMachineContext } from './SignInContext'
import SignInForm from './SignInForm'
import SignInIntro from './SignInIntro'

const easings = {
  enter: 'cubic-bezier(0.33, 1, 0.68, 1)',
  exit: 'cubic-bezier(0.33, 1, 0.68, 1)',
}

function SignInSlides() {
  //const isMobile = useMobile()
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
    <html.div style={styles.root} id='asd'>
      <Slide
        style={{ height: '100%' }}
        appear={false}
        in={state.matches('intro')}
        direction={handleDirection(0)}
        easing={easings}>
        <Stack horizontal={false} sx={styles.wrapper}>
          <SignInIntro onClickManual={handleNext} />
        </Stack>
      </Slide>
      <Slide
        style={{ height: '100%' }}
        // unmountOnExit
        in={state.matches('withPubkey')}
        direction={handleDirection(1)}
        easing={easings}>
        <html.div style={styles.container}>
          <SignInForm />
        </html.div>
      </Slide>
    </html.div>
  )
}

const styles = css.create({
  root: {
    position: 'relative',
    padding: spacing.padding4,
    height: '100%',
  },
  wrapper: {
    color: 'red',
    height: '100%',
  },
  container: {
    position: 'absolute',
    top: 20,
    left: 0,
    padding: spacing.padding4,
    right: 0,
    bottom: 10,
    display: 'flex',
    alignContent: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    flexDirection: 'column',
    width: '100%',
  },
  slide: {
    height: '100%',
  },
})

export default SignInSlides
