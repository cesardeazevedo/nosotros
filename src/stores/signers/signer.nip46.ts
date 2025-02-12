import type { BunkerResponse, NIP46RemoteSignerOptions } from '@/core/signers/nip46.signer'
import { NIP46RemoteSigner } from '@/core/signers/nip46.signer'
import type { Instance } from 'mobx-state-tree'
import { t } from 'mobx-state-tree'
import type { Observable } from 'rxjs'
import { EMPTY } from 'rxjs'

export const SignerNIP46 = t
  .model('SignerNIP46', {
    name: t.literal('nip46'),
    params: t.frozen<Omit<NIP46RemoteSignerOptions, 'auth'>>(),
  })
  .volatile((self) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function onAuth(url: string) {
      // TODO
      return EMPTY as Observable<BunkerResponse>
    }
    return {
      signer: new NIP46RemoteSigner({
        ...self.params,
        auth: onAuth,
      }),
    }
  })

export type SignerNIP46Type = Instance<typeof SignerNIP46>
