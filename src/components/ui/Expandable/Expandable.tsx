import { duration } from '@/themes/duration.stylex'
import { easing } from '@/themes/easing.stylex'
import { useMergeRefs } from '@floating-ui/react'
import { forwardRef, useRef } from 'react'
import { css, html } from 'react-strict-dom'
import { Transition } from 'react-transition-group'
import { useControlledValue } from '../hooks/useControlledValue'
import type { ISize } from '../hooks/useElementSize'
import { useElementSize } from '../hooks/useElementSize'
import { ExpandableContext, type IExpandableContextValue } from './Expandable.context'

export type ICssSizeValue = number | string

type IExpandableTriggerRenderProps = {
  expand: (expanded: boolean) => void
  disabled?: boolean
  expanded?: boolean
}

type Props = Omit<IExpandableContextValue, 'expand'> & {
  trigger?: React.ReactNode | ((renderProps: IExpandableTriggerRenderProps) => React.ReactNode)
  children?: React.ReactNode
  onChange?: (expanded: boolean) => void
  collapsedSize?: ICssSizeValue
}

export const Expandable = forwardRef<HTMLDivElement, Props>(function Expandable(props, forwardedRef) {
  const {
    trigger,
    children,
    onChange,
    disabled,
    expanded: expandedProp,
    defaultExpanded: defaultExpandedProp,
    initiallyExpanded: initiallyExpandedProp,
    orientation = 'vertical',
    collapsedSize: collapsedSizeProp = 0,
    ...other
  } = props

  const initiallyExpandedRef = useRef(initiallyExpandedProp)
  const defaultExpanded = initiallyExpandedRef.current ?? defaultExpandedProp
  const [expanded, setExpanded] = useControlledValue({
    controlled: expandedProp,
    default: !!defaultExpanded,
    name: 'Expandable',
  })
  const transitionNodeRef = useRef<HTMLDivElement>(null)
  const contentWrapperRef = useRef<HTMLDivElement>(null)
  const transitionNodeHandleRef = useMergeRefs([transitionNodeRef, contentWrapperRef, forwardedRef])
  const contentSize = useElementSize({
    ref: contentWrapperRef,
    observe: true,
    orientation,
  })

  const transitionProperty = orientation === 'horizontal' ? 'width opacity' : 'height opacity'
  const collapsedSize: Partial<ISize<ICssSizeValue>> =
    orientation === 'horizontal' ? { width: collapsedSizeProp } : { height: collapsedSizeProp }
  const expandedSize: Partial<ISize<ICssSizeValue>> =
    orientation === 'horizontal' ? { width: contentSize?.width } : { height: contentSize?.height }

  const expand = (expanded: boolean): void => {
    setExpanded(expanded)
    onChange?.(expanded)
  }
  const triggerElement =
    typeof trigger === 'function'
      ? trigger({
          expand,
          expanded,
          disabled,
        })
      : trigger

  const context: IExpandableContextValue = {
    expand,
    disabled,
    expanded,
    defaultExpanded,
    orientation,
  }

  return (
    <ExpandableContext.Provider value={context}>
      {triggerElement}
      <Transition nodeRef={transitionNodeRef} in={expanded} timeout={650}>
        {(status) => (
          <html.div
            style={[
              styles.content(expandedSize),
              status === 'exited'
                ? styles.animation$exited(collapsedSize)
                : status === 'entering'
                  ? styles.animation$entering(expandedSize, transitionProperty)
                  : status === 'entered'
                    ? styles.animation$entered(expandedSize)
                    : status === 'exiting'
                      ? styles.animation$exiting(collapsedSize, transitionProperty)
                      : undefined,
              expanded && status === 'entered' && styles.content$expanded,
            ]}>
            <div {...other} aria-expanded={expanded} style={{ overflow: 'hidden' }} ref={transitionNodeHandleRef}>
              {status !== 'exited' && children}
            </div>
          </html.div>
        )}
      </Transition>
    </ExpandableContext.Provider>
  )
})

const styles = css.create({
  content: (expandedSize: Partial<ISize<ICssSizeValue>>) => ({
    overflow: 'hidden',
    width: expandedSize.width,
    height: expandedSize.height,
  }),
  content$expanded: {
    overflow: 'hidden',
  },
  animation$entering: (expandedSize: Partial<ISize<ICssSizeValue>>, transitionProperty: string) => ({
    opacity: 1,
    width: expandedSize.width,
    height: expandedSize.height,
    transitionProperty,
    transitionDuration: duration.short4,
    transitionTimingFunction: easing.emphasizedDecelerate,
  }),
  animation$entered: (expandedSize: Partial<ISize<ICssSizeValue>>) => ({
    opacity: 1,
    width: expandedSize.width,
    height: expandedSize.height,
  }),
  animation$exiting: (collapsedSize: Partial<ISize<ICssSizeValue>>, transitionProperty: string) => ({
    opacity: 0,
    width: collapsedSize.width,
    height: collapsedSize.height,
    transitionProperty,
    transitionDuration: duration.short4,
    transitionTimingFunction: easing.emphasizedDecelerate,
  }),
  animation$exited: (size: Partial<ISize<ICssSizeValue>>) => ({
    opacity: 0,
    width: size.width,
    height: size.height,
  }),
})
