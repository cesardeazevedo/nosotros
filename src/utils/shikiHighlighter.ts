type HighlighterTheme = 'github-dark-high-contrast' | 'github-light-default'

type MinimalHighlighter = {
  codeToHtml: (code: string, options: { lang: string; theme: HighlighterTheme }) => string
}

type LangModule = { default: any[] }

type Loader = () => Promise<LangModule>

const languageAliases: Record<string, string> = {
  cjs: 'js',
  mjs: 'js',
  mts: 'ts',
  cts: 'ts',
  cjsx: 'jsx',
  mjsx: 'jsx',
  ctsx: 'tsx',
  mtsx: 'tsx',
  markdown: 'md',
  mdx: 'md',
  shell: 'bash',
  sh: 'bash',
  zsh: 'bash',
  csharp: 'cs',
  'c#': 'cs',
  objc: 'objective-c',
  yml: 'yaml',
  docker: 'dockerfile',
  kt: 'kotlin',
  py: 'python',
  haskell: 'haskell',
  hs: 'haskell',
  glean: 'gleam',
  clj: 'clojure',
  assembly: 'asm',
  asm: 'asm',
  'f#': 'fsharp',
  fs: 'fsharp',
  erl: 'erlang',
  jl: 'julia',
}

const languageLoaders: Record<string, Loader> = {
  asm: () => import('@shikijs/langs/asm'),
  bash: () => import('@shikijs/langs/bash'),
  c: () => import('@shikijs/langs/c'),
  clojure: () => import('@shikijs/langs/clojure'),
  cpp: () => import('@shikijs/langs/cpp'),
  cs: () => import('@shikijs/langs/cs'),
  css: () => import('@shikijs/langs/css'),
  dart: () => import('@shikijs/langs/dart'),
  diff: () => import('@shikijs/langs/diff'),
  dockerfile: () => import('@shikijs/langs/dockerfile'),
  elixir: () => import('@shikijs/langs/elixir'),
  erlang: () => import('@shikijs/langs/erlang'),
  fsharp: () => import('@shikijs/langs/fsharp'),
  gleam: () => import('@shikijs/langs/gleam'),
  go: () => import('@shikijs/langs/go'),
  graphql: () => import('@shikijs/langs/graphql'),
  haskell: () => import('@shikijs/langs/haskell'),
  html: () => import('@shikijs/langs/html'),
  java: () => import('@shikijs/langs/java'),
  js: () => import('@shikijs/langs/js'),
  json: () => import('@shikijs/langs/json'),
  jsonc: () => import('@shikijs/langs/jsonc'),
  jsx: () => import('@shikijs/langs/jsx'),
  julia: () => import('@shikijs/langs/julia'),
  kotlin: () => import('@shikijs/langs/kotlin'),
  lua: () => import('@shikijs/langs/lua'),
  'objective-c': () => import('@shikijs/langs/objective-c'),
  ocaml: () => import('@shikijs/langs/ocaml'),
  perl: () => import('@shikijs/langs/perl'),
  php: () => import('@shikijs/langs/php'),
  python: () => import('@shikijs/langs/python'),
  r: () => import('@shikijs/langs/r'),
  ruby: () => import('@shikijs/langs/ruby'),
  rust: () => import('@shikijs/langs/rust'),
  sass: () => import('@shikijs/langs/sass'),
  scala: () => import('@shikijs/langs/scala'),
  scss: () => import('@shikijs/langs/scss'),
  sql: () => import('@shikijs/langs/sql'),
  svelte: () => import('@shikijs/langs/svelte'),
  swift: () => import('@shikijs/langs/swift'),
  toml: () => import('@shikijs/langs/toml'),
  ts: () => import('@shikijs/langs/ts'),
  tsx: () => import('@shikijs/langs/tsx'),
  vue: () => import('@shikijs/langs/vue'),
  xml: () => import('@shikijs/langs/xml'),
  yaml: () => import('@shikijs/langs/yaml'),
  zig: () => import('@shikijs/langs/zig'),
}

const supportedLanguages = new Set(Object.keys(languageLoaders))

let highlighterPromise: Promise<MinimalHighlighter> | null = null

export const normalizeCodeLanguage = (language: string | null | undefined) => {
  const normalized = (language || '').toLowerCase()
  const resolved = languageAliases[normalized] || normalized
  return supportedLanguages.has(resolved) ? resolved : 'text'
}

export const getShikiHighlighter = (): Promise<MinimalHighlighter> => {
  if (highlighterPromise) return highlighterPromise

  highlighterPromise = (async () => {
    const [{ createHighlighterCore }, { createJavaScriptRegexEngine }, themeDark, themeLight, ...langModules] =
      await Promise.all([
        import('shiki/core'),
        import('shiki/engine/javascript'),
        import('@shikijs/themes/github-dark-high-contrast'),
        import('@shikijs/themes/github-light-default'),
        ...Object.values(languageLoaders).map((load) => load()),
      ])

    return createHighlighterCore({
      engine: createJavaScriptRegexEngine(),
      themes: [themeDark.default, themeLight.default],
      langs: langModules.flatMap((mod) => mod.default),
    })
  })()

  return highlighterPromise
}

export type { HighlighterTheme }
