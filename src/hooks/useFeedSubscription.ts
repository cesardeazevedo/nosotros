import { useEffect } from "react"
import type { ModuleInterface } from "stores/modules/interface"

export function useModuleSubscription(feed?: ModuleInterface) {
  useEffect(() => {
    feed?.start()
    return () => feed?.stop()
  }, [feed, feed?.id])
}
