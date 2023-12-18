import { test } from 'utils/fixtures'

describe('NostrStore', () => {
  test('Should expect new relays being appended', async ({ root }) => {
    await root.nostr.addEvent('1', ['1', '2'])
    expect(root.nostr.events.get('1')).toStrictEqual({ id: '1', relays: ['1', '2'] })
    await root.nostr.addEvent('1', ['1', '2', '3'])
    expect(root.nostr.events.get('1')).toStrictEqual({ id: '1', relays: ['1', '2', '3'] })
    await root.nostr.addEvent('1', ['4'])
    expect(root.nostr.events.get('1')).toStrictEqual({ id: '1', relays: ['1', '2', '3', '4'] })
  })
})
