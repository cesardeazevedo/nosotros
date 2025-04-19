import { useMediaQuery } from './useMediaQuery'

export function useSM() {
  return useMediaQuery('(max-width: 720px)')
}

export function useMobile() {
  return useMediaQuery('(max-width: 960px)')
}

export function useLG() {
  return useMediaQuery('(max-width: 1299.95px)')
}
