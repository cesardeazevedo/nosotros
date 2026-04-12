import { NostrEventFeedItem } from '@/components/elements/Event/NostrEventFeedItem'
import { CenteredContainer } from '@/components/elements/Layouts/CenteredContainer'
import { Kind } from '@/constants/kinds'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { setEventData } from '@/hooks/query/queryUtils'
import { fakeEventMeta, fakeText } from '@/utils/faker'
import type { Meta, StoryObj } from '@storybook/react-vite'

type FeedStoryProps = {
  items: NostrEventDB[]
  preload?: NostrEventDB[]
}

const createUser = (pubkey: string, displayName: string, nip05?: string) =>
  fakeEventMeta({
    kind: Kind.Metadata,
    pubkey,
    content: JSON.stringify({
      display_name: displayName,
      picture: `https://placehold.co/100x100?text=${displayName.charAt(0)}`,
      about:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante venenatis dapibus posuere velit aliquet.',
      ...(nip05 ? { nip05 } : {}),
    }),
  })

const createTextNote = (id: string, pubkey: string, content: string) =>
  fakeEventMeta({
    id,
    kind: Kind.Text,
    pubkey,
    content,
  })

const createPublicMessage = (id: string, pubkey: string, content: string, targetPubkey: string) =>
  fakeEventMeta({
    id,
    kind: Kind.PublicMessage,
    pubkey,
    content,
    tags: [['p', targetPubkey]],
  })

const createTextReply = (id: string, pubkey: string, content: string, root: NostrEventDB, parent?: NostrEventDB) =>
  fakeEventMeta({
    id,
    kind: Kind.Text,
    pubkey,
    content,
    tags: [
      ['e', root.id, '', 'root', root.pubkey],
      ...(parent ? [['e', parent.id, '', 'reply', parent.pubkey] as string[]] : []),
      ['p', root.pubkey],
      ...(parent ? [['p', parent.pubkey] as string[]] : []),
    ],
  })

const createArticle = (id: string, pubkey: string, title: string, summary: string) =>
  fakeEventMeta({
    id,
    kind: Kind.Article,
    pubkey,
    content: `# ${title}

${summary}

This story is here to exercise the feed article rendering path.`,
    tags: [
      ['d', id],
      ['title', title],
      ['image', 'https://placehold.co/1200x630'],
      ['summary', summary],
    ],
  })

const createMediaPost = (kind: Kind.Media | Kind.Video | Kind.ShortVideo, id: string, pubkey: string, urls: string[]) =>
  fakeEventMeta({
    id,
    kind,
    pubkey,
    content: '',
    tags: urls.map((url, index) => [
      'imeta',
      `url ${url}`,
      `m ${url.endsWith('.mp4') ? 'video/mp4' : 'image/jpeg'}`,
      `alt Media ${index + 1}`,
      url.endsWith('.mp4') ? 'dim 1280x720' : 'dim 1200x900',
    ]),
  })

const createFollowList = (id: string, pubkey: string, followed: string[], topics: string[]) =>
  fakeEventMeta({
    id,
    kind: Kind.Follows,
    pubkey,
    content: '',
    tags: [...followed.map((value) => ['p', value] as string[]), ...topics.map((value) => ['t', value] as string[])],
  })

const createRepost = (id: string, pubkey: string, innerEvent: NostrEventDB) =>
  fakeEventMeta({
    id,
    kind: Kind.Repost,
    pubkey,
    content: JSON.stringify((({ metadata, ...event }) => event)(innerEvent)),
    tags: [
      ['p', innerEvent.pubkey],
      ['e', innerEvent.id],
    ],
  })

const createZapReceipt = (id: string, pubkey: string, targetPubkey: string, senderPubkey: string) =>
  fakeEventMeta({
    id,
    kind: Kind.ZapReceipt,
    pubkey,
    content: '',
    tags: [
      ['p', targetPubkey],
      ['P', senderPubkey],
    ],
  })

const createEmojiSet = (id: string, pubkey: string, title: string, description: string) =>
  fakeEventMeta({
    id,
    kind: Kind.EmojiSets,
    pubkey,
    content: '',
    tags: [
      ['d', id],
      ['title', title],
      ['description', description],
      ['emoji', 'spark', 'https://placehold.co/64x64.png'],
      ['emoji', 'ship', 'https://placehold.co/64x64.jpg'],
    ],
  })

const createListSet = (
  kind: Kind.BookmarkSets,
  id: string,
  pubkey: string,
  title: string,
  description: string,
  members: string[],
) =>
  fakeEventMeta({
    id,
    kind,
    pubkey,
    content: '',
    tags: [
      ['d', id],
      ['title', title],
      ['description', description],
      ['image', 'https://placehold.co/800x400'],
      ...members.map((member) => ['p', member] as string[]),
    ],
  })

const setEvents = (events: NostrEventDB[] | undefined) => {
  events?.forEach((event) => setEventData(event))
}

const FeedPreview = (props: FeedStoryProps) => (
  <>
    {props.items.map((event) => (
      <NostrEventFeedItem key={event.id} event={event} />
    ))}
  </>
)

const users = [
  createUser('p1', 'Alice', 'alice@nostr.com'),
  createUser('p2', 'Bruno'),
  createUser('p3', 'Cora'),
  createUser('p4', 'Dina', 'dina@nostr.com'),
  createUser('p5', 'Elliot'),
  createUser('p6', 'Farah'),
]

const kind1Items = [
  createTextNote('kind1-note-1', 'p1', fakeText(1, 3, 12)),
  createTextNote('kind1-note-2', 'p2', fakeText(7, 8, 14)),
  createTextNote(
    'kind1-note-3',
    'p3',
    `${fakeText(2, 5, 12)} https://placehold.co/1024x768.jpg https://placehold.co/900x1200.jpg`,
  ),
  createTextNote(
    'kind1-note-4',
    'p4',
    `${fakeText(2, 5, 12)} https://placehold.co/1200x900.jpg https://placehold.co/900x1200.jpg https://placehold.co/1400x900.jpg`,
  ),
]

const kind1ThreadRoots = [
  createTextNote('kind1-thread-root-1', 'p1', fakeText(1, 3, 10)),
  createTextNote('kind1-thread-root-2', 'p2', fakeText(1, 3, 10)),
  createTextNote('kind1-thread-root-3', 'p3', fakeText(1, 3, 10)),
]

const kind1ThreadItems = [
  createTextReply('kind1-thread-reply-1', 'p4', fakeText(1, 2, 10), kind1ThreadRoots[0]),
  createTextReply('kind1-thread-reply-2', 'p5', fakeText(1, 2, 10), kind1ThreadRoots[1]),
  createTextReply('kind1-thread-reply-3', 'p6', fakeText(1, 2, 10), kind1ThreadRoots[2]),
]

const kind1ThreadsItems = [
  createTextReply('kind1-thread-reply-reply-1', 'p4', fakeText(1, 2, 10), kind1ThreadRoots[0], kind1ThreadItems[0]),
  createTextReply('kind1-thread-reply-reply-2', 'p5', fakeText(1, 2, 10), kind1ThreadRoots[1], kind1ThreadItems[1]),
  createTextReply('kind1-thread-reply-reply-3', 'p6', fakeText(1, 2, 10), kind1ThreadRoots[2], kind1ThreadItems[2]),
]

const kind24Items = [
  createPublicMessage('kind24-message-1', 'p1', fakeText(1, 3, 10), 'p2'),
  createPublicMessage('kind24-message-2', 'p2', fakeText(1, 3, 10), 'p3'),
  createPublicMessage('kind24-message-3', 'p3', fakeText(1, 3, 10), 'p1'),
]

const kind30023Items = [
  createArticle(
    'kind30023-article-1',
    'p1',
    'Route Masking For Parallel Surfaces',
    'Keeping the feed mounted while layered routes open in parallel.',
  ),
  createArticle(
    'kind30023-article-2',
    'p2',
    'Designing Feed Surfaces',
    'A composition-first approach for feed, root, and quote surfaces.',
  ),
  createArticle(
    'kind30023-article-3',
    'p3',
    'UI Revamp Notes For The Router-Based Feed Shell, Column Surfaces, Masked Navigation, And The Long Transition Away From The Old Deck Model',
    'A running log of layout decisions, interaction edge cases, composition rules, route-masking tradeoffs, nested column constraints, and the visual consistency work required to make the new shell feel fast, readable, and structurally coherent across feed, root, and quote surfaces.',
  ),
]

const kind20Items = [
  createMediaPost(Kind.Media, 'kind20-media-1', 'p1', ['https://placehold.co/1024x768']),
  createMediaPost(Kind.Media, 'kind20-media-2', 'p2', [
    'https://placehold.co/900x1200',
    'https://placehold.co/1280x720',
  ]),
  createMediaPost(Kind.Media, 'kind20-media-3', 'p3', [
    'https://placehold.co/1200x900',
    'https://placehold.co/900x1200',
    'https://placehold.co/1400x900',
  ]),
]

const kind21Items = [
  createMediaPost(Kind.Video, 'kind21-video-1', 'p4', [
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  ]),
  createMediaPost(Kind.Video, 'kind21-video-2', 'p5', [
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  ]),
  createMediaPost(Kind.Video, 'kind21-video-3', 'p6', [
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
  ]),
]

const kind22Items = [
  createMediaPost(Kind.ShortVideo, 'kind22-short-video-1', 'p1', [
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  ]),
  createMediaPost(Kind.ShortVideo, 'kind22-short-video-2', 'p2', [
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  ]),
  createMediaPost(Kind.ShortVideo, 'kind22-short-video-3', 'p3', [
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
  ]),
]

const repostInnerText = [
  createTextNote('kind6-inner-text-1', 'p4', fakeText(1, 3, 10)),
  createTextNote('kind6-inner-text-2', 'p5', fakeText(1, 3, 10)),
  createTextNote('kind6-inner-text-3', 'p6', fakeText(1, 3, 10)),
]

const kind6Items = [
  createRepost('kind6-repost-1', 'p1', repostInnerText[0]),
  createRepost('kind6-repost-2', 'p2', kind30023Items[0]),
  createRepost('kind6-repost-3', 'p3', kind20Items[0]),
]

const kind3Items = [
  createFollowList('kind3-follows-1', 'p1', ['p2', 'p3', 'p4'], ['nostr', 'ui']),
  createFollowList('kind3-follows-2', 'p2', ['p1', 'p5', 'p6'], ['design', 'feed']),
  createFollowList('kind3-follows-3', 'p3', ['p1', 'p2', 'p4'], ['media', 'routing']),
]

const kind9735Items = [
  createZapReceipt('kind9735-zap-1', 'p4', 'p1', 'p2'),
  createZapReceipt('kind9735-zap-2', 'p5', 'p2', 'p3'),
  createZapReceipt('kind9735-zap-3', 'p6', 'p3', 'p1'),
]

const kind30030Items = [
  createEmojiSet('kind30030-emoji-set-1', 'p1', 'Feed Pack', 'A compact emoji pack for feed experiments.'),
  createEmojiSet('kind30030-emoji-set-2', 'p2', 'Motion Pack', 'Emoji assets for motion-heavy post previews.'),
  createEmojiSet('kind30030-emoji-set-3', 'p3', 'UI Pack', 'Emoji assets for route and layout demos.'),
]

const kind30003Items = [
  createListSet(
    Kind.BookmarkSets,
    'kind30003-bookmark-set-1',
    'p4',
    'Weekend Reads',
    'Three links worth revisiting after the UI revamp.',
    ['p1', 'p2', 'p3'],
  ),
  createListSet(
    Kind.BookmarkSets,
    'kind30003-bookmark-set-2',
    'p5',
    'Reference Set',
    'Reusable references for the feed and route rewrite.',
    ['p2', 'p3', 'p4'],
  ),
  createListSet(
    Kind.BookmarkSets,
    'kind30003-bookmark-set-3',
    'p6',
    'Research Set',
    'Links and people relevant to the column-based UI work.',
    ['p1', 'p4', 'p5'],
  ),
]

const meta = {
  title: 'Components/NostrEventFeedItem',
  component: FeedPreview,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  loaders: [
    () => {
      setEvents(users)
    },
  ],
  decorators: [
    (Story, { args }) => {
      setEvents(args.preload)
      setEvents(args.items)

      return (
        <CenteredContainer margin>
          <Story />
        </CenteredContainer>
      )
    },
  ],
  args: {
    items: kind1Items,
    preload: [],
  },
} satisfies Meta<typeof FeedPreview>

export default meta
type Story = StoryObj<typeof meta>

export const Kind0Metadata: Story = {
  args: {
    items: [users[0], users[1], users[2]],
  },
}

export const Kind1Text: Story = {
  args: {
    items: kind1Items,
  },
}

export const Kind1TextThread: Story = {
  args: {
    items: kind1ThreadItems,
    preload: kind1ThreadRoots,
  },
}

export const Kind1TextThreads: Story = {
  args: {
    items: kind1ThreadsItems,
    preload: [...kind1ThreadRoots, ...kind1ThreadItems],
  },
}

export const Kind3Follows: Story = {
  args: {
    items: kind3Items,
  },
}

export const Kind24PublicMessage: Story = {
  args: {
    items: kind24Items,
  },
}

export const Kind6Repost: Story = {
  args: {
    items: kind6Items,
    preload: [...repostInnerText, kind30023Items[0], kind20Items[0]],
  },
}

export const Kind20Media: Story = {
  args: {
    items: kind20Items,
  },
}

export const Kind21Video: Story = {
  args: {
    items: kind21Items,
  },
}

export const Kind22ShortVideo: Story = {
  args: {
    items: kind22Items,
  },
}

export const Kind9735ZapReceipt: Story = {
  args: {
    items: kind9735Items,
  },
}

export const Kind30003BookmarkSets: Story = {
  args: {
    items: kind30003Items,
  },
}

export const Kind30023Article: Story = {
  args: {
    items: kind30023Items,
  },
}

export const Kind30030EmojiSets: Story = {
  args: {
    items: kind30030Items,
  },
}
