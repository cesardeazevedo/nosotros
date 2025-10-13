import { useMediaQuery } from './useMediaQuery'

export function useXS() {
  return useMediaQuery('(max-width: 380px)')
}

export function useSM() {
  return useMediaQuery('(max-width: 640px)')
}

export function useMobile() {
  return useMediaQuery('(max-width: 960px)')
}

export function useLG() {
  return useMediaQuery('(max-width: 1299.95px)')
}
