import * as React from 'react'

function defaultTrigger(store: React.MutableRefObject<number | undefined>, options: UseScrollTriggerOptions) {
  const { disableHysteresis = false, threshold = 100, target } = options
  const previous = store.current

  if (target) {
    // Get vertical scroll
    store.current = target.scrollY !== undefined ? target.scrollY : (target as unknown as HTMLElement).scrollTop
  }

  if (!store.current) {
    return
  }

  if (!disableHysteresis && previous !== undefined) {
    if (store.current < previous) {
      return false
    }
  }

  return store.current > threshold
}

export interface UseScrollTriggerOptions {
  disableHysteresis?: boolean
  target?: Window
  threshold?: number
}

export function useScrollTrigger(options: UseScrollTriggerOptions = {}) {
  const { target = window, ...other } = options
  const getTrigger = defaultTrigger
  const store = React.useRef<number>(undefined)
  const [trigger, setTrigger] = React.useState(() => getTrigger(store, other))

  React.useEffect(() => {
    const handleScroll = () => {
      setTrigger(getTrigger(store, { target, ...other }))
    }

    handleScroll() // Re-evaluate trigger when dependencies change
    target.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      // @ts-ignore
      target.removeEventListener('scroll', handleScroll, { passive: true })
    }
  }, [target, getTrigger, JSON.stringify(other)])

  return trigger
}
