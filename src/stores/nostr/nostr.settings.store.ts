import type { Instance, SnapshotIn } from 'mobx-state-tree'
import { t } from 'mobx-state-tree'
import { withSetAction } from '../helpers/withSetAction'
import { withToggleAction } from '../helpers/withToggleAction'

export const NostrSettingsModel = t
  .model('NostrSettingsModel', {
    nip05: t.boolean,
    hints: t.boolean,
    outbox: t.boolean,
    offline: t.boolean,
    localDB: t.boolean,
    localRelays: t.array(t.string),
    maxRelaysPerUserInbox: t.number,
    maxRelaysPerUserOutbox: t.number,
  })
  .actions(withSetAction)
  .actions(withToggleAction)

export interface NostrSettings extends Instance<typeof NostrSettingsModel> {}
export interface NostrSettingsSnapshotIn extends SnapshotIn<typeof NostrSettingsModel> {}
