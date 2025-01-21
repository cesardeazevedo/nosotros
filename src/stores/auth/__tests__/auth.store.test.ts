import { rootStore } from '@/stores/root.store'
import { autorun } from 'mobx'
import invariant from 'tiny-invariant'
import { beforeEach, describe, expect, test, vi } from 'vitest'

const { auth } = rootStore

describe('auth$ store', () => {
  beforeEach(() => {
    auth.reset()
  })

  test('assert empty current account', () => {
    expect(auth.selected).toBeUndefined()
  })

  test('assert login and logout', () => {
    auth.login({ pubkey: 'user1', context: { options: {}, signer: { name: 'nip07' } } })

    const account = auth.selected
    invariant(account, 'account not defined')
    expect(account.pubkey).toBe('user1')
    expect(account.context.signer?.name).toEqual('nip07')

    auth.logout()
    expect(auth.selected).toBeUndefined()
    expect(auth.pubkey).toBeUndefined()
  })

  test('assert login and logout inside observe', () => {
    const fn = vi.fn()
    autorun(() => {
      if (auth.selected) {
        const { pubkey, context } = auth.selected
        fn({ pubkey, signer: { name: context.signer?.name } })
      } else {
        fn(undefined)
      }
    })
    auth.login({ pubkey: 'user1', context: { options: {}, signer: { name: 'nip07' } } })
    auth.login({ pubkey: 'user2', context: { options: {}, signer: { name: 'nip07' } } })
    expect(fn).toHaveBeenCalledTimes(3)
    expect(fn).toHaveBeenNthCalledWith(1, undefined)
    expect(fn).toHaveBeenNthCalledWith(2, { pubkey: 'user1', signer: { name: 'nip07' } })
    expect(fn).toHaveBeenNthCalledWith(3, { pubkey: 'user2', signer: { name: 'nip07' } })
  })

  test('assert reset', () => {
    auth.login({ pubkey: 'user1', context: { options: {}, signer: { name: 'nip07' } } })
    auth.login({ pubkey: 'user2', context: { options: {}, signer: { name: 'nip07' } } })

    expect(auth.accounts.size).toBe(2)
    auth.reset()
    expect(auth.accounts.size).toBe(0)
  })
})
