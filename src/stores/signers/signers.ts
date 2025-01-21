import type { Instance, SnapshotIn } from 'mobx-state-tree'
import { t } from 'mobx-state-tree'
import { SignerNIP07 } from './signer.nip07'
import { SignerNIP46 } from './signer.nip46'

export const SignersModel = t.union(SignerNIP07, SignerNIP46, t.literal(null))

export type Signers = Instance<typeof SignersModel>
export type SignersSnapshotIn = SnapshotIn<typeof SignersModel>
