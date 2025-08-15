/* eslint-disable no-empty-pattern */
import { type NostrEvent } from 'nostr-tools'
import { test as base } from 'vitest'
import { RelayServer, TestSigner } from './testHelpers'

interface Fixtures {
  createMockRelay: (url: string, db: NostrEvent[]) => RelayServer
  reset: () => void
  signer: TestSigner
}

export const test = base.extend<Fixtures>({
  reset: [
    async ({}, use) => {
      await use(() => null)
    },
    { auto: true },
  ],
  createMockRelay: async ({}, use) => {
    await use((url: string, db: NostrEvent[]) => {
      return new RelayServer(url, db)
    })
  },
  signer: async ({}, use) => {
    const signer = new TestSigner()
    await use(signer)
  },
})
