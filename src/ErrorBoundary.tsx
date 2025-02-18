import { db } from '@/nostr/db'
import { IconTrashXFilled } from '@tabler/icons-react'
import { CenteredContainer } from 'components/elements/Layouts/CenteredContainer'
import { PaperContainer } from 'components/elements/Layouts/PaperContainer'
import { applySnapshot } from 'mobx-state-tree'
import { useCallback, useState } from 'react'
import { css } from 'react-strict-dom'
import { Button } from './components/ui/Button/Button'
import { Stack } from './components/ui/Stack/Stack'
import { Text } from './components/ui/Text/Text'
import { initialState } from './stores/helpers/initialState'
import { rootStore } from './stores/root.store'
import { palette } from './themes/palette.stylex'
import { spacing } from './themes/spacing.stylex'

export const ErrorBoundary = () => {
  const [cleaning, setCleaning] = useState(false)

  const handleClick = useCallback(async () => {
    setCleaning(true)
    await db.clearDB()
    setCleaning(false)
    applySnapshot(rootStore, initialState)
  }, [])

  return (
    <CenteredContainer margin>
      <PaperContainer>
        <Stack horizontal={false} sx={styles.content}>
          <Text variant='headline' size='lg' sx={styles.title}>
            Error
          </Text>
          <Text variant='body' size='lg'>
            {`An error occurred during the content render. To fix this, try clearing the browser's cache and local IndexedDB
        by clicking the button below.`}
            <br /> {`It's safe and might help resolve the issue below.`}
          </Text>
          <Button
            variant='filled'
            onClick={handleClick}
            disabled={cleaning}
            sx={styles.button}
            icon={<>{!cleaning && <IconTrashXFilled size={18} style={{ marginRight: 8 }} />}</>}>
            {cleaning ? 'Cleaning' : 'Clear Database'}
          </Button>
        </Stack>
      </PaperContainer>
    </CenteredContainer>
  )
}

const styles = css.create({
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    marginTop: spacing.margin8,
    padding: spacing.padding4,
  },
  title: {
    color: palette.error,
    marginBlock: spacing.margin2,
  },
  button: {
    marginTop: spacing.margin2,
  },
})
