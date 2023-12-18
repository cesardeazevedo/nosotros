import { Divider, IconButton, Link } from '@mui/material'
import { IconBrandGithub, IconServerBolt } from '@tabler/icons-react'
import ThemeButton from '../Buttons/ThemeButton'
import Tooltip from '../Layouts/Tooltip'
import HeaderSignIn from './HeaderSignIn'

function HeaderActions() {
  return (
    <>
      <Tooltip arrow comingSoon title='Configure Relays' enterDelay={0}>
        <IconButton color='inherit' sx={[{ mr: 1, ['@media (max-width: 1140px)']: { display: 'none' } }]}>
          <IconServerBolt strokeWidth='1.5' />
        </IconButton>
      </Tooltip>
      <Tooltip arrow title='See open source code' enterDelay={0}>
        <Link href='https://github.com/cesardeazevedo/nosotros' target='_blank' rel='noopener'>
          <IconButton color='inherit' sx={[{ mr: 1, ['@media (max-width: 1040px)']: { display: 'none' } }]}>
            <IconBrandGithub strokeWidth='1.4' />
          </IconButton>
        </Link>
      </Tooltip>
      <ThemeButton sx={{ ['@media (max-width: 940px)']: { display: 'none' } }} />
      <Divider flexItem orientation='vertical' sx={{ mr: 3, ml: 1, height: 16, alignSelf: 'center' }} />
      <HeaderSignIn />
    </>
  )
}

export default HeaderActions
