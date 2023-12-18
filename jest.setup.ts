import { vi } from 'vitest'

vi.mock('mobx-persist-store')

vi.mock('nostr-tools', async () => {
  const originalModule = await vi.importActual<Record<string, unknown>>('nostr-tools')
  return {
    ...originalModule,
    validateEvent: vi.fn(() => true),
    verifySignature: vi.fn(() => true),
  }
})
