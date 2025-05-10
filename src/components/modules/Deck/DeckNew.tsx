import { Button } from '@/components/ui/Button/Button'
import { Stack } from '@/components/ui/Stack/Stack'
import { IconNewSection } from '@tabler/icons-react'
import { useState } from 'react'
import { css } from 'react-strict-dom'
import { DeckColumn } from './DeckColumn'
import { DeckMenu } from './DeckMenu'

export const DeckNew = () => {
  const [open, setOpen] = useState(false)
  return (
    <>
      {open && <DeckMenu onClose={() => setOpen(false)} />}
      <DeckColumn paper={false} sx={styles.noborder}>
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
      </DeckColumn>
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
