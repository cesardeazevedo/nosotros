import { NostrEventRoot } from '@/components/elements/Event/NostrEventRoot'
import { CenteredContainer } from '@/components/elements/Layouts/CenteredContainer'
import { PaperContainer } from '@/components/elements/Layouts/PaperContainer'
import { Button } from '@/components/ui/Button/Button'
import { setEventData } from '@/hooks/query/queryUtils'
import { fakeEventMeta } from '@/utils/faker'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

const user1 = fakeEventMeta({
  kind: 0,
  pubkey: 'p1',
  content: JSON.stringify({
    display_name: 'Video User',
    picture: 'https://placehold.co/100x100',
    about: 'User posting videos',
  }),
})

const meta = {
  title: 'Components/Video',
  component: NostrEventRoot,
  loaders: [
    () => {
      setEventData(user1)
    },
  ],
  decorators: [
    (Story, { args: { event } }) => {
      const [showEvent, setShowEvent] = useState(true)

      setEventData(event)

      return (
        <CenteredContainer margin>
          <Button variant='filled' onClick={() => setShowEvent(!showEvent)}>
            {showEvent ? 'Hide Note' : 'Show Note'}
          </Button>
          <br />
          <br />
          {showEvent && (
            <PaperContainer>
              <Story />
            </PaperContainer>
          )}
        </CenteredContainer>
      )
    },
  ],
  args: {
    open: true,
  },
} satisfies Meta<typeof NostrEventRoot>

export default meta
type Story = StoryObj<typeof meta>

export const VideoMP4: Story = {
  args: {
    event: fakeEventMeta({
      kind: 1,
      pubkey: 'p1',
      content:
        'Check out this video! https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
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
  },
}

export const VideoMP4NoIMETA: Story = {
  args: {
    event: fakeEventMeta({
      kind: 1,
      pubkey: 'p1',
      content:
        'Check out this video! https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    }),
  },
}

export const VideoWithMultipleMedia: Story = {
  args: {
    event: fakeEventMeta({
      kind: 1,
      pubkey: 'p1',
      content:
        'Post with multiple videos and images\n\nhttps://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4\n\nhttps://placehold.co/800x600.jpg\n\nhttps://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      tags: [
        [
          'imeta',
          'url https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
          'm video/mp4',
          'alt Elephants Dream video',
          'size 7340032',
          'dim 1280x720',
        ],
        ['imeta', 'url https://placehold.co/800x600', 'm image/jpeg', 'alt Sample image', 'size 128034', 'dim 800x600'],
        [
          'imeta',
          'url https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
          'm video/mp4',
          'alt Sintel video',
          'size 1048576',
          'dim 1280x720',
        ],
      ],
    }),
  },
}
