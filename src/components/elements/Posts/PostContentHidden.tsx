import { Button } from '@/components/ui/Button/Button'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { useMuted } from '@/hooks/useMuted'
import { spacing } from '@/themes/spacing.stylex'
import { useState } from 'react'
import { css } from 'react-strict-dom'

type Props = {
  event: NostrEventDB
  children: React.ReactNode
}

export const PostContentHidden = (props: Props) => {
  const { event, children } = props
  const { isMuted } = useMuted(event)
  const [showMutedContent, setShowMutedContent] = useState(false)
  const hideContent = !!isMuted && !showMutedContent

  if (!hideContent) {
    return children
  }

  return (
    <Stack horizontal={false} gap={2} align='center' sx={styles.root}>
      <Text variant='title' size='lg' sx={styles.label}>
        This post is from someone you muted.
      </Text>
      <Button
        variant='filledTonal'
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          setShowMutedContent(true)
        }}>
        See Content
      </Button>
    </Stack>
  )
}

const styles = css.create({
  root: {
    paddingInline: spacing.padding2,
    paddingBlock: spacing.padding9,
  },
  label: {},
  subLabel: {
    textAlign: 'center',
  },
})
