import { useEffect } from 'react'
import { Subscription } from 'stores/core/subscription'

export function useSubscription(action: () => Subscription | undefined | void): void {
  useEffect(() => {
    action()
    // TODO, handle unsubscribe
  }, [action])
}
