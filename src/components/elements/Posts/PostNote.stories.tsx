import { Meta, StoryObj } from '@storybook/react'
import { nip19 } from 'nostr-tools'
import { RootStore } from 'stores'
import { fakeNote, fakeSignature, fakeUser } from 'utils/faker'
import Post from './Post'
import BaseMeta from './Post.stories'

const meta = {
  ...BaseMeta,
  component: Post,
} satisfies Meta<typeof Post>

export default meta

export const Default = {
  parameters: {
    setup(store: RootStore) {
      const mentioned = fakeSignature(fakeNote({ id: '2', content: 'Related note https://google.com' }))
      const encoded = nip19.neventEncode({ id: mentioned.id })
      store.users.add(fakeUser('1'))
      store.users.add(fakeUser(mentioned.pubkey, { name: 'mentioned user' }))
      store.notes.loadNotes([fakeNote({ id: '1', content: `Hello World nostr:${encoded}` }), mentioned])
    },
  },
} satisfies StoryObj
