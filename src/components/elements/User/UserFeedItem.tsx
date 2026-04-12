import { FollowButton } from "@/components/modules/Follows/FollowButton"
import { Paper } from "@/components/ui/Paper/Paper"
import { Stack } from "@/components/ui/Stack/Stack"
import { spacing } from "@/themes/spacing.stylex"
import { css } from "react-strict-dom"
import { UserContentAbout } from "./UserContentAbout"

type Props = {
  pubkey: string
}

export const UserItem = function UserFeedItem(props: Props) {
  const { pubkey } = props
  return (
    <Stack align='flex-start' justify='space-between' gap={4} sx={styles.root}>
      <Stack horizontal={false}>
        <UserContentAbout pubkey={pubkey} />
      </Stack>
      <FollowButton value={pubkey} />
    </Stack>
  )
}

export const UserFeedItem = function UserFeedItem(props: Props) {
  return (
    <Paper sx={styles.paper}>
      <UserItem {...props} />
    </Paper>
  )
}

const styles = css.create({
  root: {
    paddingBlock: spacing.padding2
  },
  paper: {
    marginTop: spacing.margin1,
  }
})
