import { useLayoutEffect, useRef } from 'react'

export function useEventCallback<Args extends unknown[], Return>(
  fn: (...args: Args) => Return,
): (...args: Args) => Return {
  const ref = useRef(fn)
  useLayoutEffect(() => {
    ref.current = fn
  })
  return useRef((...args: Args) =>
    // @ts-expect-error hide `this`
    (0, ref.current!)(...args),
  ).current
}
