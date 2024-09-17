import { useMediaQuery } from './useMediaQuery'

export const MEDIA_QUERY_MOBILE = '@media (max-width: 599.95px)'

/**
 * This likely needs to a lot more saphisticated than this
 */
export function useMobile() {
  return useMediaQuery('(max-width: 599.95px)')
}
