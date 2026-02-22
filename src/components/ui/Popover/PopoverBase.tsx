import { forwardRef, lazy, Suspense } from 'react'
import type { IPopoverBaseProps, IPopoverBaseTriggerRendererProps } from './PopoverBase.types'

const PopoverBaseInternal = lazy(async () =>
  import('./PopoverBaseLazy').then((m) => ({ default: m.PopoverBaseLazy })),
)

const noop = () => {}

const renderTriggerFallback = (children: IPopoverBaseProps['children']) => {
  if (typeof children === 'function') {
    const props: IPopoverBaseTriggerRendererProps = {
      opened: false,
      placement: 'top',
      open: noop,
      close: noop,
      setRef: null,
      getProps: () => ({}),
    }
    return children(props)
  }
  return children ?? null
}

export const PopoverBase = forwardRef<HTMLDivElement, IPopoverBaseProps>(function PopoverBase(props, forwardedRef) {
  return (
    <Suspense fallback={renderTriggerFallback(props.children)}>
      <PopoverBaseInternal {...props} ref={forwardedRef} />
    </Suspense>
  )
})
