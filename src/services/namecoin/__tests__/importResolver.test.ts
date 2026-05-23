import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { expandImports, type JsonObject } from '../importResolver'

// ─── Pure unit tests: expandImports + fake fetcher ──────────────────

describe('expandImports — unit', () => {
  const parse = (s: string): JsonObject => JSON.parse(s) as JsonObject

  it('returns object unchanged when there is no `import` key (no extra I/O)', async () => {
    const obj = parse('{"ip":"1.2.3.4"}')
    const fetcher = vi.fn(async () => null)
    const expanded = await expandImports(obj, fetcher)
    expect(expanded).toEqual(obj)
    expect(fetcher).not.toHaveBeenCalled()
  })

  it('string shorthand `"import":"d/foo"` merges imported items into importer', async () => {
    // ifa-0001 §"import" canonical form is array-of-arrays, but the string
    // form `"import": "d/foo"` is widely used in practice; we accept it as
    // shorthand for `[["d/foo"]]`.
    const obj = parse('{"import":"d/lib","ip":"1.1.1.1"}')
    const expanded = await expandImports(obj, async (name) => {
      if (name === 'd/lib') return '{"ip":"9.9.9.9","nostr":{"names":{"_":"abc"}}}'
      return null
    })
    expect(expanded.ip).toBe('1.1.1.1')
    expect((expanded.nostr as JsonObject).names).toEqual({ _: 'abc' })
    expect('import' in expanded).toBe(false)
  })

  it('array shorthand `["d/foo"]` is treated as canonical `[["d/foo"]]`', async () => {
    const obj = parse('{"import":["d/lib"]}')
    const expanded = await expandImports(obj, async (name) => {
      if (name === 'd/lib') return '{"tag":"from-lib"}'
      return null
    })
    expect(expanded.tag).toBe('from-lib')
  })

  it('pair-array shorthand `["d/foo","sel"]` descends the `map` tree before merging', async () => {
    const obj = parse('{"import":["d/lib","relay"]}')
    const expanded = await expandImports(obj, async (name) => {
      if (name === 'd/lib') {
        return '{"ip":"1.1.1.1","map":{"relay":{"ip":"7.7.7.7","tag":"selected"}}}'
      }
      return null
    })
    // We selected map.relay from d/lib; its contents are merged at the
    // top level. d/lib's top-level ip (1.1.1.1) is NOT seen.
    expect(expanded.ip).toBe('7.7.7.7')
    expect(expanded.tag).toBe('selected')
  })

  it('canonical array-of-arrays processes each entry in order; later overrides earlier', async () => {
    const obj = parse('{"import":[["d/a"],["d/b"]]}')
    const expanded = await expandImports(obj, async (name) => {
      if (name === 'd/a') return '{"ip":"10.0.0.1","tag":"from-a"}'
      if (name === 'd/b') return '{"ip":"10.0.0.2","extra":"from-b"}'
      return null
    })
    // d/b is processed AFTER d/a, so its `ip` (10.0.0.2) wins; the
    // importer has no `ip` of its own.
    expect(expanded.ip).toBe('10.0.0.2')
    expect(expanded.tag).toBe('from-a')
    expect(expanded.extra).toBe('from-b')
  })

  it('importer items take precedence over imported items', async () => {
    const obj = parse('{"import":"d/lib","ip":"1.1.1.1","extra":"local"}')
    const expanded = await expandImports(obj, async (name) => {
      if (name === 'd/lib') return '{"ip":"9.9.9.9","extra":"remote","only-imported":"yes"}'
      return null
    })
    expect(expanded.ip).toBe('1.1.1.1')
    expect(expanded.extra).toBe('local')
    expect(expanded['only-imported']).toBe('yes')
  })

  it('null in importer suppresses imported value (semantic suppression)', async () => {
    // ifa-0001: null is "present for precedence". Importer says ip=null,
    // so imported ip is masked.
    const obj = parse('{"import":"d/lib","ip":null}')
    const expanded = await expandImports(obj, async (name) => {
      if (name === 'd/lib') return '{"ip":"9.9.9.9","other":"keep"}'
      return null
    })
    expect('ip' in expanded).toBe(true)
    expect(expanded.ip).toBeNull()
    expect(expanded.other).toBe('keep')
  })

  it('recursion to depth 4 (spec minimum) resolves the whole chain', async () => {
    const obj = parse('{"import":"d/a"}')
    const expanded = await expandImports(obj, async (name) => {
      switch (name) {
        case 'd/a':
          return '{"import":"d/b","layer":"a"}'
        case 'd/b':
          return '{"import":"d/c","layer":"b"}'
        case 'd/c':
          return '{"import":"d/d","layer":"c"}'
        case 'd/d':
          return '{"layer":"d","deep":"reached"}'
        default:
          return null
      }
    })
    // Each layer overrides "layer" so the importer sees "a"; "deep"
    // exists only on d/d and survives to the top.
    expect(expanded.layer).toBe('a')
    expect(expanded.deep).toBe('reached')
  })

  it('recursion deeper than maxDepth is silently truncated; importer fields kept', async () => {
    const obj = parse('{"import":"d/a","local":"keep"}')
    const expanded = await expandImports(
      obj,
      async (name) => {
        if (name === 'd/a') return '{"import":"d/b","tag":"from-a"}'
        if (name === 'd/b') return '{"tag":"from-b","leaf":"wont-show"}'
        return null
      },
      1, // only one level of imports
    )
    expect(expanded.tag).toBe('from-a')
    expect(expanded.local).toBe('keep')
    // d/b was never expanded so its keys are NOT present.
    expect(expanded.leaf).toBeUndefined()
  })

  it('lookup returning null is treated as empty object (lenient I/O)', async () => {
    // Per our docs: spec says a failed import MAY fail the whole record;
    // we choose the more lenient "empty object" semantics so transient
    // ElectrumX hiccups don't kill resolution.
    const obj = parse('{"import":"d/missing","local":"survives"}')
    const expanded = await expandImports(obj, async () => null)
    expect(expanded.local).toBe('survives')
    expect('import' in expanded).toBe(false)
  })

  it('lookup throwing is treated as empty object', async () => {
    const obj = parse('{"import":"d/explodes","local":"survives"}')
    const expanded = await expandImports(obj, async () => {
      throw new Error('electrumx hiccup')
    })
    expect(expanded.local).toBe('survives')
  })

  it('lookup returning malformed JSON is treated as empty object', async () => {
    const obj = parse('{"import":"d/broken","local":"keep"}')
    const expanded = await expandImports(obj, async (name) => {
      if (name === 'd/broken') return 'not valid json {{{'
      return null
    })
    expect(expanded.local).toBe('keep')
  })

  it('malformed `import` value (number) is skipped without throwing', async () => {
    const obj = parse('{"import":42,"local":"keep"}')
    const expanded = await expandImports(obj, async () => null)
    expect(expanded.local).toBe('keep')
    expect('import' in expanded).toBe(false)
  })

  it('cycle A→B→A is broken; the call terminates with importer fields kept', async () => {
    // d/a imports d/b which imports d/a. A naive resolver would hang.
    // The visited-set guard breaks the loop on the second appearance of
    // d/a; the importer's own items still apply.
    const obj = parse('{"import":"d/a","local":"top"}')
    const expanded = await expandImports(obj, async (name) => {
      if (name === 'd/a') return '{"import":"d/b","fromA":"yes"}'
      if (name === 'd/b') return '{"import":"d/a","fromB":"yes"}'
      return null
    })
    expect(expanded.local).toBe('top')
    // At least one of fromA/fromB must have made it through. We don't
    // pin which (cycle-break point is implementation detail), but the
    // call MUST terminate.
    expect('fromA' in expanded || 'fromB' in expanded).toBe(true)
  })

  it('selector with multiple labels descends `map` tree in DNS order (rightmost first)', async () => {
    // selector "a.b" means: descend map.b, then map.a.
    const obj = parse('{"import":[["d/lib","a.b"]]}')
    const expanded = await expandImports(obj, async (name) => {
      if (name === 'd/lib') return '{"map":{"b":{"map":{"a":{"value":"deep"}}}}}'
      return null
    })
    expect(expanded.value).toBe('deep')
  })

  it('selector falls back to `*` wildcard when the exact label is absent', async () => {
    const obj = parse('{"import":["d/lib","ghost"]}')
    const expanded = await expandImports(obj, async (name) => {
      if (name === 'd/lib') return '{"map":{"*":{"value":"wildcard"}}}'
      return null
    })
    expect(expanded.value).toBe('wildcard')
  })
})

// ─── Integration: resolveNamecoin follows imports ────────────────────

// vi.mock must reference the module path; doMock+dynamic import keeps
// per-test mock state simple.
type NameShowMock = ReturnType<typeof vi.fn>

async function withMockedElectrumX<T>(
  records: Record<string, string>,
  run: (queriedNames: string[], mock: NameShowMock) => Promise<T>,
): Promise<T> {
  const queriedNames: string[] = []
  const mock = vi.fn(async (fullName: string) => {
    queriedNames.push(fullName)
    const value = records[fullName]
    if (value === undefined) return null
    return {
      name: fullName,
      value,
      txid: 'aa'.repeat(32),
      height: 700000,
      expired: false,
    }
  }) as NameShowMock

  vi.resetModules()
  vi.doMock('../electrumx-ws', async () => {
    const actual = (await vi.importActual('../electrumx-ws')) as object
    return { ...actual, nameShowWithFallback: mock }
  })

  try {
    return await run(queriedNames, mock)
  } finally {
    vi.doUnmock('../electrumx-ws')
    vi.resetModules()
  }
}

describe('resolveNamecoin — integration with import-chain expansion', () => {
  beforeEach(() => {
    vi.resetModules()
  })
  afterEach(() => {
    vi.resetModules()
    vi.restoreAllMocks()
  })

  it('bare `.bit` resolves to root entry across an import', async () => {
    // The real-world `testls.bit` deployment: the apex record at
    // `d/testls` is up against the 520-byte per-name limit and
    // delegates its `nostr.names` block to a sibling name via
    // `"import":"dd/testls"`. Without import support, NIP-05
    // resolution sees no `nostr` field at d/testls and fails.
    await withMockedElectrumX(
      {
        'd/testls': '{"import":"dd/testls","ip":"107.152.38.155"}',
        'dd/testls':
          '{"nostr":{"names":{"_":"460c25e682fda7832b52d1f22d3d22b3176d972f60dcdc3212ed8c92ef85065c","m":"6cdebccabda1dfa058ab85352a79509b592b2bdfa0370325e28ec1cb4f18667d"}}}',
      },
      async (queried) => {
        const { resolveNamecoin } = await import('../resolver')
        const result = await resolveNamecoin('testls.bit')
        expect(result).not.toBeNull()
        expect(result?.pubkey).toBe(
          '460c25e682fda7832b52d1f22d3d22b3176d972f60dcdc3212ed8c92ef85065c',
        )
        expect(queried).toContain('d/testls')
        expect(queried).toContain('dd/testls')
      },
    )
  })

  it('named NIP-05 `m@testls.bit` resolves through the same import', async () => {
    await withMockedElectrumX(
      {
        'd/testls2': '{"import":"dd/testls2"}',
        'dd/testls2':
          '{"nostr":{"names":{"m":"6cdebccabda1dfa058ab85352a79509b592b2bdfa0370325e28ec1cb4f18667d"}}}',
      },
      async () => {
        const { resolveNamecoin } = await import('../resolver')
        const result = await resolveNamecoin('m@testls2.bit')
        expect(result).not.toBeNull()
        expect(result?.pubkey).toBe(
          '6cdebccabda1dfa058ab85352a79509b592b2bdfa0370325e28ec1cb4f18667d',
        )
      },
    )
  })

  it('records without `import` issue exactly one ElectrumX query (zero-cost regression guard)', async () => {
    // Pure regression guard: ensure non-import records pay zero I/O
    // cost beyond the parent fetch.
    await withMockedElectrumX(
      {
        'd/plain': '{"nostr":{"names":{"_":"460c25e682fda7832b52d1f22d3d22b3176d972f60dcdc3212ed8c92ef85065c"}}}',
      },
      async (queried) => {
        const { resolveNamecoin } = await import('../resolver')
        const result = await resolveNamecoin('plain.bit')
        expect(result?.pubkey).toBe(
          '460c25e682fda7832b52d1f22d3d22b3176d972f60dcdc3212ed8c92ef85065c',
        )
        // Exactly one query: d/plain.
        expect(queried).toEqual(['d/plain'])
      },
    )
  })

  it('importer wins on `nostr.names` so the apex can override an imported entry', async () => {
    // Importer declares its own `nostr.names.m`; imported value declares
    // a different one. Importer wins on the whole `nostr` key (shallow
    // merge per spec).
    await withMockedElectrumX(
      {
        'd/testls3':
          '{"import":"dd/testls3","nostr":{"names":{"m":"aaaa000000000000000000000000000000000000000000000000000000000001"}}}',
        'dd/testls3':
          '{"nostr":{"names":{"m":"bbbb000000000000000000000000000000000000000000000000000000000002"}}}',
      },
      async () => {
        const { resolveNamecoin } = await import('../resolver')
        const result = await resolveNamecoin('m@testls3.bit')
        expect(result).not.toBeNull()
        expect(result?.pubkey).toBe(
          'aaaa000000000000000000000000000000000000000000000000000000000001',
        )
      },
    )
  })
})
