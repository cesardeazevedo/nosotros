import { mergeRelayHints } from '../mergeRelayHints'

test('mergeRelayHints', () => {
  const res = mergeRelayHints([
    { authors: { '1': ['wss://relay1.com'] } },
    { authors: { '1': ['wss://relay2.com'] } },
    { authors: { '2': ['wss://relay1.com'] } },
    { authors: { '2': ['wss://relay2.com'] } },
    { authors: { '3': ['wss://relay1.com'] } },
    { authors: { '3': ['wss://relay2.com'] } },
  ])
  expect(res).toStrictEqual({
    authors: {
      '1': ['wss://relay1.com', 'wss://relay2.com'],
      '2': ['wss://relay1.com', 'wss://relay2.com'],
      '3': ['wss://relay1.com', 'wss://relay2.com'],
    },
  })
})
