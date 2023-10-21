import { Link } from '@mui/material'
import React from 'react'
import { Link as RouterLink, useLocation } from 'react-router-dom'

type Props = {
  children: React.ReactElement
}

function LinkSignIn(props: Props) {
  const location = useLocation()
  return (
    <Link color='inherit' component={RouterLink} to='/sign_in' state={{ from: location.pathname }}>
      {props.children}
    </Link>
  )
}

export default LinkSignIn
