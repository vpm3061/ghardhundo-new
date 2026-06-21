'use client'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  plan: string
  role: 'dealer' | 'builder'
  amountRupees: number
  label: string
  free?: boolean        /* Basic builder plan — no payment, just set role */
  className?: string
  style?: React.CSSProperties
}

export default function RazorpayButton({ plan, role, amountRupees, label, free, className, style }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const router = useRouter()

  const handleFree = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/set-role', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ role }),
      })
      if (res.status === 401) { router.push(`/login?redirect=/pricing`); return }
      if (!res.ok) throw new Error('Could not activate account')
      router.push(`/${role}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error')
    } finally {
      setLoading(false)
    }
  }, [role, router])

  const handlePay = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/create-order', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ plan, role }),
      })
      if (res.status === 401) { router.push(`/login?redirect=/pricing`); return }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error((body as { error?: string }).error || 'Could not create order')
      }
      const { orderId, keyId } = await res.json() as { orderId: string; keyId: string }

      if (!window.Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement('script')
          s.src = 'https://checkout.razorpay.com/v1/checkout.js'
          s.onload = () => resolve()
          s.onerror = () => reject(new Error('Could not load payment gateway'))
          document.head.appendChild(s)
        })
      }

      const rzp = new window.Razorpay({
        key:         keyId,
        amount:      amountRupees * 100,
        currency:    'INR',
        name:        'Orenzaa',
        description: `${plan} ${role === 'dealer' ? 'Dealer' : 'Builder'} Plan — 1 month`,
        order_id:    orderId,
        theme:       { color: '#FB923C' },
        handler: async (response) => {
          const vRes = await fetch('/api/verify-payment', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ ...response, plan, role }),
          })
          if (vRes.ok) {
            router.push(`/${role}?welcome=1`)
          } else {
            setError('Payment received but activation failed. Contact support.')
          }
        },
      })
      rzp.open()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Payment failed')
    } finally {
      setLoading(false)
    }
  }, [plan, role, amountRupees, router])

  return (
    <div className="flex flex-col gap-1.5">
      <button
        onClick={free ? handleFree : handlePay}
        disabled={loading}
        className={className}
        style={style}
        suppressHydrationWarning
      >
        {loading ? 'Please wait…' : label}
      </button>
      {error && (
        <p className="text-[11px] text-center leading-tight" style={{ color: '#F87171' }}>{error}</p>
      )}
    </div>
  )
}
