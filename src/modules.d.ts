declare module 'light-bolt11-decoder' {
  export function decode(string): {
    paymentRequest: string
    sections: Array<{ name: string; letters: string; value: string; tag?: string }>
    expiry: number
  }
}

declare module 'eslint-plugin-react'
