import { pageAtom, slideDirectionAtom } from '@/atoms/signin.atoms'
import { Slide } from '@/components/ui/Slide/Slide'
import { useAtomValue } from 'jotai'
import { useRef } from 'react'
import { css, html } from 'react-strict-dom'
import { SignInNostrConnect } from './SignInNostrConnect'
import { SignInNostrExtension } from './SignInNostrExtension'
import { SignInReadOnly } from './SignInReadOnly'
import { SignInRemoteSigner } from './SignInRemoteSigner'
import { SignInSelect } from './SignInSelect'

const easing = {
  enter: 'cubic-bezier(0.33, 1, 0.68, 1)',
  exit: 'cubic-bezier(0.33, 1, 0.68, 1)',
}

export const SignInSlides = () => {
  const ref = useRef<HTMLDivElement | null>(null)
  const current = useAtomValue(pageAtom)
  const direction = useAtomValue(slideDirectionAtom)

  const props = {
    container: ref.current,
    style: { height: '100%' },
    easing,
  }

  const is = (name: typeof current) => current === name

  return (
    <html.div style={styles.root} ref={ref}>
      <Slide {...props} appear={false} in={is('SELECT')} direction={direction('SELECT')}>
        <html.div style={styles.wrapper}>
          <SignInSelect />
        </html.div>
      </Slide>
      <Slide {...props} in={is('READ_ONLY')} direction={direction('READ_ONLY')}>
        <html.span style={styles.container}>
          <SignInReadOnly />
        </html.span>
      </Slide>
      <Slide {...props} in={is('NOSTR_EXTENSION')} direction={direction('NOSTR_EXTENSION')}>
        <html.div style={styles.container}>
          <SignInNostrExtension />
        </html.div>
      </Slide>
      <Slide {...props} in={is('REMOTE_SIGN')} direction={direction('REMOTE_SIGN')}>
        <html.div style={styles.container}>
          <SignInRemoteSigner />
        </html.div>
      </Slide>
      <Slide {...props} in={is('REMOTE_SIGN_NOSTR_CONNECT')} direction={direction('REMOTE_SIGN_NOSTR_CONNECT')}>
        <html.div style={styles.container}>{is('REMOTE_SIGN_NOSTR_CONNECT') && <SignInNostrConnect />}</html.div>
      </Slide>
    </html.div>
  )
}

const styles = css.create({
  root: {
    position: 'relative',
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
