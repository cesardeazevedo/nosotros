import { Link, type LinkProps } from '@mui/material'
import { Link as RouterLink, type AnyRoute, type MakeLinkOptions, type RegisteredRouter } from '@tanstack/react-router'
import { forwardRef } from 'react'

type LinkRouterProps<
  TRouteTree extends AnyRoute = RegisteredRouter['routeTree'],
  TTo extends string = '',
> = MakeLinkOptions<TRouteTree, '/', TTo> & LinkProps

const LinkRouter = forwardRef<LinkProps['ref'], LinkRouterProps>(function LinkRouter<
  TRouteTree extends AnyRoute = RegisteredRouter['routeTree'],
  TTo extends string = '',
>(props: LinkRouterProps<TRouteTree, TTo>, ref: React.Ref<LinkProps['ref']>) {
  return <Link {...props} ref={ref} component={RouterLink as React.ElementType} />
})

export default LinkRouter
