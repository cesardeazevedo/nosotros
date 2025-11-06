import { useContentContext } from '@/components/providers/ContentProvider'
import type { Props as IconButtonProps } from '@/components/ui/IconButton/IconButton'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { useNevent } from '@/hooks/useEventUtils'
import { IconMaximize } from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'
import { memo, type Ref } from 'react'

type Props = IconButtonProps & {
  ref?: Ref<HTMLButtonElement | null>
  parent: NostrEventDB
}

export const EditorButtonMaximize = memo(function EditorButtonBroadcast(props: Props) {
  const { ref, parent, ...rest } = props
  const { dense } = useContentContext()
  const navigate = useNavigate()
  const nevent = useNevent(parent)
  return (
    <Tooltip cursor='arrow' text='Maximize' enterDelay={200}>
      <IconButton
        {...rest}
        ref={ref}
        size={dense ? 'sm' : 'md'}
        icon={<IconMaximize size={dense ? 20 : 22} strokeWidth='1.6' />}
        onClick={() => {
          navigate({
            to: '.',
            search: (search) => ({ ...search, replying: nevent }),
          })
        }}
      />
    </Tooltip>
  )
})
