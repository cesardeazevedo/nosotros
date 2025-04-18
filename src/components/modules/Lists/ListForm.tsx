import { Button } from '@/components/ui/Button/Button'
import { Divider } from '@/components/ui/Divider/Divider'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { TextField } from '@/components/ui/TextField/TextField'
import { Kind } from '@/constants/kinds'
import { useCurrentPubkey, useCurrentSigner } from '@/hooks/useRootStore'
import { publish } from '@/nostr/publish/publish'
import type { Event } from '@/stores/events/event'
import { spacing } from '@/themes/spacing.stylex'
import { useActionState, useRef } from 'react'
import { css } from 'react-strict-dom'
import { defaultIfEmpty, delay, firstValueFrom } from 'rxjs'
import { FollowSetForm } from './FollowSets/FollowSetForm'
import { RelaySetForm } from './RelaySets/RelaySetForm'

type Props = ({ isEditing: true; event: Event } | { isEditing: false; kind: Kind.FollowSets | Kind.RelaySets }) & {
  onClose?: () => void
}

const labels = {
  [Kind.FollowSets]: 'follow',
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

  const [error, submit, isPending] = useActionState(async (_: unknown, formData: FormData) => {
    const title = formData.get('title')?.toString()
    const tags = ref.current?.getTags() || []
    if (!title) return 'title required' as string
    if (!signer || !pubkey) return 'signin required' as string

    const uuid = window.crypto.randomUUID().replace(/-/g, '').slice(0, 21)
    const d = isEditing ? props.event.getTag('d') || uuid : uuid
    const newEvent = {
      kind,
      content: isEditing ? props.event.event.content : '',
      pubkey,
      tags: [['title', title], ['d', d], ...tags],
    }
    await firstValueFrom(publish(newEvent, { signer }).pipe(defaultIfEmpty(null), delay(1000)))
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
            defaultValue={isEditing ? props.event.getTag('title') : ''}
            shrink
            fullWidth
            label='Name'
            name='title'
            placeholder='Give a name to your list'
          />
          <TextField
            defaultValue={isEditing ? props.event.getTag('description') : ''}
            shrink
            fullWidth
            multiline
            rows={3}
            label='Description'
            name='description'
            placeholder='List description'
          />
          {kind === Kind.FollowSets && <FollowSetForm event={isEditing ? props.event : undefined} ref={ref} />}
          {kind === Kind.RelaySets && <RelaySetForm event={isEditing ? props.event : undefined} ref={ref} />}
        </Stack>
        <Stack sx={styles.action}>
          <Button fullWidth disabled={isPending} type='submit' variant='filled' sx={styles.button}>
            Create
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
