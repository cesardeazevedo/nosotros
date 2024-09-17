import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { useGoBack, useNostrRoute } from '@/hooks/useNavigations'
import { userStore } from '@/stores/nostr/users.store'
import { isNprofile, isNpub } from '@/utils/nip19'
import { IconChevronLeft } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import { css } from 'react-strict-dom'
import UserName from '../User/UserName'
import UserAvatar from '../User/UserAvatar'
import { useMatch } from '@tanstack/react-router'

export const NavigationHeader = observer(function NavigationHeader() {
  useMatch({ from: '__root__' })
  const nostrRoute = useNostrRoute()
  const goBack = useGoBack()

  // TODO: This needs better inference
  let context = null
  if (nostrRoute?.context && 'decoded' in nostrRoute.context) {
    context = nostrRoute.context
  }
  return (
    <Stack justify='flex-start' gap={2} sx={styles.root}>
      <IconButton onClick={goBack} icon={<IconChevronLeft color='currentColor' />} />
      <Text variant='title' size='lg'>
        {isNpub(context?.decoded) || isNprofile(context?.decoded) ? (
          <Stack horizontal={false}>
            <Stack gap={2}>
              <UserAvatar size='sm' user={userStore.get(context.id)} />
              <UserName size='lg' user={userStore.get(context.id)} />
            </Stack>
          </Stack>
        ) : (
          'Post'
        )}
      </Text>
    </Stack>
  )
})

const styles = css.create({
  root: {
    flex: 1,
    alignSelf: 'flex-start',
  },
})
