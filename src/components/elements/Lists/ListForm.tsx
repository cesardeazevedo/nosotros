import { Button } from '@/components/ui/Button/Button'
import { Divider } from '@/components/ui/Divider/Divider'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { TextField } from '@/components/ui/TextField/TextField'
import { Kind } from '@/constants/kinds'
import { useCurrentPubkey, useCurrentSigner } from '@/hooks/useRootStore'
import { publish } from '@/nostr/publish/publish'
import { spacing } from '@/themes/spacing.stylex'
import { useActionState, useRef } from 'react'
import { css } from 'react-strict-dom'
import { defaultIfEmpty, delay, firstValueFrom } from 'rxjs'
import { ListFormFollowsSets } from './ListFormFollowSets'
import { ListFormRelaySet } from './ListFormRelaySets'

type Props = {
  kind: Kind.FollowSets | Kind.RelaySets
}

const labels = {
  [Kind.FollowSets]: 'follow',
  [Kind.RelaySets]: 'relay',
}

export type RefListKind = {
  getTags: () => string[][]
}

export const ListForm = (props: Props) => {
  const { kind } = props
  const ref = useRef<RefListKind>(null)
  const pubkey = useCurrentPubkey()
  const signer = useCurrentSigner()

  const [error, submit, isPending] = useActionState(async (_: unknown, formData: FormData) => {
    const title = formData.get('title')?.toString()
    const tags = ref.current?.getTags() || []
    if (!title) return 'title required' as string
    if (!signer || !pubkey) return 'signin required' as string

    const event = {
      kind,
      content: '',
      pubkey,
      tags: [['title', title], ['d', window.crypto.randomUUID().replace(/-/g, '').slice(0, 21)], ...tags],
    }
    await firstValueFrom(publish(event, { signer }).pipe(defaultIfEmpty(null), delay(1000)))
  }, null)

  return (
    <Stack sx={styles.root} horizontal={false}>
      <Stack sx={styles.header}>
        <Text variant='title' size='lg'>
          Create custom {labels[kind]} list
        </Text>
      </Stack>
      <Divider />
      <form action={submit}>
        <Stack sx={styles.content} horizontal={false} gap={2}>
          <TextField
            error={!!error}
            shrink
            fullWidth
            label='Name'
            name='title'
            placeholder='Give a name to your list'
          />
          {kind === Kind.FollowSets && <ListFormFollowsSets ref={ref} />}
          {kind === Kind.RelaySets && <ListFormRelaySet ref={ref} />}
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
