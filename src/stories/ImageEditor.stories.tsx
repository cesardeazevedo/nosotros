import { ImageNodeViewWrapper } from '@/components/elements/Content/Image/ImageNodeViewWrapper'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { NodeViewProps } from '@tiptap/react'
import type { ImageAttributes } from 'nostr-editor'

const createMockNodeViewProps = (imageAttrs: Partial<ImageAttributes>): NodeViewProps => {
  const mockNode = {
    attrs: {
      src: '',
      alt: '',
      title: '',
      tags: [],
      sha256: '',
      uploading: false,
      error: '',
      ...imageAttrs,
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
  title: 'Components/ImageEditor',
  component: ImageNodeViewWrapper,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: createMockNodeViewProps({
    src: 'https://placehold.co/800x600',
    alt: 'Sample image',
    title: 'Sample Title',
  }),
} satisfies Meta<typeof ImageNodeViewWrapper>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Selected: Story = {
  args: {
    selected: true,
  },
}

export const Uploading: Story = {
  args: createMockNodeViewProps({
    src: 'https://placehold.co/800x600',
    alt: 'Uploading image',
    title: 'Uploading Title',
    uploading: true,
  }),
}

export const WithError: Story = {
  args: createMockNodeViewProps({
    src: 'https://placehold.co/800x600',
    alt: 'Image with error',
    title: 'Error Title',
    error: 'Failed to upload image',
  }),
}

export const Portrait: Story = {
  args: createMockNodeViewProps({
    src: 'https://placehold.co/400x600',
    alt: 'Portrait image',
    title: 'Portrait Title',
  }),
}

export const Square: Story = {
  args: createMockNodeViewProps({
    src: 'https://placehold.co/500x500',
    alt: 'Square image',
    title: 'Square Title',
  }),
}

export const Wide: Story = {
  args: createMockNodeViewProps({
    src: 'https://placehold.co/1200x400',
    alt: 'Wide image',
    title: 'Wide Title',
  }),
}
