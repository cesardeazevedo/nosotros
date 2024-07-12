import { Button, LinearProgress, Typography } from '@mui/material'
import { IconTrashXFilled } from '@tabler/icons-react'
import { CenteredContainer } from 'components/elements/Layouts/CenteredContainer'
import { Row } from 'components/elements/Layouts/Flex'
import PaperContainer from 'components/elements/Layouts/PaperContainer'
import { storage } from 'nostr/storage'
import { useCallback, useState } from 'react'

function ErrorBoundary() {
  const [cleaning, setCleaning] = useState(false)

  const handleClick = useCallback(async () => {
    setCleaning(true)
    await storage.clearDB()
    setCleaning(false)
  }, [])

  return (
    <CenteredContainer maxWidth='sm'>
      <PaperContainer sx={{ mt: 10 }}>
        {cleaning && <LinearProgress variant='indeterminate' color='error' />}
        <Row sx={{ p: 4, justifyContent: 'center', color: 'error.main' }}>
          <Typography variant='h5' align='center' sx={{ ml: 2 }}>
            ERROR
          </Typography>
        </Row>
        <Typography variant='subtitle1' align='center' sx={{ p: 2, fontSize: '110%' }}>
          {`An error occurred during the content render. To fix this, try clearing the browser's cache and local IndexedDB
          by clicking the button below.`}
          <br /> {`It's safe and might help resolve the issue below.`}
        </Typography>
        <Row sx={{ p: 4, justifyContent: 'center' }}>
          <Button size='large' variant='contained' onClick={handleClick} disabled={cleaning}>
            {!cleaning && <IconTrashXFilled size={18} style={{ marginRight: 8 }} />}
            {cleaning ? 'Cleaning' : 'Clear Database'}
          </Button>
        </Row>
      </PaperContainer>
    </CenteredContainer>
  )
}

export default ErrorBoundary
