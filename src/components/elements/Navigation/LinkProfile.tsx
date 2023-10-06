import { Link } from '@mui/material'
import React, { useMemo } from 'react'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { useStore } from 'stores'
import { UserState } from 'stores/nostr/user.store'

type Props = {
  user?: UserState
  children: React.ReactNode
}

function LinkProfile(props: Props) {
  const store = useStore()
  const location = useLocation()
  const to = useMemo(() => `/${props.user?.npub || store.auth.encode(props.user?.id)}`, [props.user, store])
  return (
    <Link color='inherit' component={RouterLink} to={to} state={{ from: location.pathname }}>
      {props.children}
    </Link>
  )
}

export default LinkProfile
