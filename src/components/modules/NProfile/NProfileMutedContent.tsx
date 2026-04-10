import { Button } from '@/components/ui/Button/Button'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { useUserState } from '@/hooks/state/useUser'
import { useCurrentPubkey } from '@/hooks/useAuth'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { css } from 'react-strict-dom'

type Props = {
  pubkey: string
  children: ReactNode
}

export const NProfileMutedContent = (props: Props) => {
  const { pubkey, children } = props
  const currentPubkey = useCurrentPubkey()
  const currentUser = useUserState(currentPubkey, { fullUserSync: true })
  const isMutedProfile = !!currentPubkey && currentPubkey !== pubkey && currentUser.mutedAuthors?.has(pubkey)
  const [showMutedContent, setShowMutedContent] = useState(false)

  if (!isMutedProfile) {
    return children
  }

  return (
    <Stack horizontal={false}>
      <Stack horizontal={false} sx={styles.notice} gap={2} align='center' justify='space-between'>
        <Text variant='body' size='lg' sx={styles.noticeText}>
          This profile is muted.
        </Text>
        {!showMutedContent && (
          <Button
            variant='filledTonal'
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              setShowMutedContent(true)
            }}>
            See Content
          </Button>
        )}
      </Stack>
      {showMutedContent ? children : null}
    </Stack>
  )
}

const styles = css.create({
  notice: {
    paddingInline: spacing.padding2,
    paddingBlock: spacing.padding4,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: palette.outlineVariant,
  },
  noticeText: {
    color: palette.onSurfaceVariant,
  },
})
