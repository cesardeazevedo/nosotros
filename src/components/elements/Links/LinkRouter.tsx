import { Link, LinkProps } from '@mui/material'
import { AnyRoute, MakeLinkOptions, RegisteredRouter, Link as RouterLink } from '@tanstack/react-router'
import { forwardRef } from 'react'

export type LinkRouterProps<
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
