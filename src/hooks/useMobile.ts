import { useMediaQuery } from './useMediaQuery'

/**
 * This likely needs to a lot more saphisticated than this
 */
export function useMobile() {
  return useMediaQuery('(max-width: 599.95px)')
}
