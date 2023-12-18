import { test } from 'utils/fixtures'

describe('DialogsStore', () => {
  test('Should assert multiple replies stack', ({ root }) => {
    const store = root.dialogs
    expect(store.replies).toStrictEqual([false])
    store.pushReply('1')
    expect(store.replies).toStrictEqual(['1', false])
    store.pushReply('2')
    expect(store.replies).toStrictEqual(['1', '2', false])
    store.pushReply('3')
    expect(store.replies).toStrictEqual(['1', '2', '3', false])
    store.closeReply()
    expect(store.replies).toStrictEqual(['1', '2', false])
    store.closeReply()
    expect(store.replies).toStrictEqual(['1', false])
    store.closeReply()
    expect(store.replies).toStrictEqual([false])
    store.closeReply()
    expect(store.replies).toStrictEqual([false])
  })
})
