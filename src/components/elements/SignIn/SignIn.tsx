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
    height: '100%',
    overflowX: 'hidden',
    overflowY: 'scroll',
  },
})
