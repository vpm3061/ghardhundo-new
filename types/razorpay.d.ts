declare module 'razorpay' {
  interface RazorpayOptions {
    key_id: string
    key_secret: string
  }

  interface OrderOptions {
    amount: number
    currency: string
    notes?: Record<string, string>
  }

  class Razorpay {
    constructor(options: RazorpayOptions)
    orders: {
      create(options: OrderOptions): Promise<{ id: string; amount: number }>
    }
  }

  export = Razorpay
}

interface Window {
  Razorpay: new (options: {
    key: string
    amount: number
    currency: string
    name: string
    description: string
    order_id: string
    prefill?: {
      name?: string
      email?: string
      contact?: string
    }
    theme?: { color: string }
    handler: (response: {
      razorpay_order_id: string
      razorpay_payment_id: string
      razorpay_signature: string
    }) => void
  }) => { open: () => void }
}
