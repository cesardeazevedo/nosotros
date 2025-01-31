import { createEditor } from '@/components/elements/Editor/createEditor'
import { EditorStore } from '../editor.store'

describe('EditorStore', () => {
  test('assert mentionsZaps', async () => {
    const store = new EditorStore({})
    const editor = createEditor(store)
    editor.commands.insertNProfile({
      nprofile: 'nprofile1qqsy583gx72tyjfrl34t6umk54pywzz9c5y4s3zdf7956lth8yt7ycsf4hjc4',
    })
    editor.commands.insertNProfile({
      nprofile: 'nprofile1qqsvvcpmpuwvlmrztkwq3d6nunmhf6hh688jw6fzxyjmtl2d5u5qr8sduyukt',
    })
    store.setEditor(editor)

    const pubkey1 = '4a1e283794b24923fc6abd7376a542470845c50958444d4f8b4d7d773917e262'
    const pubkey2 = 'c6603b0f1ccfec625d9c08b753e4f774eaf7d1cf2769223125b5fd4da728019e'
    const pubkey3 = '6fe283e7e1d5c89d22931b17c59a2f403811de50adf164e54596172f48748fa2'

    expect(store.zapSplitsList).toStrictEqual([
      [pubkey1, 50],
      [pubkey2, 50],
    ])

    editor.commands.insertNProfile({
      nprofile: 'nprofile1qqsxlc5rulsatjyay2f3k979ngh5qwq3meg2mutyu4zev9e0fp6glgs92ag38',
    })

    expect(store.zapSplitsList).toStrictEqual([
      [pubkey1, 33],
      [pubkey2, 33],
      [pubkey3, 33],
    ])

    store.updateZapSplit(pubkey1, 90)
    expect(store.zapSplitsList).toStrictEqual([
      [pubkey1, 90],
      [pubkey2, 0],
      [pubkey3, 10],
    ])
    store.updateZapSplit(pubkey1, 100)
    store.updateZapSplit(pubkey2, 90)
    expect(store.zapSplitsList).toStrictEqual([
      [pubkey1, 10],
      [pubkey2, 90],
      [pubkey3, 0],
    ])

    store.updateZapSplit(pubkey1, 33)
    store.updateZapSplit(pubkey2, 33)
    store.updateZapSplit(pubkey3, 33)
    expect(store.zapSplitsList).toStrictEqual([
      [pubkey1, 33],
      [pubkey2, 33],
      [pubkey3, 33],
    ])

    store.updateZapSplit(pubkey3, 10)
    expect(store.zapSplitsList).toStrictEqual([
      [pubkey1, 33],
      [pubkey2, 57],
      [pubkey3, 10],
    ])

    store.updateZapSplit(pubkey3, 0)
    expect(store.zapSplitsList).toStrictEqual([
      [pubkey1, 43],
      [pubkey2, 57],
      [pubkey3, 0],
    ])

    store.updateZapSplit(pubkey2, 90)
    expect(store.zapSplitsList).toStrictEqual([
      [pubkey1, 10],
      [pubkey2, 90],
      [pubkey3, 0],
    ])
    //
    store.updateZapSplit(pubkey2, 10)
    expect(store.zapSplitsList).toStrictEqual([
      [pubkey1, 10],
      [pubkey2, 10],
      [pubkey3, 80],
    ])
  })
})
