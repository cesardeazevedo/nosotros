import { forwardRef } from 'react'
import LinkRouter from './LinkRouter'

const LinkSignIn = forwardRef<never, Partial<typeof LinkRouter>>(function LinkSignIn(props, ref) {
  return <LinkRouter color='inherit' {...props} to='/sign_in' ref={ref} />
})

export default LinkSignIn
