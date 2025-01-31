import { useContentContext } from '@/components/providers/ContentProvider'
import { Link, type LinkProps } from '@tanstack/react-router'
import type { ReactNode } from 'react'

export const LinkBase = function LinkBase(props: LinkProps & { children: ReactNode }) {
  const { children, ...rest } = props
  const { disableLink } = useContentContext()
  // We don't wanna render a <a> if the link is disabled
  return props.disabled || disableLink ? <>{children}</> : <Link {...rest}>{children}</Link>
}
