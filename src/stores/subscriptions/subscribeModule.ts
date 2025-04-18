import { identity } from 'observable-hooks'
import { mergeMap } from 'rxjs'
import { toStream } from '../helpers/toStream'
import { isRelayDiscoveryModule, type ModulesInstances } from '../modules/module.store'
import { subscribeFeedStore } from './subscribeFeedStore'
import { subscribeNostrModule } from './subscribeNostrModule'
import { subscribeRelayDiscoveryModule } from './subscribeRelayDiscoveryModule'

export function subscribeModule(module: ModulesInstances) {
  return module.type === 'event'
    ? subscribeNostrModule(module)
    : isRelayDiscoveryModule(module)
      ? subscribeRelayDiscoveryModule(module)
      : subscribeFeedStore(module.feed)
}

export function subscribeModules(modules: ModulesInstances[]) {
  return toStream(() => modules).pipe(
    mergeMap(identity),
    mergeMap((module) => subscribeModule(module)),
  )
}
