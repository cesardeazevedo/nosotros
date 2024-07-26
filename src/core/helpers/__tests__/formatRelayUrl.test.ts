import { formatRelayUrl } from '../formatRelayUrl'

test('formatRelayUrl()', () => {
  expect(formatRelayUrl('wss://relay.io/')).toStrictEqual('wss://relay.io')
})
