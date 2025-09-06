import type { Kind } from '@/constants/kinds'

export function makeSubId(id: string | undefined, kinds: Kind[] | undefined) {
  return [id, ...(kinds || []), Math.random().toString().slice(2, 6)].filter((x) => x !== undefined).join('_')
}
