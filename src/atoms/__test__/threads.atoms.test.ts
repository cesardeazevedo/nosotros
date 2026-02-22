import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { queryClient } from '@/hooks/query/queryClient'
import { queryKeys } from '@/hooks/query/queryKeys'
import { fakeEventMeta } from '@/utils/faker'
import { queryClientAtom } from 'jotai-tanstack-query'
import { store } from '../store'
import { buildBranches, threadGroupsAtomFamily } from '../threads.atoms'

type NestedThreadBranch = [NostrEventDB, NestedThreadBranch?]
type ThreadBranchInput = NostrEventDB[] | NestedThreadBranch

const isEvent = (value: unknown): value is NostrEventDB => {
  return !!value && typeof value === 'object' && 'id' in value
}

const normalizeBranch = (branch: ThreadBranchInput): NostrEventDB[] => {
  if (Array.isArray(branch) && (branch.length === 0 || isEvent(branch[1]))) {
    return branch as NostrEventDB[]
  }

  const normalized: NostrEventDB[] = []
  let current: NestedThreadBranch | undefined = branch as NestedThreadBranch

  while (current) {
    normalized.push(current[0])
    current = current[1]
  }

  return normalized
}

const createThread = (root: NostrEventDB, branches: ThreadBranchInput[]) => {
  queryClient.setQueryData(queryKeys.event(root.id), [root])

  return branches.map((rawBranch) => {
    const branch = normalizeBranch(rawBranch)
    let parentId: string | null = null

    return branch.map((event) => {
      const tags = [['e', root.id, '', 'root']]
      if (parentId) {
        tags.push(['e', parentId, '', 'reply'])
      }
      const normalizedEvent = fakeEventMeta({ ...event, tags })

      parentId = normalizedEvent.id
      return normalizedEvent
    })
  })
}

const BRANCHES = [
  [
    fakeEventMeta({ id: 'branch1_1', created_at: 1 }),
    fakeEventMeta({ id: 'branch1_2', created_at: 2 }),
    fakeEventMeta({ id: 'branch1_3', created_at: 3 }),
    fakeEventMeta({ id: 'branch1_4', created_at: 4 }),
  ],
  // long thread
  [
    fakeEventMeta({ id: 'branch2_1', created_at: 1 }),
    fakeEventMeta({ id: 'branch2_2', created_at: 2 }),
    fakeEventMeta({ id: 'branch2_3', created_at: 3 }),
    fakeEventMeta({ id: 'branch2_4', created_at: 4 }),
    fakeEventMeta({ id: 'branch2_5', created_at: 5 }),
    fakeEventMeta({ id: 'branch2_6', created_at: 6 }),
    fakeEventMeta({ id: 'branch2_7', created_at: 7 }),
    fakeEventMeta({ id: 'branch2_8', created_at: 8 }),
    fakeEventMeta({ id: 'branch2_9', created_at: 9 }),
    fakeEventMeta({ id: 'branch2_10', created_at: 10 }),
  ],
  // Super long thread with lots of notes from peopl we follow
  // We want to assert that most of the the notes int he middle were collapsed
  [
    fakeEventMeta({ id: 'branch3_1', created_at: 1 }),
    fakeEventMeta({ id: 'branch3_2', created_at: 2 }),
    fakeEventMeta({ id: 'branch3_3', created_at: 3 }),
    fakeEventMeta({ id: 'branch3_4', created_at: 4 }),
    fakeEventMeta({ id: 'branch3_5', created_at: 5 }),
    fakeEventMeta({ id: 'branch3_6', created_at: 6 }),
    fakeEventMeta({ id: 'branch3_7', created_at: 7 }),
    fakeEventMeta({ id: 'branch3_8', created_at: 8 }),
    fakeEventMeta({ id: 'branch3_9', created_at: 9 }),
    fakeEventMeta({ id: 'branch3_10', created_at: 10 }),
    fakeEventMeta({ id: 'branch3_11', created_at: 11 }),
    fakeEventMeta({ id: 'branch3_12', created_at: 12 }),
    fakeEventMeta({ id: 'branch3_13', created_at: 13 }),
    fakeEventMeta({ id: 'branch3_14', created_at: 14 }),
    fakeEventMeta({ id: 'branch3_15', created_at: 15 }),
    fakeEventMeta({ id: 'branch3_16', created_at: 16 }),
  ],
  // Assert a deep nested thread
  [
    fakeEventMeta({ id: 'branch4_1', created_at: 1 }),
    [
      fakeEventMeta({ id: 'branch4_2', created_at: 2 }),
      [
        fakeEventMeta({ id: 'branch4_3', created_at: 3 }),
        [
          fakeEventMeta({ id: 'branch4_4', created_at: 4 }),
          [
            fakeEventMeta({ id: 'branch4_5', created_at: 5 }),
            [
              fakeEventMeta({ id: 'branch4_6', created_at: 6 }),
              [
                fakeEventMeta({ id: 'branch4_7', created_at: 7 }),
                [
                  fakeEventMeta({ id: 'branch4_8', created_at: 8 }),
                  [
                    fakeEventMeta({ id: 'branch4_9', created_at: 9 }),
                    [
                      fakeEventMeta({ id: 'branch4_10', created_at: 10 }),
                      [
                        fakeEventMeta({ id: 'branch4_11', created_at: 11 }),
                        [
                          fakeEventMeta({ id: 'branch4_12', created_at: 12 }),
                          [
                            fakeEventMeta({ id: 'branch4_13', created_at: 13 }),
                            [
                              fakeEventMeta({ id: 'branch4_14', created_at: 14 }),
                              [
                                fakeEventMeta({ id: 'branch4_15', created_at: 15 }),
                                [
                                  fakeEventMeta({ id: 'branch4_16', created_at: 16 }),
                                ]
                              ]
                            ]
                          ]
                        ]
                      ]
                    ]
                  ]
                ]
              ]
            ]
          ]
        ]
      ]
    ],
  ],
  [
    fakeEventMeta({ id: 'branch3_1', created_at: 9 }),
  ],
] as NostrEventDB[][]


describe('threads.atoms', () => {
  beforeEach(() => {
    queryClient.clear()
  })

  test('assert thread groups', () => {
    store.set(queryClientAtom, queryClient)
    const branches = createThread(fakeEventMeta({ id: 'root' }), BRANCHES)

    branches.flat().forEach((event) => {
      queryClient.setQueryData(queryKeys.event(event.id), [event])
    })

    const branch1_2 = branches[0][1]
    const branch1_4 = branches[0][3]
    const branch2_5 = branches[1][5]
    const branch2_10 = branches[1][8]

    const branch3_2 = branches[2][1]
    const branch3_4 = branches[2][3]
    const branch3_6 = branches[2][5]
    const branch3_8 = branches[2][7]
    const branch3_10 = branches[2][9]
    const branch3_12 = branches[2][11]
    const branch3_14 = branches[2][13]
    const branch3_16 = branches[2][15]

    const branch4_2 = branches[3][1]
    const branch4_4 = branches[3][3]
    const branch4_6 = branches[3][5]
    const branch4_8 = branches[3][7]
    const branch4_10 = branches[3][9]
    const branch4_12 = branches[3][11]
    const branch4_14 = branches[3][13]
    const branch4_16 = branches[3][15]

    const groups = store.get(
      threadGroupsAtomFamily({
        pages: [[
          // These are the notes we got from relays,
          branch1_2,
          branch1_4,
          branch2_5,
          branch2_10,
          // thread 3
          branch3_2,
          branch3_4,
          branch3_6,
          branch3_8,
          branch3_10,
          branch3_12,
          branch3_14,
          branch3_16,
          // thread 4
          branch4_2,
          branch4_4,
          branch4_6,
          branch4_8,
          branch4_10,
          branch4_12,
          branch4_14,
          branch4_16,
        ]],
        pageParams: [null],
      }),
    )

    expect(groups).toEqual([
      [
        {
          rootId: 'root',
          branches: [
            // branch 1 (we want to assert there were not summaries here as the thread was completed)
            {
              items: [
                { type: 'parent', eventId: 'branch1_1' },
                { type: 'reply', eventId: 'branch1_2', hasChildren: true },
                { type: 'parent', eventId: 'branch1_3' },
                { type: 'reply', eventId: 'branch1_4', hasChildren: false },
              ],
            },
            // branch 2
            {
              items: [
                { type: 'summary', eventIds: ['branch2_1', 'branch2_2', 'branch2_3', 'branch2_4'] },
                { type: 'parent', eventId: 'branch2_5' },
                { type: 'reply', eventId: 'branch2_6', hasChildren: true },
                { type: 'summary', eventIds: ['branch2_7'] },
                { type: 'parent', eventId: 'branch2_8' },
                { type: 'reply', eventId: 'branch2_9', hasChildren: false },
              ],
            },
            {
              items: [
                { type: 'parent', eventId: 'branch3_1' },
                { type: 'reply', eventId: 'branch3_2', hasChildren: true },
                {
                  type: 'summary',
                  eventIds: [
                    'branch3_3',
                    'branch3_4',
                    'branch3_5',
                    'branch3_6',
                    'branch3_7',
                    'branch3_8',
                    'branch3_9',
                    'branch3_10',
                    'branch3_11',
                    'branch3_12',
                    'branch3_13',
                    'branch3_14'
                  ]
                },
                { type: 'parent', eventId: 'branch3_15' },
                {
                  type: 'reply',
                  eventId: 'branch3_16',
                  hasChildren: false
                }
              ]
            },
            {
              items: [
                { type: 'parent', eventId: 'branch4_1' },
                { type: 'reply', eventId: 'branch4_2', hasChildren: true },
                {
                  type: 'summary',
                  eventIds: [
                    'branch4_3',
                    'branch4_4',
                    'branch4_5',
                    'branch4_6',
                    'branch4_7',
                    'branch4_8',
                    'branch4_9',
                    'branch4_10',
                    'branch4_11',
                    'branch4_12',
                    'branch4_13',
                    'branch4_14'
                  ]
                },
                { type: 'parent', eventId: 'branch4_15' },
                {
                  type: 'reply',
                  eventId: 'branch4_16',
                  hasChildren: false
                }
              ]
            }
          ],
        },
      ],
    ])
  })

  test('assert buildBranches single branch', () => {
    const branches = buildBranches([
      {
        replyId: 'leaf_final',
        chainIds: [
          'p1',
          'p2',
          'p3',
          'p4',
          'p5',
          'p6',
          'p7',
          'p8',
          'p9',
          'p10',
          'p11',
          'p12',
          'p13',
          'p14',
          'leaf_final',
        ],
      },
    ])

    expect(branches).toEqual([
      {
        items: [
          {
            type: 'summary',
            eventIds: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10', 'p11', 'p12', 'p13'],
          },
          { type: 'parent', eventId: 'p14' },
          { type: 'reply', eventId: 'leaf_final', hasChildren: false },
        ],
      },
    ])
  })

  test('assert buildBranches deep thread', () => {
    const branches = buildBranches([
      { replyId: 'z9', chainIds: ['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8', 'a9', 'z9'] },
      { replyId: 'x1', chainIds: ['a1', 'a2', 'a3', 'a4', 'x1'] },
      { replyId: 'y1', chainIds: ['a1', 'a2', 'a3', 'y1'] },
      { replyId: 'b1', chainIds: ['b1'] },
    ])

    expect(branches).toEqual([
      {
        items: [
          { type: 'summary', eventIds: ['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8'] },
          { type: 'parent', eventId: 'a9' },
          { type: 'reply', eventId: 'z9', hasChildren: false },
        ],
      },
      {
        items: [{ type: 'reply', eventId: 'b1', hasChildren: false }],
      },
    ])
  })
})
