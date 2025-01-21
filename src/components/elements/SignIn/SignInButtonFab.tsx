import { buttonTokens } from '@/components/ui/Button/Button.stylex'
import { Fab } from '@/components/ui/Fab/Fab'
import { typeScale } from '@/themes/typeScale.stylex'
import { useMobile } from 'hooks/useMobile'
import { css } from 'react-strict-dom'
import { IconNostr } from '../Icons/IconNostr'
import { LinkSignIn } from '../Links/LinkSignIn'

export const SignInButtonFab = () => {
  const isMobile = useMobile()
  return (
    <LinkSignIn>
      <Fab variant='primary' size='lg' label='Join Nostr' sx={[styles.root, isMobile && styles.root$mobile]}>
        <IconNostr />
      </Fab>
    </LinkSignIn>
  )
}

const styles = css.create({
  root: {
    position: 'fixed',
    right: 40,
    bottom: 40,
    [buttonTokens.labelTextSize]: typeScale.titleSize$md,
  },
  root$mobile: {
    margin: 'auto',
    right: 0,
    left: 0,
    width: 160,
    bottom: 100,
  },
})
