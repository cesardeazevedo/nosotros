// import { Kind } from '@/constants/kinds'
// import { fakeEvent } from '@/utils/faker'
//
// test('assert buildFilters', () => {
//   expect(
//     getNoteStatsFilters(fakeEvent({ kind: Kind.Text, id: '1' }), {
//       replies: true,
//       reposts: true,
//       reactions: true,
//       zaps: true,
//     }),
//   ).toStrictEqual([{ kinds: [Kind.Text, Kind.Repost, Kind.Reaction, Kind.ZapReceipt], '#e': ['1'] }])
//
//   expect(
//     getNoteStatsFilters(fakeEvent({ kind: Kind.Text, id: '2' }), {
//       replies: true,
//       reposts: false,
//       reactions: false,
//       zaps: true,
//     }),
//   ).toStrictEqual([{ kinds: [Kind.Text, Kind.ZapReceipt], '#e': ['2'] }])
//
//   expect(
//     getNoteStatsFilters(fakeEvent({ kind: Kind.Media, id: '1' }), {
//       replies: true,
//       reposts: false,
//       reactions: false,
//       zaps: false,
//     }),
//   ).toStrictEqual([
//     { kinds: [Kind.Comment], '#e': ['1'] },
//     { kinds: [Kind.Comment], '#E': ['1'] },
//   ])
//
//   expect(
//     getNoteStatsFilters(fakeEvent({ kind: Kind.Article, id: '3', pubkey: '1', tags: [['d', '123']] }), {
//       replies: true,
//       reposts: true,
//       reactions: true,
//       zaps: true,
//     }),
//   ).toStrictEqual([
//     {
//       kinds: [Kind.Text, Kind.Comment, Kind.Repost, Kind.Reaction, Kind.ZapReceipt, Kind.Comment],
//       '#a': [`30023:1:123`],
//     },
//     { kinds: [Kind.Text, Kind.Comment, Kind.Repost, Kind.Reaction, Kind.ZapReceipt], '#e': ['3'] },
//     { kinds: [Kind.Comment], '#E': ['3'] },
//   ])
//
//   // We don't wanna fetch kind01 replies for Media kinds
//   expect(
//     getNoteStatsFilters(fakeEvent({ kind: Kind.Media, id: '3', pubkey: '1', tags: [['d', '123']] }), {
//       replies: true,
//       reposts: true,
//       reactions: true,
//       zaps: true,
//     }),
//   ).toStrictEqual([
//     { kinds: [Kind.Comment, Kind.Repost, Kind.Reaction, Kind.ZapReceipt], '#e': ['3'] },
//     { kinds: [Kind.Comment], '#E': ['3'] },
//   ])
// })
