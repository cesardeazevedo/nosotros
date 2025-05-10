import { NIP07Signer } from '@/core/signers/nip07.signer'
import { t } from 'mobx-state-tree'

export const SignerNIP07 = t
  .model('SignerNIP07', {
    name: t.literal('nip07'),
  })
  .volatile(() => {
    return {
      signer: new NIP07Signer(),
    }
  })
