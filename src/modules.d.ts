declare module 'light-bolt11-decoder' {
  export function decode(string): {
    sections: Array<{ name: string; letters: string; value: string }>
  }
}
