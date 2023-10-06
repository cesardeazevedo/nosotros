/* eslint-disable @typescript-eslint/no-var-requires */
// import '@testing-library/jest-dom/extend-expect'
import { vi } from 'vitest'

// global.TextEncoder = require('util').TextEncoder
// global.TextDecoder = require('util').TextDecoder

vi.mock('mobx-persist-store')

vi.mock('nostr-tools', async () => {
  const originalModule = await vi.importActual<Record<string, unknown>>('nostr-tools')
  return {
    ...originalModule,
    validateEvent: vi.fn(() => true),
    verifySignature: vi.fn(() => true),
  }
})
