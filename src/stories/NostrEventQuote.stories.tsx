import { NostrEventRoot } from '@/components/elements/Event/NostrEventRoot'
import { CenteredContainer } from '@/components/elements/Layouts/CenteredContainer'
import { PaperContainer } from '@/components/elements/Layouts/PaperContainer'
import { setEventData } from '@/hooks/query/queryUtils'
import { fakeEventMeta, fakeSignature } from '@/utils/faker'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { generateSecretKey, getPublicKey, nip19 } from 'nostr-tools'
import { isAddressableKind } from 'nostr-tools/kinds'

const key1 = generateSecretKey()
const pubkey = getPublicKey(key1)

const user1 = fakeEventMeta({
  kind: 0,
  pubkey,
  content: JSON.stringify({
    display_name: 'Alice',
    picture: 'https://placehold.co/100x100',
    about: 'Original poster',
  }),
})

const meta = {
  title: 'Components/NostrEventQuote',
  component: NostrEventRoot,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  loaders: [
    () => {
      setEventData(user1)
    },
  ],
  decorators: [
    (Story, { args }) => {
      const { event } = args
      const root = fakeEventMeta({
        kind: 1,
        pubkey,
        content: `${
          isAddressableKind(event.kind)
            ? nip19.naddrEncode({
                kind: event.kind,
                pubkey: event.pubkey,
                identifier: event.tags.find((t) => t[0] === 'd')![1],
              })
            : nip19.neventEncode(event)
        }`,
      })
      setEventData(root)
      setEventData(event)
      return (
        <CenteredContainer margin>
          <PaperContainer>
            <Story args={{ event: root }} />
          </PaperContainer>
        </CenteredContainer>
      )
    },
  ],
} satisfies Meta<typeof NostrEventRoot>

export default meta
type Story = StoryObj<typeof meta>

export const QuoteTextNote: Story = {
  args: {
    event: fakeSignature(
      fakeEventMeta({
        kind: 1,
        pubkey,
        content: 'This is the original note being quoted',
      }),
      key1,
    ),
  },
}

export const QuoteNoteWithImage: Story = {
  args: {
    event: fakeSignature(
      fakeEventMeta({
        kind: 1,
        pubkey: 'p1',
        content: 'Check out this beautiful sunset https://placehold.co/1024x512.jpg',
      }),
    ),
  },
}

export const QuoteNoteWithImagePortrait: Story = {
  args: {
    event: fakeSignature(
      fakeEventMeta({
        kind: 1,
        pubkey: 'p1',
        content: 'Check out this beautiful sunset https://placehold.co/512x1024.jpg',
      }),
    ),
  },
}

export const QuoteNoteWithPairImages: Story = {
  args: {
    event: fakeSignature(
      fakeEventMeta({
        kind: 1,
        pubkey: 'p1',
        content: 'Check out this beautiful sunset https://placehold.co/512x1024.jpg https://placehold.co/512x1024.jpg',
      }),
    ),
  },
}

export const QuoteNoteWithListImages: Story = {
  args: {
    event: fakeSignature(
      fakeEventMeta({
        kind: 1,
        pubkey: 'p1',
        content:
          'Check out this beautiful sunset https://placehold.co/512x1024.jpg https://placehold.co/512x1024.jpg https://placehold.co/512x1024.jpg https://placehold.co/512x1024.jpg',
      }),
    ),
  },
}

export const QuoteNoteWithVideo: Story = {
  args: {
    event: fakeSignature(
      fakeEventMeta({
        kind: 1,
        pubkey: 'p1',
        content:
          'Check out this beautiful sunset https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      }),
    ),
  },
}

export const QuoteNoteWithVideoPortrait: Story = {
  args: {
    event: fakeSignature(
      fakeEventMeta({
        kind: 1,
        pubkey: 'p1',
        content:
          'Check out this beautiful sunset  https://blossom.nosotros.app/eaf519203c5bb57aa0b063970838925a80422716d40d95114020b740bb88bbe4.mp4',
      }),
    ),
  },
}

export const QuoteArticle: Story = {
  args: {
    event: fakeSignature(
      fakeEventMeta({
        kind: 30023,
        pubkey,
        content: `# Understanding Nostr

Nostr is a simple, open protocol that enables truly censorship-resistant and global social media.

## Key Features

- Decentralized architecture
- Cryptographic verification
- User-owned identity

The protocol is minimal by design, making it easy to implement and hard to break.`,
        tags: [
          ['title', 'Understanding Nostr'],
          ['image', 'https://placehold.co/1200x630'],
          ['d', 'understanding-nostr'],
        ],
      }),
    ),
  },
}

export const QuoteMediaPost: Story = {
  args: {
    event: fakeSignature(
      fakeEventMeta({
        kind: 20,
        pubkey: 'p1',
        content: '',
        tags: [
          [
            'imeta',
            'url https://placehold.co/1024x768',
            'm image/jpeg',
            'alt Mountain landscape at golden hour',
            'size 245678',
            'dim 1024x768',
            'blurhash LKO2?U%2Tw=w]~RBVZRi};RPxuwH',
          ],
        ],
      }),
    ),
  },
}

export const QuoteMediaCarousel: Story = {
  args: {
    event: fakeSignature(
      fakeEventMeta({
        kind: 20,
        pubkey: 'p1',
        content: '',
        tags: [
          [
            'imeta',
            'url https://placehold.co/800x600',
            'm image/jpeg',
            'alt A calm placeholder scene',
            'size 128034',
            'dim 800x600',
          ],
          [
            'imeta',
            'url https://placehold.co/640x360',
            'm image/png',
            'alt Minimalism in motion',
            'size 75892',
            'dim 640x360',
          ],
          [
            'imeta',
            'url https://placehold.co/1024x512',
            'm image/jpeg',
            'alt Wide horizons',
            'size 203455',
            'dim 1024x512',
          ],
        ],
      }),
    ),
  },
}

export const QuoteLongNote: Story = {
  args: {
    event: fakeSignature(
      fakeEventMeta({
        kind: 1,
        pubkey: 'p1',
        content: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor.

https://placehold.co/512x1024.jpg

Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi. Proin porttitor, orci nec nonummy molestie, enim est eleifend mi, non fermentum diam nisl sit amet erat.

https://placehold.co/1024x512.jpg

Duis semper. Duis arcu massa, scelerisque vitae, consequat in, pretium a, enim. Pellentesque congue. Ut in risus volutpat libero pharetra tempor. Cras vestibulum bibendum augue.`,
      }),
    ),
  },
}
