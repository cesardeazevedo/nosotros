import { useMediaQuery } from './useMediaQuery'

export function useSM() {
  return useMediaQuery('(max-width: 600px)')
}

export function useMobile() {
  return useMediaQuery('(max-width: 960px)')
}
