'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'

interface Props {
  amount: number
  plan: string
  role: 'dealer' | 'builder' | 'expert'
  label: string
  free?: boolean
  className?: string
  /** Called after payment verification succeeds, before the default redirect. */
  onVerified?: () => void | Promise<void>
  /** Overrides the default role-based redirect after a successful payment.
   *  Pass `false` to stay on the current page (e.g. when onVerified already
   *  handles moving the user forward, like advancing a wizard step). */
  redirectTo?: string | false
}


export default function RazorpayButton({ amount, plan, role, label, free, className, onVerified, redirectTo }: Props) {
  const [loading, setLoading] = useState(false)

  const handleFree = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/set-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      })
      if (res.status === 401) { window.location.href = '/login?redirect=/pricing'; return }
      if (!res.ok) throw new Error('Could not activate account')
      toast.success('Account activated!')
      setTimeout(() => { window.location.href = `/${role}` }, 1000)
    } catch (e: any) {
      toast.error(e.message || 'Error activating account')
    } finally {
      setLoading(false)
    }
  }

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) { resolve(true); return }
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handlePayment = async () => {
    setLoading(true)
    try {
      const loaded = await loadRazorpay()
      if (!loaded) {
        toast.error('Payment system load nahi hua. Internet check karo.')
        return
      }

      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, plan, role })
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `Server error (${res.status})` }))
        toast.error(err.error || `Order create nahi hua (status ${res.status})`)
        console.error('RazorpayButton: create-order failed', res.status, err)
        return
      }

      const { orderId, key, name } = await res.json()

      if (!key || !orderId) {
        toast.error('Payment setup incomplete — Razorpay key missing on server. Contact support.')
        console.error('RazorpayButton: missing key/orderId from create-order response', { key, orderId })
        return
      }

      const options = {
        key,
        amount: amount * 100,
        currency: 'INR',
        name: 'Orenzaa',
        description: `${plan} Plan`,
        order_id: orderId,
        prefill: { name: name || '' },
        theme: { color: '#FB923C' },
        handler: async (response: any) => {
          try {
            const verify = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan,
                role,
                amount
              })
            })
            const result = await verify.json()
            if (result.success) {
              toast.success('Payment successful!')
              if (onVerified) await onVerified()
              if (redirectTo !== false) {
                setTimeout(() => {
                  window.location.href = redirectTo || (role === 'dealer' ? '/dealer' : role === 'expert' ? '/expert' : '/builder')
                }, 1500)
              }
            } else {
              toast.error('Payment verify nahi hua. Support se contact karo.')
            }
          } catch {
            toast.error('Verification failed')
          }
        },
        modal: {
          ondismiss: () => {
            toast('Payment cancelled', { icon: '⚠️' })
          }
        }
      }

      const rzp = new window.Razorpay(options)
      rzp.open()

    } catch (e) {
      const detail = e instanceof Error ? e.message : String(e)
      toast.error(`Kuch problem hua: ${detail}`)
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={free ? handleFree : handlePayment}
      disabled={loading}
      className={className || 'w-full py-3 bg-[#FB923C] hover:bg-[#F59E0B] text-white font-bold rounded-xl transition-all disabled:opacity-50'}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          Processing...
        </span>
      ) : label}
    </button>
  )
}
