import { autorun } from 'mobx'
import type { Event } from 'nostr-tools'
import { fakeNote } from 'utils/faker'
import { test } from 'utils/fixtures'
import { vi } from 'vitest'
import { DBAtom } from '../db.atom'

const note = fakeNote()

describe('DBAtom', () => {
  test('Should expect lastTimeObserved, lastTimeUnobserved, isBeingObserved properties before and after observe the atom', () => {
    const atom = new DBAtom<Event>(note)
    expect(atom.lastTimeObserved).toBe(0)
    expect(atom.lastTimeUnobserved).toBe(0)
    expect(atom.isBeingObserved).toBe(false)
    const stub = vi.fn()
    const dispose = autorun(() => {
      stub(atom.data)
    })
    expect(atom.lastTimeObserved).not.toBe(0)
    expect(atom.lastTimeUnobserved).toBe(0)
    expect(atom.isBeingObserved).toBe(true)
    expect(stub).toHaveBeenNthCalledWith(1, note)
    dispose()
    expect(atom.lastTimeUnobserved).not.toBe(0)
    expect(atom.isBeingObserved).toBe(false)
  })
})
