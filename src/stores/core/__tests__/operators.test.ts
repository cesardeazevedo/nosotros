import { of } from 'rxjs'
import { fakeNote } from 'utils/faker'
import { bufferLatestCreatedAt } from '../operators'

describe('Operators', () => {
  test('bufferLatestCreatedAt', () => {
    const note1 = fakeNote({ id: '1', pubkey: '1', content: 'a', created_at: 1 })
    const note2 = fakeNote({ id: '2', pubkey: '1', content: 'b', created_at: 2 })
    const note3 = fakeNote({ id: '3', pubkey: '2', content: 'c', created_at: 2 })
    const note4 = fakeNote({ id: '4', pubkey: '2', content: 'd', created_at: 1 })
    return new Promise<void>((done) => {
      of(note1, note2, note3, note4)
        .pipe(bufferLatestCreatedAt(0))
        .subscribe((data) => {
          expect(data).toStrictEqual([note2, note3])
          done()
        })
    })
  })
})
