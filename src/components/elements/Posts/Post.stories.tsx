import type { Meta, StoryObj } from '@storybook/react'
import { Kind } from 'constants/kinds'
import { useStore } from 'hooks/useStore'
import { nip19, type Event } from 'nostr-tools'
import type { RootStore } from 'stores'
import { fakeImageUrl, fakeNote, fakeSignature, fakeUser } from 'utils/faker'
import { CenteredContainer } from '../Layouts/CenteredContainer'
import Post from './Post'
import PostLoading from './PostLoading'

const meta = {
  component: Post,
  excludeStories: /.*setup$/,
  decorators: [
    (Story) => (
      <CenteredContainer maxWidth='sm'>
        <Story />
      </CenteredContainer>
    ),
  ],
  render: function Render() {
    const store = useStore()
    const note = store.notes.getNoteById('1')
    return note ? <Post note={note} /> : <PostLoading />
  },
} satisfies Meta<typeof Post>

export const setup = (note: Partial<Event>) => ({
  parameters: {
    setup(store: RootStore) {
      store.users.add(fakeUser('1', { name: 'test' }))
      store.notes.load(fakeNote({ ...note, id: '1' }))
    },
  },
})

export default meta

export const BaseStory = {
  ...setup({ id: '1', content: 'Hello World' }),
} satisfies StoryObj

export const MultiLineTest = {
  ...setup({
    id: '1',
    content: `Nunc interdum turpis nec tristique pretium

    Sed eget tortor diam. Maecenas lorem turpis, ultricies a rhoncus in, vestibulum in metus
    
    Fusce in eleifend augue
    - Vestibulum ullamcorper. 
    - Pellentesque habitant. 
    - Fusce efficitur est non feugiat laoreet. Nam vestibulum malesuada ipsum at lobortis. Maecenas eget nisl at nunc sagittis congue quis consectetur felis.
    - Vestibulum ullamcorper, ex non consectetur tristique, enim ligula maximus eros, quis aliquam dui enim sed lacus.
    - Nam quis sem condimentum, pellentesque est vitae, pharetra velit. Aliquam erat volutpat.
    - Nam commodo egestas purus non gravida. Morbi tempor elementum dignissim. Ut non commodo quam. Praesent rutrum elit tellus, quis elementum tortor rutrum non.
    - Donec pharetra posuere nisi, vitae condimentum lectus pretium quis. Maecenas consectetur egestas facilisis.`,
  }),
} satisfies StoryObj

export const Link = {
  ...setup({ content: 'Check this out! https://google.com' }),
} satisfies StoryObj

export const LinkWithParenthesis = {
  ...setup({ content: 'Check this out! (https://google.com)' }),
} satisfies StoryObj

export const LinkWithParenthesisAndSpaces = {
  ...setup({ content: `Check this out! ( https://google.com )` }),
} satisfies StoryObj

export const YoutubeEmbedShorted = {
  ...setup({ content: 'Check this out! https://youtu.be/aA-jiiepOrE' }),
} satisfies StoryObj

export const YoutubeEmbed = {
  ...setup({ content: 'Check this out! https://m.youtube.com/watch?v=aA-jiiepOrE' }),
} satisfies StoryObj

export const TwitterEmbed = {
  ...setup({ content: 'Hey: https://x.com https://x.com/BitMEXResearch/status/1758077405233574083' }),
} satisfies StoryObj

export const Image = {
  ...setup({ content: `Hello World ${fakeImageUrl(550)}` }),
} satisfies StoryObj

export const Image200x500 = {
  ...setup({ content: `Hello World ${fakeImageUrl(200, 500)}` }),
} satisfies StoryObj

export const Image500x200 = {
  ...setup({ content: `Hello World ${fakeImageUrl(500, 200)}` }),
} satisfies StoryObj

export const Image500x1200 = {
  ...setup({ content: `Hello World ${fakeImageUrl(550, 1200)}` }),
} satisfies StoryObj

export const Image1200x550 = {
  ...setup({ content: `Hello World ${fakeImageUrl(1200, 550)}` }),
} satisfies StoryObj

// It should maintain the width/height since it has a imeta dimensions
export const Image1200x550WithDIM = {
  ...setup({
    content: 'Hello World https://nostr.com/img',
    tags: [['imeta', 'url https://nostr.com/img', 'dim 1200x550', 'm image/jpg']],
  }),
} satisfies StoryObj

export const Image1800x1800 = {
  ...setup({ content: `Hello World ${fakeImageUrl(1800, 1800)}` }),
} satisfies StoryObj

export const Video = {
  ...setup({ content: `Hello https://v.nostr.build/g6BQ.mp4` }),
} satisfies StoryObj

export const Markdown = {
  ...setup({
    kind: Kind.Article,
    content: `
# Title 1
## Title 2
### Title 3

Description. *Italic* **bold** ~~strike~~ \`suscipit\` purus sit amet libero laoreet, at faucibus ex sollicitudin

* list 1 
* asdasd
* 123
* https://nostr.com

1. list 1
2. list 2
3. list 3
4. https://nostr.com
5. Test code

    multiline 
    \`\`\`ts
    console.log("Hello World")
    \`\`\`

6. test
7. ${fakeImageUrl(200, 100)}



> Quote sdasd

\`\`\`ts
console.log("Hello World")
\`\`\`

`,
  }),
} satisfies StoryObj

export const Note = {
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
