import type { Instance, SnapshotIn } from 'mobx-state-tree'
import { t } from 'mobx-state-tree'
import { withSetAction } from '../helpers/withSetAction'
import { withToggleAction } from '../helpers/withToggleAction'

export const NostrSettingsModel = t
  .model('NostrSettingsModel', {
    nip05: t.maybe(t.boolean),
    hints: t.maybe(t.boolean),
    outbox: t.maybe(t.boolean),
    offline: t.maybe(t.boolean),
    localDB: t.maybe(t.boolean),
    localRelays: t.maybe(t.array(t.string)),
    maxRelaysPerUserInbox: t.maybe(t.number),
    maxRelaysPerUserOutbox: t.maybe(t.number),
  })
  .actions(withSetAction)
  .actions(withToggleAction)

export interface NostrSettings extends Instance<typeof NostrSettingsModel> {}
export interface NostrSettingsSnapshotIn extends SnapshotIn<typeof NostrSettingsModel> {}
