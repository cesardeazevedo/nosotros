import { addPublishAtom } from '@/atoms/publish.atoms'
import { store } from '@/atoms/store'
import { enqueueToastAtom } from '@/atoms/toaster.atoms'
import { Divider } from '@/components/ui/Divider/Divider'
import { Expandable } from '@/components/ui/Expandable/Expandable'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { NostrPublisher } from '@/core/NostrPublish'
import { broadcast } from '@/core/operators/broadcast'
import { usePublishEventMutation } from '@/hooks/mutations/usePublishEventMutation'
import { setSeenData, useSeenRelays } from '@/hooks/query/useSeen'
import type { NoteState } from '@/hooks/state/useNote'
import { dbSqlite } from '@/nostr/db'
import { pool } from '@/nostr/pool'
import { spacing } from '@/themes/spacing.stylex'
import { useSetAtom } from 'jotai'
import type { NostrEvent } from 'nostr-tools'
import { memo, useDeferredValue } from 'react'
import { css } from 'react-strict-dom'
import { ignoreElements, of, tap } from 'rxjs'
import { ReactionsNoteList } from '../Reactions/ReactionsNoteList'
import { RelayChip } from '../Relays/RelayChip'
import { RelaySelectPopover } from '../Relays/RelaySelectPopover'
import { RepostNoteList } from '../Repost/RepostNoteList'
import { ToastEventPublished } from '../Toasts/ToastEventPublished'
import { ZapNoteList } from '../Zaps/ZapNoteList'

type Props = {
  note: NoteState
  renderDivider?: boolean
}

export const PostStats = memo(function PostStats(props: Props) {
  const { note, renderDivider } = props
  const seenOn = useSeenRelays(note.event.id)
  const enqueueToast = useSetAtom(enqueueToastAtom)
  const statsOpenDeferred = useDeferredValue(note.state.statsOpen)

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

  if (note.state.statsOpen === false) {
    return null
  }

  return (
    <Expandable expanded={statsOpenDeferred}>
      <Stack horizontal={false} onClick={(e) => e.stopPropagation()}>
        {renderDivider && <Divider />}
        <Stack horizontal={false}>
          <Stack horizontal={false} justify='flex-start' align='flex-start' wrap={false}>
            <ZapNoteList />
            <RepostNoteList />
            <ReactionsNoteList />
          </Stack>
          <Stack horizontal={false} justify='flex-start' align='flex-start' sx={styles.panel} wrap={false} gap={2}>
            <Text variant='title' size='md'>
              Seen on relays
            </Text>
            <Stack horizontal wrap gap={0.5}>
              {seenOn?.map((url) => <RelayChip selected key={url} url={url} />)}
              <RelaySelectPopover onSubmit={(relay) => mutate([note.event, relay])} label='Broadcast' />
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </Expandable>
  )
})

const styles = css.create({
  panel: {
    padding: spacing.padding1,
    paddingInline: spacing.padding2,
  },
})
