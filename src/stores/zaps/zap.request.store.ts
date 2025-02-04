import { makeAutoObservable } from 'mobx'
import { toggle } from '../helpers/toggle'

export type ZapRequestStore = ReturnType<typeof createZapRequestStore>

export const createZapRequestStore = () => {
  return makeAutoObservable({
    amount: 21,
    custom: toggle(false),
    comment: '',
    invoice: '',

    setAmount(amount: number) {
      this.amount = amount
    },

    setComment(comment: string) {
      this.comment = comment
    },

    setInvoice(invoice: string) {
      this.invoice = invoice
    },
  })
}
