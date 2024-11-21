import { Divider } from '@/components/ui/Divider/Divider'
import { useMobile } from 'hooks/useMobile'
import { css, html } from 'react-strict-dom'
import { OnboardMachineContext } from './SignInContext'
import { SignInHeader } from './SignInHeader'
import { SignInSlides } from './SignInSlides'

export const SignIn = () => {
  const isMobile = useMobile()
  return (
    <OnboardMachineContext.Provider>
      <html.div style={styles.root}>
        <SignInHeader />
        {!isMobile && <Divider />}
        <SignInSlides />
      </html.div>
    </OnboardMachineContext.Provider>
  )
}

const styles = css.create({
  root: {
    height: 'calc(100% - 70px)',
    overflow: 'hidden',
  },
})
