import { Slide } from '@/components/ui/Slide/Slide'
import { signinStore } from '@/stores/signin/signin.store'
import { observer } from 'mobx-react-lite'
import { useRef } from 'react'
import { css, html } from 'react-strict-dom'
import { SignInNostrExtension } from './SignInNostrExtension'
import { SignInReadOnly } from './SignInReadOnly'
import { SignInRemoteSigner } from './SignInRemoteSigner'
import { SignInSelect } from './SignInSelect'

const easing = {
  enter: 'cubic-bezier(0.33, 1, 0.68, 1)',
  exit: 'cubic-bezier(0.33, 1, 0.68, 1)',
}

export const SignInSlides = observer(function SignInSlides() {
  const ref = useRef<HTMLDivElement | null>(null)
  const props = {
    container: ref.current,
    style: { height: '100%' },
    easing,
  }
  return (
    <html.div style={styles.root} ref={ref}>
      <Slide
        {...props}
        appear={false}
        in={signinStore.matches('SELECT')}
        direction={signinStore.getSlideDirection('SELECT')}>
        <html.div style={styles.wrapper}>
          <SignInSelect />
        </html.div>
      </Slide>
      <Slide {...props} in={signinStore.matches('READ_ONLY')} direction={signinStore.getSlideDirection('READ_ONLY')}>
        <html.span style={styles.container}>
          <SignInReadOnly />
        </html.span>
      </Slide>
      <Slide
        {...props}
        in={signinStore.matches('NOSTR_EXTENSION')}
        direction={signinStore.getSlideDirection('NOSTR_EXTENSION')}>
        <html.div style={styles.container}>
          <SignInNostrExtension />
        </html.div>
      </Slide>
      <Slide
        {...props}
        in={signinStore.matches('REMOTE_SIGN')}
        direction={signinStore.getSlideDirection('REMOTE_SIGN')}>
        <html.div style={styles.container}>
          <SignInRemoteSigner />
        </html.div>
      </Slide>
    </html.div>
  )
})

const styles = css.create({
  root: {
    position: 'relative',
    height: '100%',
  },
  wrapper: {
    position: 'relative',
    height: '100%',
  },
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
  },
})
