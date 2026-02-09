import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { useObservable, useObservableState } from 'observable-hooks'
import { useMemo } from 'react'
import { EMPTY, catchError, from, map, of, switchMap } from 'rxjs'
import { useCurrentPubkey, useCurrentSigner } from './useAuth'

type UseEventDecryptResult = [NostrEventDB | undefined, string | undefined]

export function useEventDecrypt(event: NostrEventDB | undefined): UseEventDecryptResult {
  const signer = useCurrentSigner()
  const pubkey = useCurrentPubkey()

  const decryptedEvent$ = useObservable<UseEventDecryptResult, [NostrEventDB | undefined, typeof signer, string | undefined]>(
    (input$) => {
      return input$.pipe(
        switchMap(([currentEvent, currentSigner, currentPubkey]) => {
          if (!currentEvent) {
            return EMPTY
          }
          if (!currentEvent.content || !currentSigner || !currentPubkey) {
            return of([currentEvent, undefined] as UseEventDecryptResult)
          }
          return from(currentSigner.decrypt(currentPubkey, currentEvent.content)).pipe(
            map((content) => {
              return [currentEvent, content] as UseEventDecryptResult
            }),
            catchError(() => {
              return of([currentEvent, undefined] as UseEventDecryptResult)
            }),
          )
        }),
      )
    },
    [event, signer, pubkey],
  )
  return useObservableState<UseEventDecryptResult>(decryptedEvent$, [event, undefined] as UseEventDecryptResult)
}

export function useEventDecryptedTags(event: NostrEventDB | undefined): string[][] | undefined {
  const [, decryptedContent] = useEventDecrypt(event)

  return useMemo(() => {
    if (!decryptedContent) {
      return undefined
    }
    try {
      const parsed = JSON.parse(decryptedContent)
      if (Array.isArray(parsed)) {
        return parsed as string[][]
      }
    } catch {
      return undefined
    }
    return undefined
  }, [decryptedContent])
}
