import { finalizeEvent, generateSecretKey, nip19 } from 'nostr-tools'
import { parseReferences } from 'nostr/nips/nip27.references'
import { getMentionedAuthors } from '../getMentionedAuthors'

test('getMentionedAuthors', () => {
  const note = finalizeEvent({ kind: 1, content: '', created_at: 0, tags: [] }, generateSecretKey())
  const nevent = nip19.neventEncode(note)
  const nprofile = nip19.nprofileEncode({ relays: [], pubkey: note.pubkey })
  const event = {
    id: '1',
    kind: 1,
    pubkey: '1',
    content: `nostr:${nevent} nostr:${nprofile}`,
    created_at: 0,
    sig: '',
    tags: [
      ['p', '2'],
      ['p', '3'],
    ],
  }
  const references = parseReferences(event)
  expect(getMentionedAuthors(event, references)).toStrictEqual(['1', '2', '3', note.pubkey])
})
