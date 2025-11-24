/* eslint-disable no-empty-pattern */
import { QueryProvider } from '@/components/providers/QueryProvider'
import { fetchRelayInfo } from '@/core/observable/fetchRelayInfo'
import { Pool } from '@/core/pool'
import { Relay } from '@/core/Relay'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { queryClient } from '@/hooks/query/queryClient'
import { dbSqlite } from '@/nostr/db'
import type { UseQueryResult } from '@tanstack/react-query'
import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { type NostrEvent } from 'nostr-tools'
import { from } from 'rxjs'
import { test as base } from 'vitest'
import type { MockRelayOptions } from './testHelpers'
import { RelayServer, TestSigner } from './testHelpers'

interface Fixtures {
  pool: Pool
  createMockRelay: (url: string, db: NostrEvent[], options?: MockRelayOptions) => RelayServer
  insertEvent: (event: NostrEventDB) => Promise<void>
  insertEvents: (events: NostrEventDB[]) => Promise<void>
  reset: () => void
  signer: TestSigner
  renderReactQueryHook: (queryOptions: UseQueryOptions<NostrEventDB[]>) => Promise<UseQueryResult>
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
    await use((url: string, db: NostrEvent[], options?: { frameSizeLimit?: number }) => {
      return new RelayServer(url, db, options)
    })
  },
  pool: async ({}, use) => {
    const pool = new Pool({
      blacklist: [],
      open: (url) => new Relay(url, { info$: from(fetchRelayInfo(url)) }),
    })
    await use(pool)
    pool.reset()
  },
  insertEvent: async ({}, use) => {
    await use(async (event: NostrEventDB) => {
      await dbSqlite.insertEvent(event)
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 1500))
    })
  },
  insertEvents: async ({}, use) => {
    await use(async (events: NostrEventDB[]) => {
      for (const event of events) {
        await dbSqlite.insertEvent(event)
      }
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 1500))
    })
  },
  signer: async ({}, use) => {
    const signer = new TestSigner()
    await use(signer)
  },
  renderReactQueryHook: async ({}, use) => {
    await use(async (options) => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryProvider client={queryClient}>{children}</QueryProvider>
      )

      const { result } = renderHook(() => useQuery(options), { wrapper })
      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      return result.current
    })
  },
})
