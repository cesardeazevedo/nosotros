import { storage } from 'nostr/storage'
import { vi } from 'vitest'

vi.mock('core/Relay')
vi.mock('constants/relays')
vi.mock('mobx-persist-store')

vi.mock('nostr-tools', async () => {
  const originalModule = await vi.importActual<Record<string, unknown>>('nostr-tools')
  return {
    ...originalModule,
    verifyEvent: vi.fn(() => true),
  }
})

// Reset Indexeddb
beforeEach(() => storage.clearDB())
