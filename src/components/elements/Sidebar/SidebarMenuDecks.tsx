import { toggleCreateDeckDialogAtom } from '@/atoms/dialog.atoms'
import { useDecks } from '@/components/modules/Deck/hooks/useDeck'
import { Expandable } from '@/components/ui/Expandable/Expandable'
import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { Stack } from '@/components/ui/Stack/Stack'
import { spacing } from '@/themes/spacing.stylex'
import { Link, useMatchRoute } from '@tanstack/react-router'
import { useSetAtom } from 'jotai'
import { memo } from 'react'
import { css, html } from 'react-strict-dom'
import { SidebarSubheader } from './SidebarSubheader'

type Props = {
  expanded?: boolean
}

export const SidebarMenuDecks = memo(function SidebarMenuDecks(props: Props) {
  const match = useMatchRoute()
  const decks = useDecks()
  const toggleDeckDialog = useSetAtom(toggleCreateDeckDialogAtom)
  return (
    <Expandable
      initiallyExpanded={props.expanded ?? !!match({ to: '/deck/$id' })}
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
                leadingIcon={deck.icon && <html.div style={styles.icon}>{deck.icon}</html.div>}
                onClick={() => {}}
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
    backgroundColor: 'white',
    borderRadius: 50,
    fontSize: 18,
    width: 28,
    height: 28,
  },
})
