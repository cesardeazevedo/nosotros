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

const meta = {
  title: 'Components/NostrEventMediaWrapper',
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
