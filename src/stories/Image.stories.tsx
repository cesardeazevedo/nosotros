import { Image } from '@/components/elements/Content/Image/Image'
import { CenteredContainer } from '@/components/elements/Layouts/CenteredContainer'
import { PaperContainer } from '@/components/elements/Layouts/PaperContainer'
import { ContentProvider } from '@/components/providers/ContentProvider'
import { NoteProvider } from '@/components/providers/NoteProvider'
import { fakeEventMeta } from '@/utils/faker'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { createStore, Provider } from 'jotai'
import { http, HttpResponse, passthrough } from 'msw'

type CustomImage = React.ComponentProps<typeof Image> & { tags?: string[][] }

const meta = {
  title: 'Components/Content/Image',
  component: Image,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story, { args }) => {
      const tags = (args as { tags?: string[][] }).tags || []
      const event = fakeEventMeta({
        kind: 1,
        content: args.src,
        tags,
      })
      return (
        <Provider store={createStore()}>
          <CenteredContainer margin>
            <PaperContainer>
              <div style={{ padding: 24, maxWidth: 400 }}>
                <NoteProvider value={{ event }}>
                  <ContentProvider value={{}}>
                    <Story />
                  </ContentProvider>
                </NoteProvider>
              </div>
            </PaperContainer>
          </CenteredContainer>
        </Provider>
      )
    },
  ],
  args: {
    src: 'https://placehold.co/800x600.jpg',
    proxy: false,
  },
} satisfies Meta<CustomImage>

export default meta
type Story = StoryObj<typeof meta>

export const Landscape: Story = {
  args: {
    src: 'https://placehold.co/1200x675.jpg',
  },
}

export const Portrait: Story = {
  args: {
    src: 'https://placehold.co/800x1200.jpg',
  },
}

export const Square: Story = {
  args: {
    src: 'https://placehold.co/1024x1024.jpg',
  },
}

export const WithProxy: Story = {
  args: {
    src: 'https://placehold.co/800x600.jpg',
    proxy: true,
  },
}

export const ProxyBlocked: Story = {
  args: {
    src: 'https://placehold.co/832x1458.jpg',
    proxy: true,
  },
  parameters: {
    msw: {
      handlers: [
        http.get('*/proxy/feed_img/*', () => {
          return HttpResponse.error()
        }),
      ],
    },
  },
}

export const DirectUrlBlocked: Story = {
  args: {
    src: 'https://placehold.co/832x1456.jpg',
    proxy: false,
  },
  parameters: {
    msw: {
      handlers: [
        http.get('https://placehold.co/832x1456.jpg', () => {
          return HttpResponse.error()
        }),
      ],
    },
  },
}

export const ProxyBlockedFallbackWorks: Story = {
  args: {
    src: 'https://placehold.co/800x600.jpg',
    proxy: true,
  },
  parameters: {
    msw: {
      handlers: [
        http.get('*/proxy/feed_img/*', () => {
          return HttpResponse.error()
        }),
      ],
    },
  },
}

export const Cover: Story = {
  args: {
    src: 'https://placehold.co/1200x675.jpg',
    cover: true,
  },
}

export const WithImeta: Story = {
  args: {
    src: 'https://placehold.co/1600x900.jpg',
    tags: [['imeta', 'url https://placehold.co/1600x900.jpg', 'm image/jpeg', 'dim 1600x900']],
  },
}

export const WithImetaSlow: Story = {
  args: {
    src: 'https://placehold.co/1600x900.jpg',
    tags: [['imeta', 'url https://placehold.co/1600x900.jpg', 'm image/jpeg', 'dim 1600x900']],
  },
  parameters: {
    msw: {
      handlers: [
        http.get('https://placehold.co/1600x900.jpg', async () => {
          await new Promise((resolve) => setTimeout(resolve, 2000))
          return passthrough()
        }),
      ],
    },
  },
}
