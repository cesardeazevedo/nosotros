/**
 * Resolves the `import` item of a Namecoin Domain Name Object,
 * recursively merging values from imported names into the importing
 * object before the caller extracts fields like `nostr`.
 *
 * Per ifa-0001 §"import"
 * (https://github.com/namecoin/proposals/blob/master/ifa-0001.md):
 *
 *  - The importing object's items take precedence over imported items.
 *    A JSON `null` in the importer is still considered "present" and so
 *    suppresses the imported counterpart (semantic suppression).
 *  - The `import` value is an array of arrays. Each inner array has the
 *    name to import (e.g. `"d/example2"`), and an optional second element,
 *    a Subdomain Selector (DNS-format, dotted). Selector labels are
 *    resolved via the imported value's `map` tree before merging.
 *  - Three shorthand value forms are accepted alongside the canonical
 *    array-of-arrays. Real-world Namecoin records frequently use the
 *    bare-string form, so we MUST handle it:
 *      - `"import": "d/foo"`            ↔  `[["d/foo"]]`
 *      - `"import": ["d/foo"]`          ↔  `[["d/foo"]]`
 *      - `"import": ["d/foo","sub"]`    ↔  `[["d/foo","sub"]]`
 *  - Recursion depth: spec mandates implementations support at least
 *    four levels. We default to that limit; deeper chains are silently
 *    truncated (the importing object's own items still apply).
 *  - Cycles are broken by a visited-set keyed on `name|selector`.
 *  - Maps are merged shallow per spec: an importer key replaces the
 *    imported value for that key wholesale; nested objects are not
 *    deep-merged.
 *  - A failed lookup (name not found, malformed JSON, network error)
 *    is treated as if the imported value were `{}`. The importing
 *    object's own items still apply. This keeps NIP-05 resolution
 *    resilient to transient ElectrumX hiccups.
 */

/** The minimum recursion depth ifa-0001 requires implementations to support. */
export const DEFAULT_MAX_IMPORT_DEPTH = 4

/** A parsed JSON object as it appears in a Namecoin name value. */
export type JsonObject = Record<string, unknown>

/**
 * Async lookup callback: returns the raw value JSON string of the named
 * record, or `null` if the name does not exist / is expired / could not
 * be fetched. Failures must be absorbed by the caller; the returned
 * object is always usable.
 */
export type NameValueFetcher = (namecoinName: string) => Promise<string | null>

interface ImportOp {
  name: string
  /** DNS-dotted; may be empty. */
  selector: string
}

/**
 * Expand all `import` items in [root] (and recursively in imported
 * objects) up to `maxDepth` levels deep, returning a merged object with
 * no `import` key.
 *
 * The merged object preserves the importing object's items unchanged;
 * imported items only fill in keys the importing object did not declare
 * (including keys whose value is `null` — those remain suppressed).
 *
 * If [root] has no `import` key, it is returned unchanged with zero
 * extra I/O.
 */
export async function expandImports(
  root: JsonObject,
  fetcher: NameValueFetcher,
  maxDepth: number = DEFAULT_MAX_IMPORT_DEPTH,
): Promise<JsonObject> {
  if (!isPlainObject(root) || !('import' in root)) return root
  return expandRecursive(root, fetcher, maxDepth, new Set<string>())
}

async function expandRecursive(
  obj: JsonObject,
  fetcher: NameValueFetcher,
  budgetRemaining: number,
  visited: Set<string>,
): Promise<JsonObject> {
  if (!('import' in obj)) return obj
  const operations = parseImportItem(obj.import)
  if (operations === null) return removeImportKey(obj)
  if (operations.length === 0 || budgetRemaining <= 0) return removeImportKey(obj)

  // Walk imports left-to-right. Spec is silent on multi-import precedence,
  // but the common-sense rule is that LATER imports override EARLIER ones
  // in the same array (otherwise listing two libraries silently ignores
  // the second). The whole accumulator still loses to the importing
  // object stacked on top.
  let accumulator: JsonObject = {}
  for (const op of operations) {
    const visitKey = `${op.name}|${op.selector}`
    if (visited.has(visitKey)) continue
    visited.add(visitKey)
    try {
      const importedRaw = await safeFetch(fetcher, op.name)
      if (importedRaw === null) continue
      const importedRoot = tryParseObject(importedRaw)
      if (importedRoot === null) continue
      const selectorView = applySelector(importedRoot, op.selector)
      if (selectorView === null) continue
      const expanded = await expandRecursive(
        selectorView,
        fetcher,
        budgetRemaining - 1,
        visited,
      )
      accumulator = mergeImporterWins(expanded, accumulator)
    } finally {
      visited.delete(visitKey)
    }
  }

  const withoutImport = removeImportKey(obj)
  return mergeImporterWins(withoutImport, accumulator)
}

/**
 * Merge two objects with importer-wins semantics: every key in `importer`
 * stays as-is (including `null` values, which suppress the imported
 * counterpart per ifa-0001); keys present only in `imported` are added.
 */
function mergeImporterWins(importer: JsonObject, imported: JsonObject): JsonObject {
  if (Object.keys(imported).length === 0) return importer
  if (Object.keys(importer).length === 0) return imported
  const out: JsonObject = {}
  for (const k of Object.keys(imported)) out[k] = imported[k]
  for (const k of Object.keys(importer)) out[k] = importer[k]
  return out
}

/**
 * Walk the imported object's `map` tree to the node addressed by
 * `selector` (DNS-dotted, e.g. `"relay"` or `"a.b.c"`). Empty selector
 * returns `root` unchanged.
 *
 * Resolution rules per ifa-0001 §"map":
 *   - Exact label match wins.
 *   - Wildcard `*` matches any single label.
 *   - Empty key `""` is the default for the current level when no other
 *     match applies.
 *   - A non-object child terminates the walk with `null`.
 *
 * Selector is DNS-dotted (leftmost label is most-specific); the `map`
 * tree nests inwards toward the leaf, so we walk labels right-to-left
 * (rightmost label is the immediate child of the parent's `map`).
 */
function applySelector(root: JsonObject, selector: string): JsonObject | null {
  if (selector.length === 0) return root
  const labels = selector
    .split('.')
    .filter((l) => l.length > 0)
    .reverse()
  if (labels.length === 0) return root

  let current: JsonObject = root
  for (const label of labels) {
    const map = current.map
    if (!isPlainObject(map)) return null
    const child = pickMapChild(map, label)
    if (child === null) return null
    current = child
  }
  return current
}

function pickMapChild(map: JsonObject, label: string): JsonObject | null {
  const exact = map[label]
  if (isPlainObject(exact)) return exact
  const wildcard = map['*']
  if (isPlainObject(wildcard)) return wildcard
  const fallback = map['']
  if (isPlainObject(fallback)) return fallback
  return null
}

function tryParseObject(rawJson: string): JsonObject | null {
  try {
    const v: unknown = JSON.parse(rawJson)
    return isPlainObject(v) ? v : null
  } catch {
    return null
  }
}

async function safeFetch(fetcher: NameValueFetcher, name: string): Promise<string | null> {
  try {
    return await fetcher(name)
  } catch {
    return null
  }
}

function removeImportKey(obj: JsonObject): JsonObject {
  if (!('import' in obj)) return obj
  const out: JsonObject = {}
  for (const k of Object.keys(obj)) {
    if (k !== 'import') out[k] = obj[k]
  }
  return out
}

/**
 * Parse the value of an `import` item into a flat list of [ImportOp]
 * descriptors. Returns `null` if the value is malformed (number, bool,
 * object, etc.) — caller treats that as no-imports.
 *
 * Accepted shapes:
 *   - canonical:           `[["d/foo"], ["d/bar","sub"]]`
 *   - shorthand string:    `"d/foo"`            → one op, no selector
 *   - shorthand single:    `["d/foo"]`          → one op, no selector
 *   - shorthand pair:      `["d/foo","sub"]`    → one op, with selector
 */
function parseImportItem(item: unknown): ImportOp[] | null {
  if (typeof item === 'string') {
    const op = makeOp(item, '')
    return op ? [op] : null
  }
  if (!Array.isArray(item)) return null
  if (item.length === 0) return []

  if (Array.isArray(item[0])) {
    // Canonical array-of-arrays.
    const ops: ImportOp[] = []
    for (const entry of item) {
      if (!Array.isArray(entry)) continue
      const op = opFromArray(entry)
      if (op) ops.push(op)
    }
    return ops
  }
  // Shorthand: ["name"] or ["name","selector"].
  const op = opFromArray(item)
  return op ? [op] : []
}

function opFromArray(arr: unknown[]): ImportOp | null {
  if (arr.length === 0) return null
  const first = arr[0]
  if (typeof first !== 'string') return null
  const name = first.trim()
  if (!name) return null
  let selector = ''
  if (arr.length >= 2) {
    const sec = arr[1]
    if (typeof sec !== 'string') return null
    selector = sec.trim()
  }
  // Trailing dot is forbidden by spec; treat as malformed.
  if (selector.endsWith('.')) return null
  return { name, selector }
}

function makeOp(name: string, selector: string): ImportOp | null {
  const trimmed = name.trim()
  if (!trimmed) return null
  return { name: trimmed, selector }
}

function isPlainObject(v: unknown): v is JsonObject {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}
