import { lazy, Suspense } from 'react'
import type { ReactNode } from 'react'

type Props = {
  delay?: number | { open?: number; close?: number }
  timeoutMs?: number
  children: ReactNode
}

const FloatingDelayGroupInternal = lazy(async () => {
  const mod = await import('@floating-ui/react')
  const Component = (props: Props) => (
    <mod.FloatingDelayGroup delay={props.delay ?? 0} timeoutMs={props.timeoutMs}>
      {props.children}
    </mod.FloatingDelayGroup>
  )
  return { default: Component }
})

export const FloatingDelayGroupLazy = (props: Props) => {
  return (
    <Suspense fallback={props.children}>
      <FloatingDelayGroupInternal {...props} />
    </Suspense>
  )
}
