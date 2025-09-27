import { VideoNodeViewWrapper } from '@/components/elements/Content/Video/VideoNodeViewWrapper'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { NodeViewProps } from '@tiptap/react'
import type { VideoAttributes } from 'nostr-editor'

const createMockNodeViewProps = (videoAttrs: Partial<VideoAttributes>): NodeViewProps => {
  const mockNode = {
    attrs: {
      src: '',
      alt: '',
      title: '',
      tags: [],
      sha256: '',
      uploading: false,
      error: '',
      ...videoAttrs,
    },
    type: {
      spec: {
        draggable: true,
      },
    },
  }

  return {
    decorations: [],
    view: {} as NodeViewProps['view'],
    getPos: () => 0,
    innerDecorations: {} as NodeViewProps['innerDecorations'],
    editor: {} as NodeViewProps['editor'],
    extension: {} as NodeViewProps['extension'],
    HTMLAttributes: {},
    updateAttributes: () => {},
    deleteNode: () => {},
    node: mockNode as unknown as NodeViewProps['node'],
    selected: false,
  }
}

const meta = {
  title: 'Components/VideoEditor',
  component: VideoNodeViewWrapper,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: createMockNodeViewProps({
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    alt: 'Sample video',
  }),
} satisfies Meta<typeof VideoNodeViewWrapper>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Portrait: Story = {
  args: createMockNodeViewProps({
    src: 'https://blossom.nosotros.app/eaf519203c5bb57aa0b063970838925a80422716d40d95114020b740bb88bbe4.mp4',
    alt: 'Portrait video',
  }),
}

export const Uploading: Story = {
  args: createMockNodeViewProps({
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    alt: 'Uploading video',
    uploading: true,
  }),
}

export const UploadingPortrait: Story = {
  args: createMockNodeViewProps({
    src: 'https://blossom.nosotros.app/eaf519203c5bb57aa0b063970838925a80422716d40d95114020b740bb88bbe4.mp4',
    alt: 'Uploading video',
    uploading: true,
  }),
}

export const WithError: Story = {
  args: createMockNodeViewProps({
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    alt: 'Video with error',
    error: 'Failed to upload video',
  }),
}

export const Wide: Story = {
  args: createMockNodeViewProps({
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    alt: 'Wide video',
  }),
}

export const Short: Story = {
  args: createMockNodeViewProps({
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    alt: 'Short video',
  }),
}
