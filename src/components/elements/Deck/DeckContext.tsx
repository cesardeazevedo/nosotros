import { createContext } from 'react'
import { firstValueFrom, timer } from 'rxjs'

export const DeckContext = createContext({ index: undefined, delay: firstValueFrom(timer(1000)) } as {
  index: number | undefined
  delay: Promise<0>
})
