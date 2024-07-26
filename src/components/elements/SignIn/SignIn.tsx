import { Box, Divider } from '@mui/material'
import { useMobile } from 'hooks/useMobile'
import { OnboardMachineContext } from './SignInContext'
import SignInHeader from './SignInHeader'
import SignInSlides from './SignInSlides'

function SignIn() {
  const isMobile = useMobile()
  return (
    <OnboardMachineContext.Provider>
      <Box sx={{ height: 'calc(100% - 70px)' }}>
        <SignInHeader />
        {!isMobile && <Divider />}
        <SignInSlides />
      </Box>
    </OnboardMachineContext.Provider>
  )
}

export default SignIn
