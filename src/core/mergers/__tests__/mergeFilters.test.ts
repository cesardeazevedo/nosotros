import { mergeFilters } from '../mergeFilters'

describe('mergeFilters', () => {
  test('Should expect authors of kind [0] being merged', () => {
    const result = mergeFilters([
      { kinds: [0], authors: ['npub1'] },
      { kinds: [0], authors: ['npub2'] },
      { kinds: [0], authors: ['npub2'] },
      { kinds: [0], authors: ['npub3'], until: 10 },
    ])
    expect(result).toHaveLength(2)
    expect(result[0]).toStrictEqual({ kinds: [0], authors: ['npub1', 'npub2'] })
    expect(result[1]).toStrictEqual({ kinds: [0], authors: ['npub3'], until: 10 })
  })

  test('Should expect ids of kind [0] being merged, except for the the filter with `until` field', () => {
    const result = mergeFilters([
      { kinds: [0], ids: ['1'] },
      { kinds: [0], ids: ['2'] },
      { kinds: [0], ids: ['2'] },
      { kinds: [0], ids: ['3'], until: 10 },
    ])
    expect(result).toHaveLength(2)
    expect(result[0]).toStrictEqual({ kinds: [0], ids: ['1', '2'] })
    expect(result[1]).toStrictEqual({ kinds: [0], ids: ['3'], until: 10 })
  })

  test('Should expect authors and ids being merged separately', () => {
    const result = mergeFilters([
      { kinds: [0], authors: ['1'] },
      { kinds: [0], authors: ['2'] },
      { kinds: [0], ids: ['2'] },
      { kinds: [0], ids: ['3'] },
    ])
    expect(result).toHaveLength(2)
    expect(result[0]).toStrictEqual({ kinds: [0], authors: ['1', '2'] })
    expect(result[1]).toStrictEqual({ kinds: [0], ids: ['2', '3'] })
  })

  test('Should expect #e of kind [0] being merged', () => {
    const result = mergeFilters([
      { kinds: [0], '#e': ['1'] },
      { kinds: [0], '#e': ['2'] },
      { kinds: [0], '#e': ['2'] },
      { kinds: [0], '#e': ['3'], until: 10 },
    ])
    expect(result).toHaveLength(2)
    expect(result[0]).toStrictEqual({ kinds: [0], '#e': ['1', '2'] })
    expect(result[1]).toStrictEqual({ kinds: [0], '#e': ['3'], until: 10 })
  })

  test('Should expect merge authors of kind [0, 1, 6] and [0]', () => {
    const result = mergeFilters([
      { kinds: [0, 1, 6], authors: ['npub1'] },
      { kinds: [6, 1, 0], authors: ['npub2'] }, // out of order
      { kinds: [0], authors: ['npub3'] },
      { kinds: [0], authors: ['npub4'], until: 10 },
    ])
    expect(result).toHaveLength(3)
    expect(result[0]).toStrictEqual({ kinds: [0, 1, 6], authors: ['npub1', 'npub2'] })
    expect(result[1]).toStrictEqual({ kinds: [0], authors: ['npub3'] })
    expect(result[2]).toStrictEqual({ kinds: [0], authors: ['npub4'], until: 10 })
  })

  test('Should expect merge authors of kind [0] with the same `until` pagination value', () => {
    const result = mergeFilters([
      { kinds: [0], authors: ['npub1'], until: 10 },
      { kinds: [0], authors: ['npub2'], until: 10 },
      { kinds: [0], authors: ['npub3'], until: 15 },
      { kinds: [0], authors: ['npub4'], until: 15 },
    ])
    expect(result).toHaveLength(2)
    expect(result[0]).toStrictEqual({ kinds: [0], authors: ['npub1', 'npub2'], until: 10 })
    expect(result[1]).toStrictEqual({ kinds: [0], authors: ['npub3', 'npub4'], until: 15 })
  })

  test('Should merge replaceable kinds and not other kinds', () => {
    const result = mergeFilters([
      { kinds: [0], authors: ['npub1'] },
      { kinds: [0], authors: ['npub2'] },
      { kinds: [10002], authors: ['npub3'] },
      { kinds: [10002], authors: ['npub4'] },
      { kinds: [1], authors: ['npub1'] },
      { kinds: [6], authors: ['npub2'] },
    ])
    expect(result).toStrictEqual([
      { kinds: [0, 10002], authors: ['npub1', 'npub2', 'npub3', 'npub4'] },
      { kinds: [1, 6], authors: ['npub1', 'npub2'] },
    ])
  })

  test('Should not expect the merge of [0, 10002] with [1, 30023]', () => {
    const result = mergeFilters([
      { kinds: [0, 10002], authors: ['npub1'] },
      { kinds: [1, 30023], ids: ['1'] },
    ])
    expect(result).toHaveLength(2)
    expect(result).toStrictEqual([
      { kinds: [0, 10002], authors: ['npub1'] },
      { kinds: [1, 30023], ids: ['1'] },
    ])
  })

  test('Should not merge kind 0 and 1', () => {
    const result = mergeFilters([
      { kinds: [0, 10002], authors: ['1'] },
      { kinds: [1, 30023], authors: ['2'] },
    ])
    expect(result).toStrictEqual([
      { kinds: [0, 10002], authors: ['1'] },
      { kinds: [1, 30023], authors: ['2'] },
    ])
  })

  test('Should merge ids without kind', () => {
    const result = mergeFilters([{ ids: ['1'] }, { ids: ['2'] }])
    expect(result).toStrictEqual([{ ids: ['1', '2'] }])
  })

  test('Should not merge follows kind', () => {
    const result = mergeFilters([
      { kinds: [0], authors: ['1', '2', '3'] },
      { kinds: [10002], authors: ['1', '2', '3'] },
      { kinds: [3], authors: ['8', '9'] },
    ])
    expect(result).toStrictEqual([
      { kinds: [0, 10002], authors: ['1', '2', '3'] },
      { kinds: [3], authors: ['8', '9'] },
    ])
  })

  test('Should not mutate original filters', () => {
    const filter1 = { kinds: [1], author: ['1'] }
    const filter2 = { kinds: [6], author: ['2'] }
    const clone1 = structuredClone(filter1)
    const clone2 = structuredClone(filter2)
    const result = mergeFilters([filter1, filter2])
    expect(result).toStrictEqual([
      {
        kinds: [1, 6],
        author: ['1'],
      },
    ])
    expect(filter1).toStrictEqual(clone1)
    expect(filter2).toStrictEqual(clone2)
  })

  test('Should not filters that has tags', () => {
    const filter1 = { kinds: [3000], authors: ['1'], '#d': ['1'], limit: 10 }
    const filter2 = { kinds: [1], authors: ['1'], limit: 10 }
    const result = mergeFilters([filter1, filter2])
    expect(result).toStrictEqual([filter1, filter2])
  })
})
