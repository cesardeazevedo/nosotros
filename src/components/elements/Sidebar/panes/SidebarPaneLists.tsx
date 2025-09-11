import { listTypeTitleAtom, listTypeViewAtom } from '@/atoms/listMenu.atoms'
import { ListTypeMenu } from '@/components/modules/Lists/ListTypeMenu'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import type { SxProps } from '@/components/ui/types'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconArrowLeft, IconLayoutSidebarLeftExpand } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { useAtomValue, useSetAtom } from 'jotai'
import { memo, useContext, type RefObject } from 'react'
import { css, html } from 'react-strict-dom'
import { SidebarContext } from '../SidebarContext'

type Props = {
  ref?: RefObject<null>
  sx?: SxProps
}

export const SidebarPaneLists = memo(function SidebarPaneList(props: Props) {
  const context = useContext(SidebarContext)
  const view = useAtomValue(listTypeViewAtom)
  const title = useAtomValue(listTypeTitleAtom)
  const setView = useSetAtom(listTypeViewAtom)

  return (
    <Stack horizontal={false} align='flex-start' ref={props.ref} sx={[styles.root, props.sx]}>
      <html.div style={styles.content}>
        <Stack sx={styles.header} justify='space-between'>
          {view !== 'menu' && (
            <IconButton onClick={() => setView('menu')}>
              <IconArrowLeft size={20} />
            </IconButton>
          )}
          <Text variant='title' size='lg'>
            {title}
          </Text>
          <Tooltip text='Open in page'>
            <Link to='/lists' onClick={() => context.setPane(false)}>
              <IconButton>
                <IconLayoutSidebarLeftExpand size={22} />
              </IconButton>
            </Link>
          </Tooltip>
        </Stack>
        <Stack horizontal={false} gap={0.5}>
          <ListTypeMenu />
        </Stack>
      </html.div>
    </Stack>
  )
})

const styles = css.create({
  root: {
    width: 400,
    position: 'fixed',
    backgroundColor: palette.surfaceContainerLowest,
    borderRight: '1px solid',
    borderRightColor: palette.outlineVariant,
    borderTopRightRadius: shape.xl,
    borderBottomRightRadius: shape.xl,
    left: 84,
    top: 0,
    bottom: 0,
    zIndex: 50,
  },
  header: {
    position: 'sticky',
    top: 0,
    backgroundColor: palette.surfaceContainerLowest,
    zIndex: 10,
    width: '100%',
    padding: spacing.padding2,
  },
  content: {
    position: 'relative',
    width: '100%',
    height: 'auto',
    paddingBottom: spacing.padding2,
    overflowY: 'auto',
  },
})
