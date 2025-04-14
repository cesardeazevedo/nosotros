import { ContentProvider } from '@/components/providers/ContentProvider'
import { Button } from '@/components/ui/Button/Button'
import { Chip } from '@/components/ui/Chip/Chip'
import { CircularProgress } from '@/components/ui/Progress/CircularProgress'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { TextField } from '@/components/ui/TextField/TextField'
import { useNoteStoreFromId } from '@/hooks/useNoteStore'
import { useCurrentSigner, useCurrentUser, useRootContext } from '@/hooks/useRootStore'
import { toastStore } from '@/stores/ui/toast.store'
import type { User } from '@/stores/users/user'
import { createZapRequestStore } from '@/stores/zaps/zap.request.store'
import { spacing } from '@/themes/spacing.stylex'
import { bech32, utf8 } from '@scure/base'
import { IconAlertCircleFilled, IconBolt } from '@tabler/icons-react'
import { useNavigate, useRouter } from '@tanstack/react-router'
import { observer } from 'mobx-react-lite'
import { nip19 } from 'nostr-tools'
import type { EventPointer } from 'nostr-tools/nip19'
import { Bech32MaxSize } from 'nostr-tools/nip19'
import { getZapEndpoint, makeZapRequest } from 'nostr-tools/nip57'
import { useObservableState } from 'observable-hooks'
import { useMemo } from 'react'
import { css } from 'react-strict-dom'
import { catchError, filter, first, from, map, mergeMap, of, startWith, tap, throwError } from 'rxjs'
import { fromFetch } from 'rxjs/fetch'
import { UserAvatar } from '../User/UserAvatar'
import { UserName } from '../User/UserName'
import { ZapChipAmount } from './ZapChipAmount'

type Props = EventPointer

const formatter = new Intl.NumberFormat()

export const ZapRequest = observer(function ZapRequest(props: Props) {
  const { id } = props
  const context = useRootContext()
  const signer = useCurrentSigner()
  const store = useMemo(() => createZapRequestStore(), [])

  const currentUser = useCurrentUser()
  const navigate = useNavigate()
  const router = useRouter()
  const note = useNoteStoreFromId(id)
  const zapEnabled = note?.user ? note.user.canReceiveZap : true

  const [pending, onSubmit] = useObservableState<boolean, User | undefined>((input$) => {
    return input$.pipe(
      filter((x) => !!x),
      mergeMap((user) => {
        return from(getZapEndpoint(user.event)).pipe(
          mergeMap((callback) => {
            const { pubkey } = context
            if (!callback) return throwError(() => new Error('Error when getting zap endpoint'))
            if (!pubkey || !signer) return throwError(() => new Error('Not authenticated'))

            const comment = store.comment
            const amount = store.amount * 1000
            const relays = [...(currentUser?.relays || []), ...user.relays]

            const zapEvent = makeZapRequest({
              profile: user.event.pubkey,
              event: id,
              amount,
              comment,
              relays,
            })

            const lnurl = bech32.encode('lnurl', bech32.toWords(utf8.decode(callback)), Bech32MaxSize)
            const signed = signer.sign({
              ...zapEvent,
              pubkey,
              tags: [...zapEvent.tags, ['lnurl', lnurl]],
            })

            return from(signed).pipe(
              mergeMap((event) => {
                if (!event) {
                  return throwError(() => 'Signed rejected')
                }
                return fromFetch<{ pr: string }>(
                  `${callback}?amount=${amount}&nostr=${encodeURI(JSON.stringify(event))}&lnurl=${lnurl}`,
                  {
                    selector: (res) => res.json(),
                    mode: 'cors',
                    credentials: 'omit',
                  },
                )
              }),
              tap((response) => {
                navigate({
                  search: {
                    invoice: response.pr,
                    nevent: nip19.neventEncode({
                      id,
                      author: user.pubkey,
                      relays,
                    }),
                  },
                  to: '.',
                  state: { from: router.latestLocation.pathname } as never,
                })
              }),
            )
          }),
          first(),
          map(() => false),
          startWith(true),
          catchError((res) => {
            const error = res as Error
            toastStore.enqueue(error.message, { duration: 5000 })
            return of(false)
          }),
        )
      }),
    )
  })

  return (
    <Stack horizontal={false} align='center' justify='center' sx={styles.root}>
      <Stack horizontal={false} align='center' gap={2}>
        <IconBolt size={38} fill='currentColor' strokeOpacity='0' />
        <ContentProvider value={{ disableLink: true, disablePopover: true }}>
          <UserAvatar pubkey={note?.user?.pubkey} size='xl' sx={styles.avatar} />
          <Stack gap={0.5}>
            <Text variant='title' size='lg' sx={styles.title}>
              Zap{' '}
            </Text>{' '}
            {note?.user && <UserName size='lg' variant='title' pubkey={note.user.pubkey} />}
          </Stack>
        </ContentProvider>
        {/* {note && ( */}
        {/*   <html.div style={styles.note}> */}
        {/*     <PostReplyContent note={note} size='xs' /> */}
        {/*   </html.div> */}
        {/* )} */}
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
          <ZapChipAmount store={store} amount={21} />
          <ZapChipAmount store={store} amount={1000} />
          <ZapChipAmount store={store} amount={5000} />
          <ZapChipAmount store={store} amount={10000} />
          <ZapChipAmount store={store} amount={50000} />
          <ZapChipAmount store={store} amount={100000} />
          <Chip selected={store.custom.value} variant='filter' label='Custom' onClick={() => store.custom.toggle()} />
        </Stack>
        {store.custom.value && (
          <TextField
            type='number'
            shrink
            min={1}
            step={1}
            label='Custom amount'
            placeholder='21000'
            sx={styles.custom}
            onChange={(e) => store.setAmount(parseInt(e.target.value))}
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
          onChange={(e) => store.setComment(e.target.value)}
        />
      </Stack>
      <br />
      <Button disabled={pending} fullWidth variant='filled' sx={styles.button} onClick={() => onSubmit(note?.user)}>
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
