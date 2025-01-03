import { IconButton } from '@/components/ui/IconButton/IconButton'
import { List } from '@/components/ui/List/List'
import { ListItem } from '@/components/ui/ListItem/ListItem'
import { listItemTokens } from '@/components/ui/ListItem/ListItem.stylex'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { useCurrentPubkey, useRootStore } from '@/hooks/useRootStore'
import { spacing } from '@/themes/spacing.stylex'
import { IconBellFilled, IconChevronLeft, IconUser } from '@tabler/icons-react'
import { useCallback, useState } from 'react'
import { css } from 'react-strict-dom'
import { IconHomeFilled } from '../Icons/IconHomeFilled'
import { PaperContainer } from '../Layouts/PaperContainer'
import { DeckAddProfile } from './DeckAddProfile'
import { DeckColumn } from './DeckColumn'
import { DeckColumnHeader } from './DeckColumnHeader'

type Views = 'profiles'

type Props = {
  onClose?: () => void
}

export const DeckNewColumnList = (props: Props) => {
  const [view, setView] = useState<Views | null>(null)
  const deck = useRootStore().decks.selected
  const pubkey = useCurrentPubkey()

  const handleOpenProfiles = useCallback(() => {
    setView('profiles')
  }, [])

  const handleBack = useCallback(() => {
    setView(null)
  }, [])

  const handleAddHome = useCallback(() => {
    if (pubkey) {
      deck.addHome(pubkey)
    } else {
      deck.addWelcome()
    }
    props.onClose?.()
  }, [pubkey])

  const handleAddProfile = useCallback((item: { pubkey: string }) => {
    deck.addNProfile({ pubkey: item.pubkey })
    props.onClose?.()
  }, [])

  const handleAddNotification = useCallback(() => {
    if (pubkey) {
      deck.addNotification({ pubkey })
      props.onClose?.()
    }
  }, [pubkey])

  return (
    <DeckColumn size='sm'>
      <DeckColumnHeader id='addcolumn' name='Add Column' onDelete={props.onClose}>
        <Stack gap={1}>
          {!!view && <IconButton onClick={handleBack} icon={<IconChevronLeft />} />}
          <Text variant='title' size='md'>
            Add Column
          </Text>
        </Stack>
      </DeckColumnHeader>
      <PaperContainer sx={styles.content} shape='none'>
        {!view && (
          <List sx={styles.list}>
            <ListItem interactive sx={styles.item} leadingIcon={<IconHomeFilled size={26} />} onClick={handleAddHome}>
              <Text size='lg'>Home feed</Text>
            </ListItem>
            <ListItem
              interactive
              sx={styles.item}
              leadingIcon={<IconUser fill='currentColor' size={26} />}
              onClick={handleOpenProfiles}>
              <Text size='lg'>Profiles</Text>
            </ListItem>
            <ListItem
              interactive
              sx={styles.item}
              leadingIcon={<IconBellFilled size={26} />}
              onClick={handleAddNotification}>
              <Text size='lg'>Notifications</Text>
            </ListItem>
          </List>
        )}
        {view === 'profiles' && <DeckAddProfile onSelect={handleAddProfile} />}
      </PaperContainer>
    </DeckColumn>
  )
}

const styles = css.create({
  content: {
    padding: spacing.padding1,
    [listItemTokens.containerMinHeight$sm]: 40,
  },
  list: {
    width: '100%',
  },
  item: {
    width: '100%',
    height: 50,
  },
})
