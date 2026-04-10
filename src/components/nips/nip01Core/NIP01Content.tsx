// import { PostActions } from '@/components/elements/Posts/PostActions/PostActions'
// import { PostContent } from '@/components/elements/Posts/PostContent'
// import { PostContentHidden } from '@/components/elements/Posts/PostContentHidden'
// import { NostrEventDB } from '@/db/sqlite/sqlite.types'
// import { useNoteState } from '@/hooks/state/useNote'
//
// type Props = {
//   event: NostrEventDB
// }
//
// export const NIP01Content = (props: Props) => {
//   const { event } = props
//   const note = useNoteState(event, { repliesOpen: true, forceSync: true, contentOpen: true })
//   return (
//     <PostContentHidden event={event}>
//       <PostContent note={note} />
//       <PostActions dense note={note} />
//     </PostContentHidden>
//   )
// }
