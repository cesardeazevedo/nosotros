import { addPublishAtom } from '@/atoms/publish.atoms'
import { store } from '@/atoms/store'
import { enqueueToastAtom } from '@/atoms/toaster.atoms'
import { useNoteContext } from '@/components/providers/NoteProvider'
import { Divider } from '@/components/ui/Divider/Divider'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { NostrPublisher } from '@/core/NostrPublish'
import { broadcast } from '@/core/operators/broadcast'
import { usePublishEventMutation } from '@/hooks/mutations/usePublishEventMutation'
import { setSeenData } from '@/hooks/query/useSeen'
import type { NoteState } from '@/hooks/state/useNote'
import { dbSqlite } from '@/nostr/db'
import { pool } from '@/nostr/pool'
import { spacing } from '@/themes/spacing.stylex'
import { useSetAtom } from 'jotai'
import type { NostrEvent } from 'nostr-tools'
import { memo } from 'react'
import { css } from 'react-strict-dom'
import { ignoreElements, of, tap } from 'rxjs'
import { RelayChip } from '../Relays/RelayChip'
import { RelaySelectPopover } from '../Relays/RelaySelectPopover'
import { ToastEventPublished } from '../Toasts/ToastEventPublished'

type Props = {
  note: NoteState
}

export const PostBroadcaster = memo(function PostBroadcaster(props: Props) {
  const { note } = props
  const enqueueToast = useSetAtom(enqueueToastAtom)

  const { mutate } = usePublishEventMutation<[NostrEvent, string]>({
    mutationFn:
      () =>
      ([event, relay]) => {
        const publisher = new NostrPublisher(undefined, { include: [event], relays: of([relay]) })
        return of(publisher).pipe(
          broadcast(pool),
          tap((res) => store.set(addPublishAtom, res)),
          tap(([relay, , status, , event]) => {
            if (status) {
              dbSqlite.insertSeen(relay, event)
              setSeenData(event.id, relay)
            }
          }),
          tap(() => {
            enqueueToast({
              component: <ToastEventPublished event={event} eventLabel='Broadcasted' />,
              duration: 5_000_000,
            })
          }),
          ignoreElements(),
        )
      },
  })

  return (
    <Stack horizontal={false}>
      <Divider />
      <Stack horizontal={false}>
        <Stack justify='flex-start' align='flex-start' sx={styles.panel} wrap={false} gap={2}>
          <Text sx={styles.subheader} variant='title' size='md'>
            Seen on relays
          </Text>
          <Stack horizontal wrap gap={0.5}>
            {note.seenOn?.map((url) => <RelayChip selected key={url} url={url} />)}
            <RelaySelectPopover onSubmit={(relay) => mutate([note.event, relay])} label='Broadcast' />
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  )
})

const styles = css.create({
  header: {
    paddingBlock: spacing.padding1,
    paddingInline: spacing.padding2,
  },
  panel: {
    paddingInline: spacing.padding2,
    paddingBlock: spacing.padding2,
  },
  subheader: {
    flex: 1,
    whiteSpace: 'nowrap',
  },
})
