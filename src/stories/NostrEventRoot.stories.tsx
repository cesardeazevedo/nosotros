import { NostrEventRoot } from '@/components/elements/Event/NostrEventRoot'
import { CenteredContainer } from '@/components/elements/Layouts/CenteredContainer'
import { PaperContainer } from '@/components/elements/Layouts/PaperContainer'
import { setEventData } from '@/hooks/query/queryUtils'
import { fakeEventMeta } from '@/utils/faker'
import type { Meta, StoryObj } from '@storybook/react-vite'

const user1 = fakeEventMeta({
  kind: 0,
  pubkey: 'p1',
  content: JSON.stringify({
    display_name: 'Nostr User',
    picture: 'https://placehold.co/100x100',
    about: 'This is a test user',
  }),
})

const user2 = fakeEventMeta({
  kind: 0,
  pubkey: 'p2',
  content: JSON.stringify({
    display_name: 'Nostr User 2',
    picture: 'https://placehold.co/100x100',
    about: 'This is a test user 2',
  }),
})

const user3 = fakeEventMeta({
  kind: 0,
  pubkey: 'p3',
  content: JSON.stringify({
    display_name: 'Nostr User 3',
    picture: 'https://placehold.co/100x100',
    about: 'This is a test user 3',
  }),
})

const meta = {
  title: 'Components/NostrEventRoot',
  component: NostrEventRoot,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  loaders: [
    () => {
      setEventData(user1)
      setEventData(user2)
      setEventData(user3)
    },
  ],
  decorators: [
    (Story, { args: { event } }) => {
      setEventData(event)
      return (
        <CenteredContainer margin>
          <PaperContainer>
            <Story />
          </PaperContainer>
        </CenteredContainer>
      )
    },
  ],
  args: {
    open: false,
    event: fakeEventMeta({ kind: 1, content: 'Hello World' }),
  },
} satisfies Meta<typeof NostrEventRoot> & { imeta?: boolean }

export default meta
type Story = StoryObj<typeof meta>

export const Kind0User: Story = {
  args: {
    event: user1,
  },
}

export const Kind1TextNote: Story = {
  args: {
    event: fakeEventMeta({
      kind: 1,
      pubkey: 'p1',
      content: 'Hello World',
    }),
  },
}

export const Kind1TextNoteImage: Story = {
  args: {
    event: fakeEventMeta({
      kind: 1,
      pubkey: 'p1',
      content: 'Hello World https://placehold.co/800x400.jpg',
    }),
  },
}

export const Kind3FollowList: Story = {
  args: {
    event: fakeEventMeta({
      kind: 3,
      pubkey: 'p1',
      content: '',
      tags: [
        ['p', 'p2'],
        ['p', 'p3'],
        ['t', 'nostr'],
        ['t', 'freedomtech'],
      ],
    }),
  },
}

export const Kind24PublicMessage: Story = {
  args: {
    event: fakeEventMeta({
      kind: 24,
      pubkey: 'p1',
      content: 'Public message',
      tags: [['p', 'p2']],
    }),
  },
}

export const Kind20MediaSingle: Story = {
  args: {
    event: fakeEventMeta({
      kind: 20,
      pubkey: 'p1',
      content: '',
      tags: [['imeta', 'url https://cdn.midjourney.com/b8606d1e-73ab-43ef-870b-e5f22ffd4bff/0_0.png', 'm image/jpeg']],
    }),
  },
}

export const Kind20MediaCarousel: Story = {
  args: {
    event: fakeEventMeta({
      kind: 20,
      pubkey: 'p1',
      content: '',
      tags: [
        [
          'imeta',
          'url https://placehold.co/800x600',
          'm image/jpeg',
          'alt A calm placeholder scene 🌄\nColors, shapes, and imagination 🎨',
          'x 5b1a7e4c923f4fd3a8f7f8c1bb79c4f8213f0a88d9bfe12e4c7b31e6c5f20b19',
          'size 128034',
          'dim 800x600',
          'blurhash L5H2EC=PM+yV0g-mq.wG9c010J}I',
        ],
        [
          'imeta',
          'url https://placehold.co/640x360',
          'm image/png',
          'alt Minimalism in motion ⚪️⚫️\nJust a box, but says so much 📦',
          'x 2d8b17a4e9028b7c34f3d5eea1c2a3e4f6c71b009dd24f8efbe13a4a2f6e92d1',
          'size 75892',
          'dim 640x360',
          'blurhash LGFFaXYk^6#M@-5c,1J5@[or[Q6.',
        ],
        [
          'imeta',
          'url https://placehold.co/1024x512',
          'm image/jpeg',
          'alt Wide horizons 🌐\nSpace to breathe, space to dream ✨',
          'x 7f3d4c5e6a1b2f9e8c0d4a1b6f7c3d8e9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d',
          'size 203455',
          'dim 1024x512',
          'blurhash LKO2?U%2Tw=w]~RBVZRi};RPxuwH',
        ],
      ],
    }),
    open: true,
  },
}

export const Kind9735ZapReceipt: Story = {
  args: {
    event: fakeEventMeta({
      kind: 9735,
      pubkey: 'p1',
      content: '',
      tags: [
        ['p', 'p2'],
        ['P', 'p1'],
      ],
    }),
  },
}

export const Kind9735ZapReceiptAnonymous: Story = {
  args: {
    event: fakeEventMeta({
      kind: 9735,
      pubkey: 'p1',
      content: '',
      tags: [['p', 'p2']],
    }),
  },
}

export const Kind30023Article: Story = {
  args: {
    event: fakeEventMeta({
      kind: 30023,
      pubkey: 'p1',
      content: `
# Lorem Ipsum Dolor Sit Amet

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor.
![alt](https://placehold.co/640x360)

Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi. Proin porttitor, orci nec nonummy molestie, enim est eleifend mi.
![alt](https://placehold.co/800x400)

### Subheading

Aliquam erat volutpat. Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus.
![alt](https://placehold.co/300x200)

Phasellus ultrices nulla quis nibh. Quisque a lectus. Donec consectetuer ligula vulputate sem tristique cursus.
![alt](https://placehold.co/500x250)

### Another Section

Nam nulla quam, gravida non, commodo a, sodales sit amet, nisi. Pellentesque fermentum dolor. Aliquam quam lectus, facilisis auctor, ultrices ut, elementum vulputate, nunc.
![alt](https://placehold.co/1024x512)

Etiam cursus leo vel metus. Nulla facilisi. Aenean nec eros. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae.
![alt](https://placehold.co/720x480)

### Conclusion

Suspendisse sollicitudin velit sed leo. Ut pharetra augue nec augue. Nam elit magna, hendrerit sit amet, tincidunt ac, viverra sed, nulla.
![alt](https://placehold.co/400x400)
      `,
      tags: [
        ['title', 'Lorem Ipsum Dolor Sit Amet'],
        ['image', 'https://placehold.co/600x300'],
      ],
    }),
    open: true,
  },
}

export const Kind6RepostTextNote: Story = {
  args: {
    event: fakeEventMeta({
      kind: 6,
      pubkey: 'p1',
      content: JSON.stringify(
        fakeEventMeta({
          id: 'e1',
          kind: 1,
          content: 'This is the original text note being reposted',
          pubkey: 'p2',
        }),
      ),
      tags: [
        ['p', 'p2'],
        ['e', 'e1'],
      ],
    }),
  },
}

export const Kind6RepostArticle: Story = {
  args: {
    event: fakeEventMeta({
      kind: 6,
      pubkey: 'p1',
      content: JSON.stringify(
        fakeEventMeta({
          id: 'e2',
          kind: 30023,
          content: `# How to Build a Decentralized Future

The future of the internet is decentralized. In this article, we explore the fundamentals of building truly distributed systems.

![Future](https://placehold.co/800x400)

## Key Principles

1. **User ownership** - Users control their data
2. **Censorship resistance** - No single point of failure
3. **Interoperability** - Systems work together

The path forward requires both technical innovation and social coordination.`,
          pubkey: 'p2',
          tags: [
            ['title', 'How to Build a Decentralized Future'],
            ['image', 'https://placehold.co/800x400'],
          ],
        }),
      ),
      tags: [
        ['p', 'p2'],
        ['e', 'e2'],
      ],
    }),
  },
}

export const Kind6RepostUnsupportedKind: Story = {
  args: {
    event: fakeEventMeta({
      kind: 6,
      pubkey: 'p1',
      content: JSON.stringify(
        fakeEventMeta({
          id: 'e3',
          kind: 1337,
          content: 'This is an unsupported kind that should show fallback UI',
          pubkey: 'p2',
        }),
      ),
      tags: [
        ['p', 'p2'],
        ['e', 'e3'],
      ],
    }),
  },
}

export const Kind6RepostWithMedia: Story = {
  args: {
    event: fakeEventMeta({
      kind: 6,
      pubkey: 'p1',
      content: JSON.stringify(
        fakeEventMeta({
          id: 'e4',
          kind: 1,
          content:
            'Check out this amazing video! https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          pubkey: 'p2',
          tags: [
            [
              'imeta',
              'url https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
              'm video/mp4',
              'alt Big Buck Bunny sample video',
              'size 5510872',
              'dim 1280x720',
            ],
          ],
        }),
      ),
      tags: [
        ['p', 'p2'],
        ['e', 'e4'],
      ],
    }),
  },
}

export const Kind6RepostInvalidContent: Story = {
  args: {
    event: fakeEventMeta({
      kind: 6,
      pubkey: 'p1',
      content: 'invalid json content that should show error handling',
      tags: [
        ['p', 'p2'],
        ['e', 'e5'],
      ],
    }),
  },
}
