import { useMediaQuery, type Theme } from '@mui/material'

/**
 * This likely needs to a lot more saphisticated than this
 */
export function useMobile() {
  return useMediaQuery((theme: Theme) => theme.breakpoints.down('md'))
}
