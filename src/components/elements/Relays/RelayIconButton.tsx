import { Chip } from '@/components/ui/Chip/Chip'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { useCurrentUser } from '@/hooks/useRootStore'
import { shape } from '@/themes/shape.stylex'
import { IconServerBolt } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import { css } from 'react-strict-dom'
import type { StrictClickEvent } from 'react-strict-dom/dist/types/StrictReactDOMProps'

type Props = {
  onClick?: (event: StrictClickEvent) => void
}

export const RelayIconButton = observer(function RelayIconButton(props: Props) {
  const user = useCurrentUser()
  return (
    <Tooltip cursor='arrow' text='Connected Relays'>
      <span>
        {user && (
          <Chip
            onClick={props.onClick}
            icon={<IconServerBolt strokeWidth='1.5' />}
            sx={styles.chip}
            label={`${user.connectedRelays.length || 0} / ${user.userRelays?.length || 0}`}
          />
        )}
      </span>
    </Tooltip>
  )
})

const styles = css.create({
  chip: {
    height: 40,
    borderRadius: shape.full,
  },
})
