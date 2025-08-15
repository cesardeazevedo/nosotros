import { Button } from '@/components/ui/Button/Button'
import { Divider } from '@/components/ui/Divider/Divider'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { TextField } from '@/components/ui/TextField/TextField'
import { Kind } from '@/constants/kinds'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { usePublishEventMutation } from '@/hooks/mutations/usePublishEventMutation'
import { useCurrentPubkey, useCurrentSigner } from '@/hooks/useAuth'
import { publish } from '@/nostr/publish/publish'
import { spacing } from '@/themes/spacing.stylex'
import type { UnsignedEvent } from 'nostr-tools'
import { useActionState, useRef } from 'react'
import { css } from 'react-strict-dom'
import { FollowSetForm } from './FollowSets/FollowSetForm'
import { RelaySetForm } from './RelaySets/RelaySetForm'

type Props = (
  | { isEditing: true; event: NostrEventDB }
  | { isEditing: false; kind: Kind.StarterPack | Kind.FollowSets | Kind.RelaySets }
) & {
  onClose?: () => void
}

const labels = {
  [Kind.FollowSets]: 'follow',
  [Kind.StarterPack]: 'starter pack',
  [Kind.RelaySets]: 'relay',
}

export type RefListKind = {
  getTags: () => string[][]
}

export const ListForm = (props: Props) => {
  const { isEditing, onClose } = props
  const kind = isEditing ? props.event.kind : props.kind

  const ref = useRef<RefListKind>(null)
  const pubkey = useCurrentPubkey()
  const signer = useCurrentSigner()

  // That's bad, we need to split this component into 2 for create and update
  const title = 'event' in props ? props.event.tags.find((x) => x[0] === 'title')?.[1] : ''
  const description = 'event' in props ? props.event.tags.find((x) => x[0] === 'description')?.[1] : ''
  const dTag = 'event' in props ? props.event.tags.find((x) => x[0] === 'dTag')?.[1] : ''

  const { isPending, mutateAsync } = usePublishEventMutation<UnsignedEvent>({
    mutationFn:
      ({ signer }) =>
      (newEvent) => {
        return publish(newEvent, { signer })
      },
  })

  const [error, submit] = useActionState(async (_: unknown, formData: FormData) => {
    const title = formData.get('title')?.toString()
    const tags = ref.current?.getTags() || []
    if (!title) return 'title required' as string
    if (!signer || !pubkey) return 'signin required' as string

    const uuid = window.crypto.randomUUID().replace(/-/g, '').slice(0, 21)
    const newEvent = {
      kind,
      content: isEditing ? props.event.content : '',
      pubkey,
      tags: [['title', title], ['d', dTag || uuid], ...tags],
    } as UnsignedEvent
    await mutateAsync(newEvent)
    onClose?.()
  }, null)

  return (
    <Stack sx={styles.root} horizontal={false}>
      <Stack sx={styles.header}>
        <Text variant='title' size='lg'>
          {`${isEditing ? 'Edit' : 'Create'} ${labels[kind as keyof typeof labels]} list`}
        </Text>
      </Stack>
      <Divider />
      <form action={submit}>
        <Stack sx={styles.content} horizontal={false} gap={2}>
          <TextField
            error={!!error}
            defaultValue={isEditing ? title : ''}
            shrink
            fullWidth
            label='Name'
            name='title'
            placeholder='Give a name to your list'
          />
          <TextField
            defaultValue={isEditing ? description : ''}
            shrink
            fullWidth
            multiline
            rows={3}
            label='Description'
            name='description'
            placeholder='List description'
          />
          {(kind === Kind.FollowSets || kind === Kind.StarterPack) && (
            <FollowSetForm event={isEditing ? props.event : undefined} ref={ref} />
          )}
          {kind === Kind.RelaySets && <RelaySetForm event={isEditing ? props.event : undefined} ref={ref} />}
        </Stack>
        <Stack sx={styles.action}>
          <Button fullWidth disabled={isPending} type='submit' variant='filled' sx={styles.button}>
            {isEditing ? 'Update' : 'Create'}
          </Button>
        </Stack>
      </form>
    </Stack>
  )
}

const styles = css.create({
  root: {},
  header: {
    paddingBlock: spacing.padding2,
    paddingInline: spacing.padding2,
  },
  content: {
    padding: spacing.padding2,
    paddingBottom: spacing.padding1,
  },
  action: {
    paddingInline: spacing.padding2,
    paddingBlock: spacing.padding2,
  },
  button: {
    height: 50,
  },
  list: {
    padding: spacing.padding2,
  },
})
