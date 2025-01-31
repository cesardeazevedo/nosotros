import type { LinkProps } from '@tanstack/react-router'
import { Link, useRouter } from '@tanstack/react-router'

export const LinkSignIn = function LinkSignIn(props: LinkProps) {
  const router = useRouter()
  return (
    <Link {...props} to='.' search={{ sign_in: true }} state={{ from: router.latestLocation.pathname } as never}>
      {props.children}
    </Link>
  )
}
