import type { Props } from './LinkRouter'
import LinkRouter from './LinkRouter'

const LinkSignIn = function LinkSignIn(props: Props) {
  return (
    <LinkRouter {...props} to='/sign_in'>
      {props.children}
    </LinkRouter>
  )
}

export default LinkSignIn
