import { css, html } from 'react-strict-dom'
import { SignInSlides } from './SignInSlides'

export const SignIn = () => {
  return (
    <html.div style={styles.root}>
      <SignInSlides />
    </html.div>
  )
}

const styles = css.create({
  root: {
    height: 'calc(100% - 70px)',
    overflow: 'hidden',
  },
})
