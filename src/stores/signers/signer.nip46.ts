import type { NIP46RemoteSignerOptions } from '@/core/signers/nip46.signer'
import { NIP46RemoteSigner } from '@/core/signers/nip46.signer'
import type { Instance } from 'mobx-state-tree'
import { t } from 'mobx-state-tree'

export const SignerNIP46 = t
  .model('SignerNIP46', {
    name: t.literal('nip46'),
    params: t.frozen<Omit<NIP46RemoteSignerOptions, 'auth'>>(),
  })
  .volatile((self) => ({
    signer: new NIP46RemoteSigner(self.params),
  }))

export type SignerNIP46Type = Instance<typeof SignerNIP46>
