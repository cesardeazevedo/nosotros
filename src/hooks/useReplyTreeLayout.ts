import { useLayoutEffect, useRef } from 'react'

export function useReplyTreeLayout(open: boolean, hasReplies: boolean) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const avatarCellRef = useRef<HTMLDivElement | null>(null)
  const childrenRef = useRef<HTMLDivElement | null>(null)

  useLayoutEffect(() => {
    const host = rootRef.current
    const parentAvatar = avatarCellRef.current
    const list = childrenRef.current
    if (!host) {
      return
    }

    const setHeight = (px: number) => host.style.setProperty('--connector-height', `${Math.max(0, Math.round(px))}px`)

    if (!open || !hasReplies || !parentAvatar || !list) {
      setHeight(0)
      return
    }

    const update = () => {
      const parentBottom = parentAvatar.getBoundingClientRect().bottom

      const lastChild = Array.from(list.children).findLast((child) => {
        return child.hasAttribute('aria-level')
      })
      if (!lastChild) {
        setHeight(0)
        return
      }
      const lastChildAvatar = lastChild.querySelector<HTMLElement>('[data-reply-avatar="1"]')
      if (!lastChildAvatar) {
        setHeight(0)
        return
      }

      const targetBottom = lastChildAvatar.getBoundingClientRect().bottom
      const h = targetBottom - parentBottom
      setHeight(Number.isFinite(h) ? h : 0)
    }

    update()

    const ro = new ResizeObserver(update)
    ro.observe(parentAvatar)
    ro.observe(list)
    ro.observe(host)

    const mo = new MutationObserver(update)
    mo.observe(list, { childList: true, subtree: true })

    window.addEventListener('resize', update)
    const raf = requestAnimationFrame(update)

    return () => {
      ro.disconnect()
      mo.disconnect()
      window.removeEventListener('resize', update)
      cancelAnimationFrame(raf)
    }
  }, [open, hasReplies])

  return { rootRef, avatarCellRef, childrenRef }
}
