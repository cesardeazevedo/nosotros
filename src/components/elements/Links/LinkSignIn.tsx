import type { LinkProps } from '@tanstack/react-router'
import { Link, useRouter } from '@tanstack/react-router'

export const LinkSignIn = function LinkSignIn(props: LinkProps) {
  const router = useRouter()
  return (
    <Link
      {...props}
      search={{ sign_in: true }}
      // @ts-ignore
      from={router.fullPath}
      // @ts-ignore
      state={{ from: router.latestLocation.pathname }}>
      {props.children}
    </Link>
  )
}
