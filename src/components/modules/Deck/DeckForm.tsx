import { createDeckAtom } from '@/atoms/deck.atoms'
import { Button } from '@/components/ui/Button/Button'
import { ButtonBase } from '@/components/ui/ButtonBase/ButtonBase'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { TextField } from '@/components/ui/TextField/TextField'
import { TooltipRich } from '@/components/ui/TooltipRich/TooltipRich'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { useSetAtom } from 'jotai'
import type { ComponentProps } from 'react'
import { lazy, Suspense, useActionState, useState } from 'react'
import { css } from 'react-strict-dom'

type Props = {
  onCancel?: () => void
}

const EmojiPicker = lazy(async () => {
  const mod = await import('emoji-picker-react')
  const Picker = (props: Omit<ComponentProps<typeof mod.default>, 'theme' | 'emojiStyle'>) => (
    <mod.default {...props} theme={mod.Theme.AUTO} emojiStyle={mod.EmojiStyle.NATIVE} />
  )
  return { default: Picker }
})

export const DeckForm = (props: Props) => {
  const createDeck = useSetAtom(createDeckAtom)
  const [icon, setIcon] = useState('🤙')
  const [, submit] = useActionState((_: unknown, formData: FormData) => {
    const name = formData.get('name')?.toString()
    if (name) {
      createDeck({ name, icon })
      props.onCancel?.()
    }
    return null
  }, [])

  return (
    <Stack horizontal={false}>
      <Stack sx={styles.header}>
        <Text variant='title' size='lg'>
          Create new deck
        </Text>
      </Stack>
      <form action={submit}>
        <Stack horizontal={false} sx={styles.content} gap={2}>
          <TextField shrink label='Deck name' name='name' placeholder='Add a name for you deck' />
          <Stack horizontal={false} gap={1}>
            <Text size='md'>Choose a icon</Text>
            <TooltipRich
              placement='bottom-start'
              openEvents={{ click: true, hover: false }}
              content={({ close }) => (
                <Suspense
                  fallback={
                    <Stack sx={styles.loading} justify='center' align='center'>
                      <Text size='sm'>Loading...</Text>
                    </Stack>
                  }>
                  <EmojiPicker
                    open
                    previewConfig={{ showPreview: false }}
                    onEmojiClick={({ emoji }) => {
                      close()
                      setIcon(emoji)
                    }}
                  />
                </Suspense>
              )}>
              <ButtonBase sx={styles.emojiButton}>{icon}</ButtonBase>
            </TooltipRich>
          </Stack>
        </Stack>
        <Stack sx={styles.footer} gap={0.5} justify='flex-end'>
          <Button onClick={props.onCancel}>Cancel</Button>
          <Button type='submit' variant='filled'>
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
    padding: spacing.padding2,
  },
  content: {
    padding: spacing.padding2,
  },
  footer: {
    padding: spacing.padding1,
  },
  emojiButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid',
    borderColor: palette.outlineVariant,
    borderRadius: shape.lg,
    fontSize: 34,
    width: 80,
    height: 80,
  },
  loading: {
    minWidth: 320,
    minHeight: 390,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
