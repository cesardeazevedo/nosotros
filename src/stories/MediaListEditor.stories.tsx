import type { UploadFile } from '@/atoms/upload.atoms'
import { filesAtom } from '@/atoms/upload.atoms'
import { CenteredContainer } from '@/components/elements/Layouts/CenteredContainer'
import { PaperContainer } from '@/components/elements/Layouts/PaperContainer'
import { MediaListEditor } from '@/components/elements/Media/MediaListEditor'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { createStore, Provider } from 'jotai'

const createMockImageFile = (name: string, src: string): UploadFile => ({
  src,
  alt: name,
  title: name,
  file: new File([], `${name}.jpg`, { type: 'image/jpeg' }),
  tags: [],
  sha256: '',
  uploading: false,
  error: '',
})

const createMockVideoFile = (name: string, src: string): UploadFile => ({
  src,
  alt: name,
  file: new File([], `${name}.mp4`, { type: 'video/mp4' }),
  tags: [],
  sha256: '',
  uploading: false,
  error: '',
})

const createStoreWithFiles = (files: UploadFile[]) => {
  const store = createStore()
  store.set(filesAtom, files)
  return store
}

const meta = {
  title: 'Components/MediaListEditor',
  component: MediaListEditor,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story, { args }) => {
      const store = createStoreWithFiles(args.files || [])
      return (
        <Provider store={store}>
          <CenteredContainer margin>
            <PaperContainer>
              <div style={{ padding: 24 }}>
                <Story />
              </div>
            </PaperContainer>
          </CenteredContainer>
        </Provider>
      )
    },
  ],
  args: {
    files: [],
  },
} satisfies Meta<{ files: UploadFile[] }>

export default meta
type Story = StoryObj<typeof meta>

export const SingleLandscapeImage: Story = {
  args: {
    files: [createMockImageFile('Single Image', 'https://placehold.co/800x600')],
  },
}
export const SinglePortraitImage: Story = {
  args: {
    files: [createMockImageFile('Single Image', 'https://placehold.co/500x800')],
  },
}

export const SingleLandscapeVideo: Story = {
  args: {
    files: [
      createMockVideoFile(
        'Single Video',
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      ),
    ],
  },
}

export const SinglePortraitVideo: Story = {
  args: {
    files: [
      createMockVideoFile(
        'Portrait Video',
        'https://blossom.nosotros.app/eaf519203c5bb57aa0b063970838925a80422716d40d95114020b740bb88bbe4.mp4',
      ),
    ],
  },
}

export const TwoImages: Story = {
  args: {
    files: [
      createMockImageFile('First Image', 'https://placehold.co/800x600'),
      createMockImageFile('Second Image', 'https://placehold.co/640x480'),
    ],
  },
}

export const ThreeImagesCarousel: Story = {
  args: {
    files: [
      createMockImageFile('First Image', 'https://placehold.co/800x600'),
      createMockImageFile('Second Image', 'https://placehold.co/640x480'),
      createMockImageFile('Third Image', 'https://placehold.co/500x500'),
    ],
  },
}

export const MixedMedia: Story = {
  args: {
    files: [
      createMockImageFile('Image', 'https://placehold.co/800x600'),
      createMockVideoFile('Video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4'),
      createMockImageFile('Another Image', 'https://placehold.co/640x480'),
    ],
  },
}

export const UploadingFiles: Story = {
  args: {
    files: [
      { ...createMockImageFile('Uploading Image', 'https://placehold.co/800x600'), uploading: true },
      {
        ...createMockVideoFile(
          'Normal Video',
          'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        ),
        uploading: true,
      },
    ],
  },
}

export const WithErrors: Story = {
  args: {
    files: [
      createMockImageFile('Normal Image', 'https://placehold.co/800x600'),
      { ...createMockImageFile('Error Image', 'https://placehold.co/640x480'), error: 'Upload failed' },
      createMockVideoFile(
        'Normal Video',
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      ),
    ],
  },
}

export const PairWithPortraitVideo: Story = {
  args: {
    files: [
      createMockVideoFile(
        'Portrait Video',
        'https://blossom.nosotros.app/eaf519203c5bb57aa0b063970838925a80422716d40d95114020b740bb88bbe4.mp4',
      ),
      createMockImageFile('Square Image', 'https://placehold.co/500x500'),
    ],
  },
}
