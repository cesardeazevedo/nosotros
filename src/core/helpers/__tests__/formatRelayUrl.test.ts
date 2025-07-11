import { formatRelayUrl, prettyRelayUrl } from '../formatRelayUrl'

test('formatRelayUrl()', () => {
  expect(formatRelayUrl('wss://relay.io')).toStrictEqual('wss://relay.io')
  expect(formatRelayUrl('wss://relay.io/')).toStrictEqual('wss://relay.io')
  expect(formatRelayUrl('wss://relay.io/input')).toStrictEqual('wss://relay.io/input')
  expect(formatRelayUrl('wss://relay.io/chat')).toStrictEqual('wss://relay.io/chat')
})

test('prettyRelayUrl()', () => {
  expect(prettyRelayUrl('wss://relay.io')).toStrictEqual('relay.io')
  expect(prettyRelayUrl('wss://relay.io/')).toStrictEqual('relay.io')
  expect(prettyRelayUrl('wss://relay.io/input')).toStrictEqual('relay.io/input')
  expect(prettyRelayUrl('wss://relay.io/chat')).toStrictEqual('relay.io/chat')
})
