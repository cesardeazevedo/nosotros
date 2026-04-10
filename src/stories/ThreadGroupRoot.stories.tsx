import type { ThreadBranch, ThreadGroup } from '@/atoms/threads.atoms'
import { CenteredContainer } from '@/components/elements/Layouts/CenteredContainer'
import { PaperContainer } from '@/components/elements/Layouts/PaperContainer'
import { ThreadGroupRoot } from '@/components/elements/Threads/ThreadGroupRoot'
import { Kind } from '@/constants/kinds'
import { queryKeys } from '@/hooks/query/queryKeys'
import { appendEventToQuery, setEventData } from '@/hooks/query/queryUtils'
import { fakeEventMeta } from '@/utils/faker'
import type { Meta, StoryObj } from '@storybook/react-vite'

const users = [
  fakeEventMeta({
    id: 'u1',
    kind: 0,
    pubkey: 'p1',
    content: JSON.stringify({ display_name: 'Root', picture: 'https://placehold.co/100x100' }),
  }),
  fakeEventMeta({
    id: 'u2',
    kind: 0,
    pubkey: 'p2',
    content: JSON.stringify({ display_name: 'Alice', picture: 'https://placehold.co/100x100' }),
  }),
  fakeEventMeta({
    id: 'u3',
    kind: 0,
    pubkey: 'p3',
    content: JSON.stringify({ display_name: 'Bob', picture: 'https://placehold.co/100x100' }),
  }),
  fakeEventMeta({
    id: 'u4',
    kind: 0,
    pubkey: 'p4',
    content: JSON.stringify({ display_name: 'Charlie 1', picture: 'https://placehold.co/100x100' }),
  }),
  fakeEventMeta({
    id: 'u5',
    kind: 0,
    pubkey: 'p5',
    content: JSON.stringify({ display_name: 'Charlie 2', picture: 'https://placehold.co/100x100' }),
  }),
  fakeEventMeta({
    id: 'u6',
    kind: 0,
    pubkey: 'p6',
    content: JSON.stringify({ display_name: 'Eve', picture: 'https://placehold.co/100x100' }),
  }),
]

const createReplyTags = (rootId: string, parentId: string) => {
  return [
    ['e', rootId, '', 'root'],
    ['e', parentId, '', 'reply'],
  ]
}

const rootId = 't1-root'

const root = fakeEventMeta({
  id: rootId,
  kind: 1,
  pubkey: 'p1',
  created_at: 1000,
  content: 'Root 1 - Start of thread',
})

const replies = [
  fakeEventMeta({
    id: 't1-r2',
    kind: 1,
    pubkey: 'p2',
    created_at: 1002,
    content: 'Alice 1 - Reply to root',
    tags: createReplyTags(rootId, rootId),
  }),
  fakeEventMeta({
    id: 't1-r3',
    kind: 1,
    pubkey: 'p2',
    created_at: 1003,
    content: 'Alice 2 - Reply to Alice 1',
    tags: createReplyTags(rootId, 't1-r2'),
  }),
  fakeEventMeta({
    id: 't1-r4',
    kind: 1,
    pubkey: 'p2',
    created_at: 1004,
    content: 'Alice 3 - Reply to Alice 2',
    tags: createReplyTags(rootId, 't1-r3'),
  }),
  fakeEventMeta({
    id: 't1-r5',
    kind: 1,
    pubkey: 'p3',
    created_at: 1005,
    content: 'Bob 1 - Reply to root',
    tags: createReplyTags(rootId, rootId),
  }),
  fakeEventMeta({
    id: 't1-r6',
    kind: 1,
    pubkey: 'p3',
    created_at: 1006,
    content: 'Bob 2 - Reply to Bob 1',
    tags: createReplyTags(rootId, 't1-r5'),
  }),
  fakeEventMeta({
    id: 't1-r7',
    kind: 1,
    pubkey: 'p3',
    created_at: 1007,
    content: 'Bob 3 - Reply to Bob 2',
    tags: createReplyTags(rootId, 't1-r6'),
  }),
  fakeEventMeta({
    id: 't1-r8',
    kind: 1,
    pubkey: 'p4',
    created_at: 1008,
    content: 'Charlie 1 - Reply to root',
    tags: createReplyTags(rootId, rootId),
  }),
  fakeEventMeta({
    id: 't1-r9',
    kind: 1,
    pubkey: 'p5',
    created_at: 1009,
    content: 'Charlie 2 - Reply to Charlie 1',
    tags: createReplyTags(rootId, 't1-r8'),
  }),
  fakeEventMeta({
    id: 't1-r10',
    kind: 1,
    pubkey: 'p6',
    created_at: 1010,
    content: 'Eve 1 - Another reply to root',
    tags: createReplyTags(rootId, rootId),
  }),
]

const branches: ThreadBranch[] = replies.map((reply) => ({
  items: [{ type: 'reply' as const, eventId: reply.id, hasChildren: false }],
}))

const group: ThreadGroup = {
  rootId: rootId,
  branches,
}

const meta = {
  title: 'Components/Threads/ThreadGroupRoot',
  component: ThreadGroupRoot,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <CenteredContainer margin>
        <PaperContainer>
          <Story />
        </PaperContainer>
      </CenteredContainer>
    ),
  ],
  loaders: [
    () => {
      setEventData(root)
      users.forEach((user) => setEventData(user))
      replies.forEach((reply) => setEventData(reply))
      appendEventToQuery(queryKeys.tag('e', [rootId], Kind.Text), replies)
    },
  ],
} satisfies Meta<typeof ThreadGroupRoot>

export default meta
type Story = StoryObj<typeof meta>

export const FullThread: Story = {
  args: {
    group,
  },
}
