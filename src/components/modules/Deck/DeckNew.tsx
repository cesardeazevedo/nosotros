import { deckNewPane } from '@/atoms/deck.atoms'
import { Button } from '@/components/ui/Button/Button'
import { Stack } from '@/components/ui/Stack/Stack'
import { IconNewSection } from '@tabler/icons-react'
import { useAtom } from 'jotai'
import { css } from 'react-strict-dom'
import { DeckColumnContainer } from './DeckColumnContainer'
import { DeckMenu } from './DeckMenu'

export const DeckNew = () => {
  const [open, setOpen] = useAtom(deckNewPane)
  return (
    <>
      {open && <DeckMenu onClose={() => setOpen(false)} />}
      <DeckColumnContainer paper={false} sx={styles.noborder}>
        <Stack horizontal={false} align='center' justify='center' sx={styles.root} gap={4}>
          <Stack horizontal={false} align='center' gap={4}>
            <Button
              disabled={open}
              variant='filled'
              sx={styles.button}
              icon={<IconNewSection />}
              onClick={() => setOpen(true)}>
              Add Column
            </Button>
          </Stack>
        </Stack>
      </DeckColumnContainer>
    </>
  )
}

const styles = css.create({
  root: {
    height: '100%',
  },
  noborder: {
    border: 'none',
  },
  button: {
    height: 50,
  },
})
