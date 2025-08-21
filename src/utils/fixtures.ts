/* eslint-disable no-empty-pattern */
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { queryClient } from '@/hooks/query/queryClient'
import { dbSqlite } from '@/nostr/db'
import { type NostrEvent } from 'nostr-tools'
import { test as base } from 'vitest'
import { RelayServer, TestSigner } from './testHelpers'

interface Fixtures {
  createMockRelay: (url: string, db: NostrEvent[]) => RelayServer
  insertEvent: (event: NostrEventDB) => Promise<void>
  reset: () => void
  signer: TestSigner
}

export const test = base.extend<Fixtures>({
  reset: [
    async ({}, use) => {
      queryClient.clear()
      await dbSqlite.deleteDB()
      await use(() => null)
    },
    { auto: true },
  ],
  createMockRelay: async ({}, use) => {
    await use((url: string, db: NostrEvent[]) => {
      return new RelayServer(url, db)
    })
  },
  insertEvent: async ({}, use) => {
    await use(async (event: NostrEventDB) => {
      await dbSqlite.insertEvent(event)
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 1500))
    })
  },
  signer: async ({}, use) => {
    const signer = new TestSigner()
    await use(signer)
  },
})
