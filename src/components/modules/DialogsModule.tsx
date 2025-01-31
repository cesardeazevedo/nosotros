import { CameraDialog } from 'components/dialogs/camera.dialog'
import { ImagesDialog } from 'components/dialogs/images.dialog'
import { QRCodeDialog } from 'components/dialogs/qrcode.dialog'
import { SignInDialog } from 'components/dialogs/signin.dialog'
import React from 'react'
import { EditorDialog } from '../dialogs/editor.dialog'
import { EditorQuoteDialog } from '../dialogs/editor.quote.dialog'
import { EditorReplyDialog } from '../dialogs/editor.reply.dialog'
import { NoteStatsDialog } from '../dialogs/notestats.dialog'
import { ZapDialog } from '../dialogs/zap.dialog'
import { ZapRequestInvoiceDialog } from '../dialogs/zapinvoice.dialog'
import { SignUpResponseDialog } from '../dialogs/signup.response.dialog'

export const Dialogs = React.memo(function Dialogs() {
  return (
    <>
      <SignInDialog />
      <CameraDialog />
      <ImagesDialog />
      <QRCodeDialog />
      <SignUpResponseDialog />
      <ZapDialog />
      <ZapRequestInvoiceDialog />
      <EditorDialog />
      <EditorQuoteDialog />
      <EditorReplyDialog />
      <NoteStatsDialog />
    </>
  )
})
