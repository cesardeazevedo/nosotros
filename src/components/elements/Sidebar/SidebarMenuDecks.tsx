import { deleteDeckAtom } from '@/atoms/deck.atoms'
import { toggleCreateDeckDialogAtom } from '@/atoms/dialog.atoms'
import { useDecks } from '@/components/modules/Deck/hooks/useDeck'
import { Expandable } from '@/components/ui/Expandable/Expandable'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { Stack } from '@/components/ui/Stack/Stack'
import { visibleOnHoverStyle } from '@/components/ui/helpers/visibleOnHover.stylex'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconX } from '@tabler/icons-react'
import { Link, useMatch, useNavigate, useParams } from '@tanstack/react-router'
import { useSetAtom } from 'jotai'
import { memo } from 'react'
import { css, html } from 'react-strict-dom'
import { SidebarSubheader } from './SidebarSubheader'

type Props = {
  expanded?: boolean
}

export const SidebarMenuDecks = memo(function SidebarMenuDecks(props: Props) {
  const decks = useDecks()
  const isDeckRoute = !!useMatch({ from: '/deck/$id', shouldThrow: false })
  const currentDeckId = useParams({ from: '/deck/$id', shouldThrow: false })?.id
  const navigate = useNavigate()
  const toggleDeckDialog = useSetAtom(toggleCreateDeckDialogAtom)
  const deleteDeck = useSetAtom(deleteDeckAtom)
  return (
    <Expandable
      initiallyExpanded={props.expanded ?? !!isDeckRoute}
      trigger={(triggerProps) => (
        <SidebarSubheader {...triggerProps} label={'Decks'} onCreateClick={() => toggleDeckDialog()} />
      )}>
      <Stack horizontal={false} sx={styles.content} gap={0.5}>
        {decks?.map((deck) => (
          <Link key={deck.id} to='/deck/$id' params={{ id: deck.id }}>
            {({ isActive }) => (
              <MenuItem
                key={deck.id}
                size='sm'
                selected={isActive}
                label={deck.name}
                sx={visibleOnHoverStyle.root}
                leadingIcon={deck.icon && <html.div style={styles.icon}>{deck.icon}</html.div>}
                onClick={() => { }}
                trailingIcon={
                  deck.id !== 'default' && (
                    <IconButton
                      size='sm'
                      as='div'
                      sx={visibleOnHoverStyle.item}
                      onClick={(event) => {
                        event.preventDefault()
                        event.stopPropagation()
                        deleteDeck(deck.id)
                        if (currentDeckId === deck.id) {
                          navigate({ to: '/deck/$id', params: { id: 'default' } })
                        }
                      }}>
                      <IconX size={18} strokeWidth='1.8' />
                    </IconButton>
                  )
                }
              />
            )}
          </Link>
        ))}
      </Stack>
    </Expandable>
  )
})

const styles = css.create({
  content: {
    maxHeight: 300,
    overflow: 'auto',
    marginTop: spacing['padding0.5'],
  },
  icon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.surfaceContainer,
    borderRadius: 50,
    fontSize: 18,
    width: 28,
    height: 28,
  },
})
