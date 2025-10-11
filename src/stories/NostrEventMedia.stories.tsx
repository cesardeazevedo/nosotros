import { NostrEventRoot } from '@/components/elements/Event/NostrEventRoot'
import { CenteredContainer } from '@/components/elements/Layouts/CenteredContainer'
import { PaperContainer } from '@/components/elements/Layouts/PaperContainer'
import { setEventData } from '@/hooks/query/queryUtils'
import { fakeEventMeta } from '@/utils/faker'
import { getImgProxyUrl } from '@/utils/imgproxy'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { http, passthrough } from 'msw'

const user1 = fakeEventMeta({
  kind: 0,
  pubkey: 'p1',
  content: JSON.stringify({
    display_name: 'Nostr User',
    picture: 'https://placehold.co/100x100',
    about: 'This is a test user',
  }),
})

const meta = {
  title: 'Components/NostrEventMedia',
  component: NostrEventRoot,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
  loaders: [
    () => {
      setEventData(user1)
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
} satisfies Meta<typeof NostrEventRoot>

export default meta
type Story = StoryObj<typeof meta>

export const Kind1YoutubeVideo: Story = {
  args: {
    event: fakeEventMeta({
      kind: 1,
      pubkey: 'p1',
      content: ['Youtube', 'https://www.youtube.com/watch?v=aA-jiiepOrE'].join(' '),
    }),
  },
}

export const Kind1Landscape: Story = {
  args: {
    event: fakeEventMeta({
      kind: 1,
      pubkey: 'p1',
      content: ['Single landscape image', 'https://placehold.co/1200x675.jpg'].join(' '),
    }),
  },
}

export const Kind1LandscapeSmall: Story = {
  args: {
    event: fakeEventMeta({
      kind: 1,
      pubkey: 'p1',
      content: ['Single landscape image', 'https://placehold.co/1200x100.jpg'].join(' '),
    }),
  },
}

export const Kind1Portrait: Story = {
  args: {
    event: fakeEventMeta({
      kind: 1,
      pubkey: 'p1',
      content: ['Single portrait image', 'https://placehold.co/800x1200.jpg'].join(' '),
    }),
  },
}

export const Kind20Portrait2: Story = {
  args: {
    event: fakeEventMeta({
      kind: 20,
      pubkey: 'p1',
      content: ['Single portrait image but kind20'].join(' '),
      tags: [['imeta', 'url https://cdn.midjourney.com/b8606d1e-73ab-43ef-870b-e5f22ffd4bff/0_0.png']],
    }),
  },
}

export const Kind1PortraitSmall: Story = {
  args: {
    event: fakeEventMeta({
      kind: 1,
      pubkey: 'p1',
      content: ['Single portrait image', 'https://placehold.co/200x400.jpg'].join(' '),
    }),
  },
}

export const Kind1PairLandscape: Story = {
  args: {
    event: fakeEventMeta({
      kind: 1,
      pubkey: 'p1',
      content: ['List landscape images', 'https://placehold.co/1024x576.jpg', 'https://placehold.co/1280x720.jpg'].join(
        ' ',
      ),
    }),
  },
}

export const Kind1PairLandscapeSmall: Story = {
  args: {
    event: fakeEventMeta({
      kind: 1,
      pubkey: 'p1',
      content: ['List landscape images', 'https://placehold.co/400x100.jpg', 'https://placehold.co/600x120.jpg'].join(
        ' ',
      ),
    }),
  },
}

export const Kind1PairPortrait: Story = {
  args: {
    event: fakeEventMeta({
      kind: 1,
      pubkey: 'p1',
      content: ['List 900x1080', 'https://placehold.co/900x1080.jpg', 'https://placehold.co/900x1080.jpg'].join(' '),
    }),
  },
}

export const Kind1PairPortrait2: Story = {
  args: {
    event: fakeEventMeta({
      kind: 1,
      pubkey: 'p1',
      content: [
        'List 400x1080, 900x1080',
        'https://placehold.co/400x1080.jpg',
        'https://placehold.co/900x1080.jpg',
      ].join(' '),
    }),
  },
}

export const Kind1PairPortrait3: Story = {
  args: {
    event: fakeEventMeta({
      kind: 1,
      pubkey: 'p1',
      content: [
        'List 400x1080, 900x1080',
        'https://placehold.co/200x400.jpg',
        'https://placehold.co/900x1080.jpg',
      ].join(' '),
    }),
  },
}

export const Kind1PairLandscapeAndPortrait: Story = {
  args: {
    event: fakeEventMeta({
      kind: 1,
      pubkey: 'p1',
      content: [
        'Portrait and landscape images',
        'https://placehold.co/800x1200.jpg', // portrait
        'https://placehold.co/800x350.jpg', // landscape
      ].join(' '),
    }),
  },
}

export const Kind1PairThinLandscapeAndPortrait: Story = {
  args: {
    event: fakeEventMeta({
      kind: 1,
      pubkey: 'p1',
      content: [
        'Mixed images',
        'https://placehold.co/420x600.jpg', // portrait
        'https://placehold.co/1200x100.jpg', // landscape
      ].join(' '),
    }),
  },
}

export const Kind1PairWithVideo: Story = {
  args: {
    event: fakeEventMeta({
      kind: 1,
      pubkey: 'p1',
      content: [
        'With video',
        'https://placehold.co/420x600.jpg', // portrait
        'https://blossom.nosotros.app/eaf519203c5bb57aa0b063970838925a80422716d40d95114020b740bb88bbe4.mp4',
      ].join(' '),
    }),
  },
}

export const Kind1PairTest: Story = {
  args: {
    event: fakeEventMeta({
      kind: 1,
      pubkey: 'p1',
      content: [
        'My photos',
        'https://blossom.nosotros.app/390eaa51ed4c5a9c947fbe91d5aa5226961b4661a7fa901d098312560ab42586.jpg',
        'https://blossom.nosotros.app/d7356388a7963f30d999d1c4a3cfeb951b829bc962992938a7240822bbba1e07.jpg',
      ].join(' '),
    }),
  },
}

export const Kind1ListLandscape: Story = {
  args: {
    event: fakeEventMeta({
      kind: 1,
      pubkey: 'p1',
      content: [
        'List landscape images',
        'https://placehold.co/1024x576.jpg',
        'https://placehold.co/1280x720.jpg',
        'https://placehold.co/1600x900.jpg',
      ].join(' '),
    }),
  },
}

export const Kind1ListLandscapeSmall: Story = {
  args: {
    event: fakeEventMeta({
      kind: 1,
      pubkey: 'p1',
      content: [
        'List landscape images',
        'https://placehold.co/400x100.jpg',
        'https://placehold.co/600x120.jpg',
        'https://placehold.co/800x150.jpg',
      ].join(' '),
    }),
  },
}

export const Kind1ListPortrait: Story = {
  args: {
    event: fakeEventMeta({
      kind: 1,
      pubkey: 'p1',
      content: [
        'List portrait images',
        'https://placehold.co/720x1080.jpg',
        'https://placehold.co/900x1350.jpg',
        'https://placehold.co/1000x1500.jpg',
      ].join(' '),
    }),
  },
}

export const Kind1ListMixed: Story = {
  args: {
    event: fakeEventMeta({
      kind: 1,
      pubkey: 'p1',
      content: [
        'Mixed images',
        'https://placehold.co/1200x675.jpg', // landscape
        'https://placehold.co/800x1200.jpg', // portrait
        'https://placehold.co/1024x1024.jpg', // square
        'https://placehold.co/1600x900.jpg', // landscape
        'https://placehold.co/900x1350.jpg', // portrait
      ].join(' '),
    }),
  },
}

export const Kind1ListMixed2: Story = {
  args: {
    event: fakeEventMeta({
      kind: 1,
      pubkey: 'p1',
      content: [
        'Mixed 2 images',
        'https://placehold.co/100x600.jpg',
        'https://placehold.co/200x600.jpg',
        'https://placehold.co/400x800.jpg',
        'https://placehold.co/600x1200.jpg',
      ].join(' '),
    }),
  },
}

export const Kind1ListMixed3: Story = {
  args: {
    event: fakeEventMeta({
      kind: 1,
      pubkey: 'p1',
      content: [
        'Mixed 3 images',
        'https://placehold.co/2400x2600.jpg',
        'https://placehold.co/2600x2800.jpg',
        'https://placehold.co/2800x2200.jpg',
        'https://placehold.co/2600x2400.jpg',
        'https://placehold.co/2800x2800.jpg',
        'https://placehold.co/3200x2800.jpg',
      ].join(' '),
    }),
  },
}

export const Kind1ListMixed3SlowWithoutImeta: Story = {
  args: {
    event: fakeEventMeta({
      kind: 1,
      pubkey: 'p1',
      content: [
        'Mixed 3 images',
        'https://placehold.co/2400x2601.jpg',
        'https://placehold.co/2600x2801.jpg',
        'https://placehold.co/2800x2201.jpg',
        'https://placehold.co/2600x2401.jpg',
        'https://placehold.co/2800x2801.jpg',
        'https://placehold.co/3200x2801.jpg',
      ].join(' '),
      tags: [],
    }),
  },
  parameters: {
    msw: {
      handlers: [
        http.get(getImgProxyUrl('feed_img', 'https://placehold.co/2400x2601.jpg'), async () => {
          await new Promise((resolve) => setTimeout(resolve, 1000))
          return passthrough()
        }),
        http.get(getImgProxyUrl('feed_img', 'https://placehold.co/2600x2801.jpg'), async () => {
          await new Promise((resolve) => setTimeout(resolve, 1500))
          return passthrough()
        }),
        http.get(getImgProxyUrl('feed_img', 'https://placehold.co/2800x2201.jpg'), async () => {
          await new Promise((resolve) => setTimeout(resolve, 2000))
          return passthrough()
        }),
        http.get(getImgProxyUrl('feed_img', 'https://placehold.co/2600x2401.jpg'), async () => {
          await new Promise((resolve) => setTimeout(resolve, 3500))
          return passthrough()
        }),
        http.get(getImgProxyUrl('feed_img', 'https://placehold.co/2800x2801.jpg'), async () => {
          await new Promise((resolve) => setTimeout(resolve, 4000))
          return passthrough()
        }),
        http.get(getImgProxyUrl('feed_img', 'https://placehold.co/3200x2801.jpg'), async () => {
          await new Promise((resolve) => setTimeout(resolve, 4500))
          return passthrough()
        }),
      ],
    },
  },
}

export const Kind1ListMixed3SlowImeta: Story = {
  args: {
    event: fakeEventMeta({
      kind: 1,
      pubkey: 'p1',
      content: [
        'Mixed 3 images',
        'https://placehold.co/2400x2601.jpg',
        'https://placehold.co/2600x2801.jpg',
        'https://placehold.co/2800x2201.jpg',
        'https://placehold.co/2600x2401.jpg',
        'https://placehold.co/2800x2801.jpg',
        'https://placehold.co/3200x2801.jpg',
      ].join(' '),
      tags: [
        ['imeta', 'url https://placehold.co/2400x2601.jpg', 'm image/jpeg', 'dim 2400x2601'],
        ['imeta', 'url https://placehold.co/2600x2801.jpg', 'm image/jpeg', 'dim 2600x2801'],
        ['imeta', 'url https://placehold.co/2800x2201.jpg', 'm image/jpeg', 'dim 2800x2201'],
        ['imeta', 'url https://placehold.co/2600x2401.jpg', 'm image/jpeg', 'dim 2600x2401'],
        ['imeta', 'url https://placehold.co/2800x2801.jpg', 'm image/jpeg', 'dim 2800x2801'],
        ['imeta', 'url https://placehold.co/3200x2801.jpg', 'm image/jpeg', 'dim 3200x2801'],
      ],
    }),
  },
  parameters: {
    msw: {
      handlers: [
        http.get(getImgProxyUrl('feed_img', 'https://placehold.co/2400x2601.jpg'), async () => {
          await new Promise((resolve) => setTimeout(resolve, 1000))
          return passthrough()
        }),
        http.get(getImgProxyUrl('feed_img', 'https://placehold.co/2600x2801.jpg'), async () => {
          await new Promise((resolve) => setTimeout(resolve, 1500))
          return passthrough()
        }),
        http.get(getImgProxyUrl('feed_img', 'https://placehold.co/2800x2201.jpg'), async () => {
          await new Promise((resolve) => setTimeout(resolve, 2000))
          return passthrough()
        }),
        http.get(getImgProxyUrl('feed_img', 'https://placehold.co/2600x2401.jpg'), async () => {
          await new Promise((resolve) => setTimeout(resolve, 3500))
          return passthrough()
        }),
        http.get(getImgProxyUrl('feed_img', 'https://placehold.co/2800x2801.jpg'), async () => {
          await new Promise((resolve) => setTimeout(resolve, 4000))
          return passthrough()
        }),
        http.get(getImgProxyUrl('feed_img', 'https://placehold.co/3200x2801.jpg'), async () => {
          await new Promise((resolve) => setTimeout(resolve, 4500))
          return passthrough()
        }),
      ],
    },
  },
}

export const Kind1ListMixed4: Story = {
  args: {
    event: fakeEventMeta({
      kind: 1,
      pubkey: 'p1',
      content: [
        'Mixed 4 images',
        'https://placehold.co/1077x616.jpg',
        'https://placehold.co/1492x670.jpg',
        'https://placehold.co/423x472.jpg',
        'https://placehold.co/886x584.jpg',
        'https://placehold.co/1290x1290.jpg',
      ].join(' '),
    }),
  },
}

export const Kind1ImetaPortrait: Story = {
  args: {
    event: fakeEventMeta({
      kind: 1,
      pubkey: 'p1',
      content: 'https://placehold.co/2280x2922.jpg',
      tags: [['imeta', 'url https://placehold.co/2280x2922.jpg', 'x 123', 'm image/jpeg', 'dim 2280x2922']],
    }),
  },
}
