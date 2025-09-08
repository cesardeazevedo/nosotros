import { enqueueToastAtom } from '@/atoms/toaster.atoms'
import { updateZapRequestAtom, zapRequestAtom, type ZapRequest as ZapRequestStore } from '@/atoms/zapRequest.atoms'
import { ContentProvider } from '@/components/providers/ContentProvider'
import { Button } from '@/components/ui/Button/Button'
import { Chip } from '@/components/ui/Chip/Chip'
import { CircularProgress } from '@/components/ui/Progress/CircularProgress'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { TextField } from '@/components/ui/TextField/TextField'
import { dedupe } from '@/core/helpers/dedupe'
import type { Signer } from '@/core/signers/signer'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { useUserRelays } from '@/hooks/query/useQueryUser'
import { useNoteState } from '@/hooks/state/useNote'
import { useUserState } from '@/hooks/state/useUser'
import { useCurrentPubkey, useCurrentSigner } from '@/hooks/useAuth'
import { READ, WRITE } from '@/nostr/types'
import { spacing } from '@/themes/spacing.stylex'
import { bech32, utf8 } from '@scure/base'
import { IconAlertCircleFilled, IconBolt } from '@tabler/icons-react'
import { useNavigate, useRouter } from '@tanstack/react-router'
import { useAtomValue, useSetAtom } from 'jotai'
import type { NostrEvent } from 'nostr-tools'
import { nip19 } from 'nostr-tools'
import { Bech32MaxSize } from 'nostr-tools/nip19'
import { getZapEndpoint, makeZapRequest } from 'nostr-tools/nip57'
import { useObservableState } from 'observable-hooks'
import { memo } from 'react'
import { css } from 'react-strict-dom'
import { catchError, filter, first, from, map, merge, mergeMap, of, startWith, tap, throwError } from 'rxjs'
import { fromFetch } from 'rxjs/fetch'
import { UserAvatar } from '../User/UserAvatar'
import { UserName } from '../User/UserName'
import { ZapChipAmount } from './ZapChipAmount'

type Props = {
  event: NostrEventDB
}

const formatter = new Intl.NumberFormat()

export const ZapRequest = memo(function ZapRequest(props: Props) {
  const { event } = props
  const signer = useCurrentSigner()
  const store = useAtomValue(zapRequestAtom)
  const updateStore = useSetAtom(updateZapRequestAtom)
  const enqueueToast = useSetAtom(enqueueToastAtom)

  const pubkey = useCurrentPubkey()
  const navigate = useNavigate()
  const router = useRouter()
  const note = useNoteState(event)
  const user = useUserState(event.pubkey)
  const userRelays = useUserRelays(user.pubkey, READ).data?.map((x) => x.relay) || []
  const currentUserRelays = useUserRelays(pubkey, WRITE).data?.map((x) => x.relay) || []
  const relays = dedupe(userRelays, currentUserRelays)
  const zapEnabled = note?.user ? user.canReceiveZap : true

  const [pending, onSubmit] = useObservableState<
    boolean,
    [signer: Signer, userEvent: NostrEvent, ZapRequestStore, string[]] | undefined
  >((input$) => {
    return input$.pipe(
      filter((x) => !!x),
      mergeMap(([signer, userEvent, store, relays]) => {
        return from(getZapEndpoint(userEvent)).pipe(
          mergeMap((callback) => {
            if (!callback) return throwError(() => new Error('Error when getting zap endpoint'))

            const comment = store.comment
            const amount = store.amount * 1000

            const zapEvent = makeZapRequest({
              pubkey: event.pubkey,
              event: event,
              amount,
              comment,
              relays,
            })

            const lnurl = bech32.encode('lnurl', bech32.toWords(utf8.decode(callback)), Bech32MaxSize)
            const signed = signer.sign({
              ...zapEvent,
              tags: [...zapEvent.tags, ['lnurl', lnurl]],
            })

            return from(signed).pipe(
              mergeMap((event) => {
                if (!event) {
                  return throwError(() => 'Signed rejected')
                }
                return merge(
                  fromFetch<{ pr: string } | { message: string; error: true }>(
                    `${callback}?amount=${amount}&nostr=${encodeURI(JSON.stringify(event))}&lnurl=${lnurl}`,
                    {
                      selector: (res) => res.json(),
                      mode: 'cors',
                      credentials: 'omit',
                    },
                  ),
                )
              }),
              tap((response) => {
                if ('error' in response && response.error) {
                  enqueueToast({ component: response.message, duration: 5000 })
                } else if ('pr' in response) {
                  navigate({
                    search: {
                      invoice: response.pr,
                      nevent: nip19.neventEncode({
                        id: event.id,
                        author: event.pubkey,
                        relays,
                      }),
                    },
                    to: '.',
                    state: { from: router.latestLocation.pathname } as never,
                  })
                }
              }),
            )
          }),
          first(),
          map(() => false),
          startWith(true),
        )
      }),
      catchError((res) => {
        const error = res as Error
        enqueueToast({ component: error.message, duration: 5000 })
        return of(false)
      }),
    )
  })

  return (
    <Stack horizontal={false} align='center' justify='center' sx={styles.root}>
      <Stack horizontal={false} align='center' gap={2}>
        <IconBolt size={38} fill='currentColor' strokeOpacity='0' />
        <ContentProvider value={{ disableLink: true, disablePopover: true }}>
          {user.pubkey && <UserAvatar pubkey={user.pubkey} size='xl' sx={styles.avatar} />}
          <Stack gap={0.5}>
            <Text variant='title' size='lg' sx={styles.title}>
              Zap{' '}
            </Text>{' '}
            {user.pubkey && <UserName size='lg' variant='title' pubkey={user.pubkey} />}
          </Stack>
        </ContentProvider>
      </Stack>
      {!zapEnabled && (
        <Stack gap={1} horizontal={false} align='center' sx={styles.content}>
          <IconAlertCircleFilled size={32} />
          <Text variant='label' size='lg' sx={styles.disabledMsg}>
            This user can't receive zaps yet
          </Text>
        </Stack>
      )}
      <Stack grow horizontal={false} sx={[styles.content, !zapEnabled && styles.disabled]} gap={1} align='center'>
        <Text variant='body' size='sm'>
          Amount in sats
        </Text>
        <Stack sx={styles.chips} wrap justify='center'>
          <ZapChipAmount amount={21} />
          <ZapChipAmount amount={1000} />
          <ZapChipAmount amount={5000} />
          <ZapChipAmount amount={10000} />
          <ZapChipAmount amount={50000} />
          <ZapChipAmount amount={100000} />
          <Chip
            selected={store.custom}
            variant='filter'
            label='Custom'
            onClick={() => updateStore({ custom: !store.custom })}
          />
        </Stack>
        {store.custom && (
          <TextField
            type='number'
            shrink
            min={1}
            step={1}
            label='Custom amount'
            placeholder='21000'
            sx={styles.custom}
            onChange={(e) => updateStore({ amount: parseInt(e.target.value) })}
            onKeyDown={(e) => {
              if (e.key === '.') {
                // @ts-ignore
                e.preventDefault()
              }
            }}
          />
        )}
        <TextField
          fullWidth
          shrink
          label='Comment'
          placeholder='Add a zap comment'
          sx={styles.comment}
          onChange={(e) => updateStore({ comment: e.target.value })}
        />
      </Stack>
      <br />
      <Button
        disabled={pending}
        fullWidth
        variant='filled'
        sx={styles.button}
        onClick={() => signer && user.event && onSubmit([signer, user.event, store, relays])}>
        <Stack gap={1} justify='center'>
          {pending && <CircularProgress size='xs' />}
          {pending ? 'Generating Invoice...' : `Zap ${formatter.format(store.amount)} sats`}
        </Stack>
      </Button>
    </Stack>
  )
})

const styles = css.create({
  root: {
    padding: spacing.padding2,
    paddingTop: spacing.padding6,
  },
  content: {
    marginBlock: spacing.margin2,
    textAlign: 'center',
  },
  note: {
    paddingInline: spacing.padding4,
    width: '100%',
    maxWidth: 400,
  },
  avatar: {
    boxShadow: `0px 0px 0px 4px white`,
  },
  title: {
    fontWeight: 600,
  },
  chips: {
    gap: 6,
    paddingInline: spacing.padding2,
  },
  comment: {
    marginTop: spacing.margin4,
  },
  custom: {
    width: 150,
    marginTop: spacing.margin2,
    fontFamily: 'monospace',
  },
  button: {
    height: 50,
  },
  disabled: {
    opacity: 0.5,
    pointerEvents: 'none',
    filter: 'blur(2px)',
  },
  disabledMsg: {
    width: 250,
    textAlign: 'center',
  },
})
