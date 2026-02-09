import { renderHook } from '@testing-library/react'
import { vi } from 'vitest'
import { useEventDecrypt } from '../useEventDecrypt'

const mockUseCurrentPubkey = vi.fn()
const mockUseCurrentSigner = vi.fn()

vi.mock('../useAuth', () => ({
  useCurrentPubkey: () => mockUseCurrentPubkey(),
  useCurrentSigner: () => mockUseCurrentSigner(),
}))

describe('assert useEventDecrypt', () => {
  beforeEach(() => {
    mockUseCurrentPubkey.mockReturnValue(undefined)
    mockUseCurrentSigner.mockReturnValue(undefined)
  })

  test('assert returns default state when event is undefined', () => {
    const { result } = renderHook(() => useEventDecrypt(undefined))

    expect(result.current).toEqual([undefined, undefined])
  })
})
