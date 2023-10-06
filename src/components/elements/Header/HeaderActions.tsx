import { Divider, IconButton, Link, useColorScheme } from '@mui/material'
import { IconBrandGithub, IconMoon, IconServerBolt, IconSun } from '@tabler/icons-react'
import Tooltip from '../Layouts/Tooltip'
import HeaderSignIn from './HeaderSignIn'

type Props = {
  isHome: boolean
}

function HeaderActions(props: Props) {
  const { isHome } = props
  const { mode, setMode } = useColorScheme()
  return (
    <>
      <Tooltip arrow comingSoon title='Configure Relays' enterDelay={0}>
        <IconButton color='inherit' sx={[{ mr: 1 }, isHome && { ['@media (max-width: 1140px)']: { display: 'none' } }]}>
          <IconServerBolt strokeWidth='1.5' />
        </IconButton>
      </Tooltip>
      <Tooltip arrow title='See open source code' enterDelay={0}>
        <Link href='https://github.com/cesardeazevedo/nosotros' target='_blank' rel='noopener'>
          <IconButton
            color='inherit'
            sx={[{ mr: 1 }, isHome && { ['@media (max-width: 1040px)']: { display: 'none' } }]}>
            <IconBrandGithub strokeWidth='1.5' />
          </IconButton>
        </Link>
      </Tooltip>
      <Tooltip arrow title='Toggle dark / light theme' enterDelay={0}>
        <IconButton
          color='inherit'
          sx={[{ mr: 1 }, isHome && { ['@media (max-width: 940px)']: { display: 'none' } }]}
          onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}>
          {mode === 'light' ? <IconMoon strokeWidth='1.5' /> : <IconSun />}
        </IconButton>
      </Tooltip>
      <Divider flexItem orientation='vertical' sx={{ mr: 3, ml: 1, height: 16, alignSelf: 'center' }} />
      <HeaderSignIn />
    </>
  )
}

export default HeaderActions
