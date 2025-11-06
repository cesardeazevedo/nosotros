import { useNavigate } from '@tanstack/react-router'

export function useMediaLink(nevent: string | undefined, index: number = 0) {
  const navigate = useNavigate()
  return (e: { preventDefault: () => void; stopPropagation: () => void }) => {
    e.preventDefault()
    e.stopPropagation()
    navigate({
      to: '.',
      search: (s) => ({
        ...s,
        media: index,
        n: nevent,
      }),
    })
    return
  }
}
