import { LinkProps } from '@mui/material'
import React, { forwardRef } from 'react'
import LinkRouter from './LinkRouter'

interface Props extends LinkProps {
  children: React.ReactElement
}

const LinkSignIn = forwardRef(function LinkSignIn(props: Props, ref: React.Ref<LinkProps['ref']>) {
  return <LinkRouter {...props} color='inherit' to='/sign_in' state={{ from: location.pathname }} ref={ref} />
})

export default LinkSignIn
