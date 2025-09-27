import { Button } from '@/components/ui/Button/Button'
import { css } from 'react-strict-dom'
import { IconNostr } from '../Icons/IconNostr'
import { LinkSignIn } from '../Links/LinkSignIn'

export const JoinNostrButton = () => {
  return (
    <LinkSignIn>
      <Button sx={styles.root} fullWidth variant='filled'>
        <IconNostr />
        Join Nostr
      </Button>
    </LinkSignIn>
  )
}

const styles = css.create({
  root: {
    height: 50,
  },
})
