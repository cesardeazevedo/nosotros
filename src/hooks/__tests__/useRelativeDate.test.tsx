import { renderHook } from '@testing-library/react'
import { vi } from 'vitest'
import { useRelativeDate } from '../useRelativeDate'

describe('useRelativeDate', () => {
  const originalTZ = process.env.TZ

  beforeEach(() => {
    process.env.TZ = 'America/Sao_Paulo'
    vi.useFakeTimers()
    vi.setSystemTime(1_771_715_442_326)
  })

  afterEach(() => {
    vi.useRealTimers()
    process.env.TZ = originalTZ
  })

  test('returns "just now" for same-second timestamps', () => {
    const date = 1_771_715_442
    const { result } = renderHook(() => useRelativeDate(date, 'narrow'))

    expect(result.current).toEqual(['just now', 'Feb 21, 2026, 8:10 PM'])
  })

  test('recomputes when style changes', () => {
    const date = 1_771_715_382
    const { result, rerender } = renderHook(
      ({ style }: { style: Intl.RelativeTimeFormatStyle }) => useRelativeDate(date, style),
      {
      initialProps: { style: 'narrow' },
    })

    expect(result.current).toEqual(['1 min. ', 'Feb 21, 2026, 8:09 PM'])

    rerender({ style: 'short' })
    expect(result.current).toEqual(['1 min. ago', 'Feb 21, 2026, 8:09 PM'])
  })
})
