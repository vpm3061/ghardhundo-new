'use client'
import { useId, useRef } from 'react'
import { useRouter } from 'next/navigation'
import LeadForm from '@/components/LeadForm'

export default function VisitBookingModal({ propertyId, propertyTitle, userId }: { propertyId: string; propertyTitle: string; userId: string | null }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const router = useRouter()
  function open() {
    if (!userId) { router.push('/login?redirect=' + encodeURIComponent(window.location.pathname)); return }
    dialog.current?.showModal()
  }
  return <>
    <button onClick={open} className="mb-4 w-full rounded-xl bg-orange-500 px-4 py-3.5 text-sm font-bold text-white hover:bg-orange-600">Book Site Visit</button>
    <dialog ref={dialog} aria-labelledby={titleId} className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-2xl bg-white p-0 shadow-xl backdrop:bg-black/50">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 p-4">
        <h2 id={titleId} className="font-bold text-slate-800">Book a Site Visit</h2>
        <button type="button" autoFocus aria-label="Close booking" onClick={() => dialog.current?.close()} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">Close</button>
      </div>
      <div className="p-4"><LeadForm propertyId={propertyId} propertyTitle={propertyTitle} userId={userId} /></div>
    </dialog>
  </>
}
